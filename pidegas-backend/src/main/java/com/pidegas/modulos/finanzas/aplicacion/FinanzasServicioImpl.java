package com.pidegas.modulos.finanzas.aplicacion;

import com.pidegas.modulos.finanzas.dominio.*;
import com.pidegas.modulos.finanzas.dto.*;
import com.pidegas.modulos.finanzas.pasarela.PasarelaPagos;
import com.pidegas.modulos.finanzas.pasarela.ResultadoProcesamientoPago;
import com.pidegas.modulos.finanzas.pasarela.SolicitudPago;
import com.pidegas.modulos.finanzas.repositorio.ComisionRepositorio;
import com.pidegas.modulos.finanzas.repositorio.LiquidacionRepositorio;
import com.pidegas.modulos.finanzas.repositorio.PagoRepositorio;
import com.pidegas.modulos.finanzas.sunat.FacturadorElectronico;
import com.pidegas.modulos.finanzas.sunat.SolicitudComprobante;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.EstadoPago;
import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class FinanzasServicioImpl implements FinanzasServicio {

    private static final Logger log = LoggerFactory.getLogger(FinanzasServicioImpl.class);
    private static final BigDecimal PORCENTAJE_COMISION_PLATAFORMA = new BigDecimal("5.00");

    private final PagoRepositorio pagoRepositorio;
    private final ComisionRepositorio comisionRepositorio;
    private final LiquidacionRepositorio liquidacionRepositorio;
    private final PedidoRepositorio pedidoRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final PasarelaPagos pasarelaPagos;
    private final FacturadorElectronico facturadorElectronico;

    public FinanzasServicioImpl(
            PagoRepositorio pagoRepositorio,
            ComisionRepositorio comisionRepositorio,
            LiquidacionRepositorio liquidacionRepositorio,
            PedidoRepositorio pedidoRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            PasarelaPagos pasarelaPagos,
            FacturadorElectronico facturadorElectronico) {
        this.pagoRepositorio = pagoRepositorio;
        this.comisionRepositorio = comisionRepositorio;
        this.liquidacionRepositorio = liquidacionRepositorio;
        this.pedidoRepositorio = pedidoRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.pasarelaPagos = pasarelaPagos;
        this.facturadorElectronico = facturadorElectronico;
    }

    @Override
    @Transactional
    public ResultadoProcesamientoPago procesarPagoPedido(ProcesarPagoDto dto, Long clienteId) {
        Pedido pedido = pedidoRepositorio.findByPublicId(dto.pedidoPublicId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + dto.pedidoPublicId()));

        if (!pedido.getClienteId().equals(clienteId)) {
            throw new AccessDeniedException("No tienes autorización para pagar este pedido.");
        }

        if (pedido.getEstadoPago() == EstadoPago.PAGADO) {
            return ResultadoProcesamientoPago.exitoso(
                    "PAGADO_PREVIO",
                    "AUTH-ALREADY-PAID",
                    "El pedido ya se encuentra completamente pagado.",
                    "{}"
            );
        }

        SolicitudPago solicitud = new SolicitudPago(
                pedido.getPublicId(),
                pedido.getTotal(),
                dto.metodoPago(),
                dto.telefonoYapePlin(),
                dto.tokenTarjeta(),
                dto.nombreTitular()
        );

        ResultadoProcesamientoPago resultado = pasarelaPagos.procesarPago(solicitud);

        Pago pago = new Pago(
                pedido.getTenantId(),
                pedido.getId(),
                clienteId,
                pedido.getTotal(),
                dto.metodoPago()
        );

        if (resultado.exitoso()) {
            pago.aprobar(resultado.referenciaTransaccion(), resultado.codigoAutorizacion(), resultado.metadata());
            pago = pagoRepositorio.save(pago);

            pedido.setEstadoPago(EstadoPago.PAGADO);
            pedido.setMetodoPago(dto.metodoPago());
            pedidoRepositorio.save(pedido);

            // Generar comisión para PideGas
            if (!comisionRepositorio.existsByPedidoId(pedido.getId())) {
                Comision comision = new Comision(
                        pedido.getTenantId(),
                        pedido.getId(),
                        pago.getId(),
                        pedido.getTotal(),
                        PORCENTAJE_COMISION_PLATAFORMA
                );
                comisionRepositorio.save(comision);
                log.info("Comisión de S/ {} registrada para pedido {} (Tenant {})",
                        comision.getMontoComision(), pedido.getPublicId(), pedido.getTenantId());
            }

            // Simulación emisión de comprobante electrónico (SUNAT)
            Usuario cliente = usuarioRepositorio.findById(clienteId).orElse(null);
            String docReceptor = cliente != null && cliente.getTelefono() != null ? cliente.getTelefono() : "00000000";
            String nombreReceptor = cliente != null ? cliente.getNombres() + " " + cliente.getApellidos() : "Cliente PideGas";
            BigDecimal subtotal = pedido.getTotal().divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
            BigDecimal igv = pedido.getTotal().subtract(subtotal);

            facturadorElectronico.emitirComprobante(new SolicitudComprobante(
                    pedido.getPublicId(),
                    "BOLETA",
                    docReceptor,
                    nombreReceptor,
                    subtotal,
                    igv,
                    pedido.getTotal()
            ));

            log.info("Pago de pedido {} aprobado exitosamente con referencia {}", pedido.getPublicId(), resultado.referenciaTransaccion());
        } else {
            pago.rechazar(resultado.mensaje());
            pagoRepositorio.save(pago);
            log.warn("Pago rechazado para pedido {}: {}", pedido.getPublicId(), resultado.mensaje());
        }

        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenFinancieroDto obtenerResumenFinanciero(Long tenantId) {
        BigDecimal totalVentas = pagoRepositorio.sumMontoAprobadoByTenantId(tenantId);
        BigDecimal totalComisiones = comisionRepositorio.sumMontoComisionByTenantId(tenantId);
        BigDecimal comisionesPendientes = comisionRepositorio.sumMontoComisionPendienteByTenantId(tenantId);
        BigDecimal totalPorLiquidar = totalVentas.subtract(totalComisiones).max(BigDecimal.ZERO);
        long pedidosPagados = pagoRepositorio.countByTenantIdAndEstado(tenantId, EstadoTransaccionPago.APROBADO);
        List<PagoDetalleDto> ultimosPagos = listarPagosPorEmpresa(tenantId).stream().limit(10).toList();

        return new ResumenFinancieroDto(
                totalVentas,
                totalComisiones,
                comisionesPendientes,
                totalPorLiquidar,
                pedidosPagados,
                ultimosPagos
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PagoDetalleDto> listarPagosPorEmpresa(Long tenantId) {
        return pagoRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapearAPagoDetalleDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiquidacionDto> listarLiquidaciones(Long tenantId) {
        return liquidacionRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapearALiquidacionDto)
                .toList();
    }

    @Override
    @Transactional
    public LiquidacionDto generarLiquidacion(GenerarLiquidacionDto dto, Long tenantId) {
        OffsetDateTime inicio = dto != null && dto.periodoInicio() != null
                ? dto.periodoInicio()
                : OffsetDateTime.now().minusDays(15);
        OffsetDateTime fin = dto != null && dto.periodoFin() != null
                ? dto.periodoFin()
                : OffsetDateTime.now();

        BigDecimal ventas = pagoRepositorio.sumMontoAprobadoByTenantId(tenantId);
        BigDecimal comisiones = comisionRepositorio.sumMontoComisionPendienteByTenantId(tenantId);

        Liquidacion liquidacion = new Liquidacion(tenantId, inicio, fin, ventas, comisiones);
        liquidacion.marcarComoPagada("TRANSF-BCP-" + System.currentTimeMillis());
        liquidacion = liquidacionRepositorio.save(liquidacion);

        List<Comision> pendientes = comisionRepositorio.findByTenantIdAndEstado(tenantId, EstadoComision.PENDIENTE);
        for (Comision c : pendientes) {
            c.marcarComoLiquidada();
            comisionRepositorio.save(c);
        }

        log.info("Liquidación generada con éxito para tenant {}: total ventas S/ {}, comisiones S/ {}, liquidado S/ {}",
                tenantId, ventas, comisiones, liquidacion.getTotalALiquidar());

        return mapearALiquidacionDto(liquidacion);
    }

    @Override
    @Transactional
    public void registrarPagoContraEntregaSiAplica(Pedido pedido) {
        if (pedido.getMetodoPago() == MetodoPago.EFECTIVO && pedido.getEstadoPago() != EstadoPago.PAGADO) {
            pedido.setEstadoPago(EstadoPago.PAGADO);
            pedidoRepositorio.save(pedido);

            Pago pago = new Pago(
                    pedido.getTenantId(),
                    pedido.getId(),
                    pedido.getClienteId(),
                    pedido.getTotal(),
                    MetodoPago.EFECTIVO
            );
            pago.aprobar(
                    "EFEC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    "CASH-DELIVERED",
                    "Pago contra entrega liquidado al repartidor."
            );
            pago = pagoRepositorio.save(pago);

            if (!comisionRepositorio.existsByPedidoId(pedido.getId())) {
                Comision comision = new Comision(
                        pedido.getTenantId(),
                        pedido.getId(),
                        pago.getId(),
                        pedido.getTotal(),
                        PORCENTAJE_COMISION_PLATAFORMA
                );
                comisionRepositorio.save(comision);
                log.info("Comisión de pago en efectivo registrada para pedido {}", pedido.getPublicId());
            }
        }
    }

    private PagoDetalleDto mapearAPagoDetalleDto(Pago pago) {
        UUID pedidoPublicId = pedidoRepositorio.findById(pago.getPedidoId())
                .map(Pedido::getPublicId)
                .orElse(null);

        return new PagoDetalleDto(
                pago.getPublicId(),
                pedidoPublicId,
                pago.getTenantId(),
                pago.getMonto(),
                pago.getMetodoPago(),
                pago.getEstado(),
                pago.getReferenciaTransaccion(),
                pago.getCodigoAutorizacion(),
                pago.getCreatedAt()
        );
    }

    private LiquidacionDto mapearALiquidacionDto(Liquidacion l) {
        return new LiquidacionDto(
                l.getPublicId(),
                l.getPeriodoInicio(),
                l.getPeriodoFin(),
                l.getTotalVentas(),
                l.getTotalComisiones(),
                l.getTotalALiquidar(),
                l.getEstado(),
                l.getReferenciaBancaria(),
                l.getFechaPago(),
                l.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportarReporteFinancieroCsv(Long tenantId) {
        ResumenFinancieroDto resumen = obtenerResumenFinanciero(tenantId);
        List<PagoDetalleDto> pagos = listarPagosPorEmpresa(tenantId);
        List<LiquidacionDto> liquidaciones = listarLiquidaciones(tenantId);

        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM para apertura nativa e inmediata en Microsoft Excel
        sb.append('\uFEFF');

        sb.append("========================================================================\n");
        sb.append("PIDEGAS - REPORTE FINANCIERO Y MOVIMIENTOS DE DISTRIBUIDORA\n");
        sb.append("========================================================================\n");
        sb.append("Tenant ID:,").append(tenantId).append("\n");
        sb.append("Fecha de Descarga:,").append(OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        sb.append("Total Ventas Aprobadas:,\"S/ ").append(resumen.totalVentasAprobadas()).append("\"\n");
        sb.append("Total Comisiones PideGas (5%):,\"S/ ").append(resumen.totalComisiones()).append("\"\n");
        sb.append("Comisiones Pendientes:,\"S/ ").append(resumen.comisionesPendientes()).append("\"\n");
        sb.append("Saldo Neto Disponible por Liquidar:,\"S/ ").append(resumen.totalPorLiquidar()).append("\"\n");
        sb.append("Total Pedidos Pagados:,").append(resumen.pedidosPagados()).append("\n\n");

        sb.append("--- DETALLE DE TRANSACCIONES DE PAGO ---\n");
        sb.append("Fecha,ID Transaccion,ID Pedido,Metodo Pago,Monto (S/),Referencia,Codigo Autorizacion,Estado\n");
        for (PagoDetalleDto p : pagos) {
            sb.append("\"").append(p.createdAt()).append("\",");
            sb.append("\"").append(p.publicId()).append("\",");
            sb.append("\"").append(p.pedidoPublicId() != null ? p.pedidoPublicId().toString() : "").append("\",");
            sb.append("\"").append(p.metodoPago()).append("\",");
            sb.append(p.monto()).append(",");
            sb.append("\"").append(p.referenciaTransaccion() != null ? p.referenciaTransaccion() : "").append("\",");
            sb.append("\"").append(p.codigoAutorizacion() != null ? p.codigoAutorizacion() : "").append("\",");
            sb.append("\"").append(p.estado()).append("\"\n");
        }

        sb.append("\n--- HISTORIAL DE LIQUIDACIONES BANCARIAS ---\n");
        sb.append("Fecha Emision,ID Liquidacion,Periodo Inicio,Periodo Fin,Total Ventas (S/),Comisiones (S/),Monto Liquidado (S/),Referencia Bancaria,Estado\n");
        for (LiquidacionDto l : liquidaciones) {
            sb.append("\"").append(l.createdAt()).append("\",");
            sb.append("\"").append(l.publicId()).append("\",");
            sb.append("\"").append(l.periodoInicio()).append("\",");
            sb.append("\"").append(l.periodoFin()).append("\",");
            sb.append(l.totalVentas()).append(",");
            sb.append(l.totalComisiones()).append(",");
            sb.append(l.totalALiquidar()).append(",");
            sb.append("\"").append(l.referenciaBancaria() != null ? l.referenciaBancaria() : "").append("\",");
            sb.append("\"").append(l.estado()).append("\"\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
