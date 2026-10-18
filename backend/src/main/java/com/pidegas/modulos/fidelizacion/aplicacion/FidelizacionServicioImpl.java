package com.pidegas.modulos.fidelizacion.aplicacion;

import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.fidelizacion.dominio.*;
import com.pidegas.modulos.fidelizacion.dto.*;
import com.pidegas.modulos.fidelizacion.repositorio.BilleteraPuntosRepositorio;
import com.pidegas.modulos.fidelizacion.repositorio.CuponRepositorio;
import com.pidegas.modulos.fidelizacion.repositorio.MovimientoPuntosRepositorio;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FidelizacionServicioImpl implements FidelizacionServicio {

    private static final Logger log = LoggerFactory.getLogger(FidelizacionServicioImpl.class);

    private final BilleteraPuntosRepositorio billeteraPuntosRepositorio;
    private final MovimientoPuntosRepositorio movimientoPuntosRepositorio;
    private final CuponRepositorio cuponRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final EmpresaRepositorio empresaRepositorio;

    public FidelizacionServicioImpl(
            BilleteraPuntosRepositorio billeteraPuntosRepositorio,
            MovimientoPuntosRepositorio movimientoPuntosRepositorio,
            CuponRepositorio cuponRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            EmpresaRepositorio empresaRepositorio
    ) {
        this.billeteraPuntosRepositorio = billeteraPuntosRepositorio;
        this.movimientoPuntosRepositorio = movimientoPuntosRepositorio;
        this.cuponRepositorio = cuponRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.empresaRepositorio = empresaRepositorio;
    }

    private Long obtenerTenantIdRequerido() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("Operación no permitida: contexto multi-tenant no establecido.");
        }
        return tenantId;
    }

    // --- BILLETERA DE PUNTOS ---

    @Override
    public BilleteraPuntosDto obtenerBilleteraCliente(String emailCliente) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailCliente)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado."));

        BilleteraPuntos billetera = billeteraPuntosRepositorio.findByClienteId(cliente.getId())
                .orElseGet(() -> billeteraPuntosRepositorio.save(new BilleteraPuntos(cliente.getId())));

        return new BilleteraPuntosDto(
                billetera.getId(),
                cliente.getPublicId(),
                cliente.getNombres() + " " + cliente.getApellidos(),
                billetera.getSaldoPuntos(),
                billetera.getUpdatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoPuntosDto> obtenerMovimientosPuntos(String emailCliente) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailCliente)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado."));

        BilleteraPuntos billetera = billeteraPuntosRepositorio.findByClienteId(cliente.getId())
                .orElse(null);

        if (billetera == null) return List.of();

        return movimientoPuntosRepositorio.findByBilleteraIdOrderByCreatedAtDesc(billetera.getId())
                .stream()
                .map(m -> new MovimientoPuntosDto(
                        m.getId(),
                        m.getTipoMovimiento(),
                        m.getPuntos(),
                        m.getSaldoResultante(),
                        m.getMotivo(),
                        null,
                        m.getCreatedAt()
                ))
                .toList();
    }

    /**
     * Regla de negocio de fidelización:
     * Por cada compra de balón de gas de cocina completada, el cliente acumula 1 punto por cada S/ 5 gastados (mínimo 10 puntos).
     */
    @Override
    public void acumularPuntosPorPedido(Pedido pedido) {
        if (pedido.getClienteId() == null) return;

        BilleteraPuntos billetera = billeteraPuntosRepositorio.findByClienteId(pedido.getClienteId())
                .orElseGet(() -> billeteraPuntosRepositorio.save(new BilleteraPuntos(pedido.getClienteId())));

        BigDecimal total = pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO;
        int puntosCalculados = Math.max(10, total.divide(new BigDecimal("5"), 0, java.math.RoundingMode.FLOOR).intValue());

        int nuevoSaldo = billetera.getSaldoPuntos() + puntosCalculados;
        billetera.setSaldoPuntos(nuevoSaldo);
        billeteraPuntosRepositorio.save(billetera);

        MovimientoPuntos movimiento = new MovimientoPuntos(
                billetera.getId(),
                pedido.getId(),
                TipoMovimientoPuntos.ACUMULACION,
                puntosCalculados,
                nuevoSaldo,
                "Puntos acumulados por pedido de balón de gas #PG-" + pedido.getPublicId().toString().substring(0, 8)
        );
        movimientoPuntosRepositorio.save(movimiento);

        log.info("Cliente ID {} acumuló {} puntos por pedido {}. Nuevo saldo: {}",
                pedido.getClienteId(), puntosCalculados, pedido.getPublicId(), nuevoSaldo);
    }

    // --- PROMOCIONES Y CUPONES DE DESCUENTO ---

    @Override
    @Transactional(readOnly = true)
    public ResultadoValidacionCuponDto validarCupon(ValidarCuponDto dto) {
        Long tenantId = null;
        if (dto.empresaPublicId() != null) {
            Empresa emp = empresaRepositorio.findByPublicId(dto.empresaPublicId()).orElse(null);
            if (emp != null) tenantId = emp.getId();
        }

        List<Cupon> cupones = cuponRepositorio.findByCodigoValido(dto.codigo().trim(), tenantId);
        if (cupones.isEmpty()) {
            return new ResultadoValidacionCuponDto(
                    false,
                    dto.codigo(),
                    BigDecimal.ZERO,
                    dto.subtotal(),
                    "El cupón ingresado no existe o ha expirado."
            );
        }

        Cupon cupon = cupones.get(0);
        if (!cupon.esValido(dto.subtotal())) {
            if (dto.subtotal().compareTo(cupon.getPedidoMinimo()) < 0) {
                return new ResultadoValidacionCuponDto(
                        false,
                        cupon.getCodigo(),
                        BigDecimal.ZERO,
                        dto.subtotal(),
                        "El pedido mínimo para aplicar este cupón es de S/ " + cupon.getPedidoMinimo()
                );
            }
            return new ResultadoValidacionCuponDto(
                    false,
                    cupon.getCodigo(),
                    BigDecimal.ZERO,
                    dto.subtotal(),
                    "El cupón no se encuentra activo o ha superado el límite de usos permitidos."
            );
        }

        BigDecimal descuento = cupon.calcularDescuento(dto.subtotal());
        BigDecimal nuevoTotal = dto.subtotal().subtract(descuento).max(BigDecimal.ZERO);

        return new ResultadoValidacionCuponDto(
                true,
                cupon.getCodigo(),
                descuento,
                nuevoTotal,
                "¡Cupón aplicado exitosamente! Ahorraste S/ " + descuento
        );
    }

    @Override
    public CuponDetalleDto crearCupon(CrearCuponDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        String codigoUpper = dto.codigo().toUpperCase().trim();

        if (cuponRepositorio.existsByTenantIdAndCodigoIgnoreCase(tenantId, codigoUpper)) {
            throw new IllegalArgumentException("Ya existe un cupón con el código '" + codigoUpper + "' para su empresa.");
        }

        Cupon cupon = new Cupon(
                tenantId,
                codigoUpper,
                dto.tipoDescuento(),
                dto.valorDescuento(),
                dto.pedidoMinimo(),
                dto.usosMaximos(),
                dto.validoDesde(),
                dto.validoHasta()
        );
        Cupon guardado = cuponRepositorio.save(cupon);
        log.info("Nuevo cupón promocional creado para tenant {}: '{}'", tenantId, guardado.getCodigo());

        return mapearCuponDto(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CuponDetalleDto> listarCuponesEmpresa() {
        Long tenantId = obtenerTenantIdRequerido();
        return cuponRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapearCuponDto)
                .toList();
    }

    private CuponDetalleDto mapearCuponDto(Cupon c) {
        return new CuponDetalleDto(
                c.getPublicId(),
                c.getTenantId(),
                c.getCodigo(),
                c.getTipoDescuento(),
                c.getValorDescuento(),
                c.getPedidoMinimo(),
                c.getUsosMaximos(),
                c.getUsosActuales(),
                c.getValidoDesde(),
                c.getValidoHasta(),
                c.getActivo()
        );
    }
}
