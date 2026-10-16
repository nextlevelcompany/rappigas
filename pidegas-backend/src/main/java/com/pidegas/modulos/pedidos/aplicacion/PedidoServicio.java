package com.pidegas.modulos.pedidos.aplicacion;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import com.pidegas.modulos.cobertura.infraestructura.ZonaCoberturaRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.flota.dominio.EstadoRepartidor;
import com.pidegas.modulos.flota.dominio.Repartidor;
import com.pidegas.modulos.flota.dominio.Vehiculo;
import com.pidegas.modulos.flota.repositorio.RepartidorRepositorio;
import com.pidegas.modulos.flota.repositorio.VehiculoRepositorio;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.*;
import com.pidegas.modulos.pedidos.dto.*;
import com.pidegas.modulos.pedidos.repositorio.DetallePedidoRepositorio;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import com.pidegas.nucleo.websocket.NotificacionWebSocketServicio;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class PedidoServicio {

    private static final Logger log = LoggerFactory.getLogger(PedidoServicio.class);

    private final PedidoRepositorio pedidoRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final ZonaCoberturaRepositorio zonaCoberturaRepositorio;
    private final RepartidorRepositorio repartidorRepositorio;
    private final VehiculoRepositorio vehiculoRepositorio;
    private final NotificacionWebSocketServicio notificacionWebSocketServicio;
    private final com.pidegas.modulos.inventario.aplicacion.InventarioServicio inventarioServicio;
    private final com.pidegas.modulos.fidelizacion.aplicacion.FidelizacionServicio fidelizacionServicio;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.pidegas.modulos.finanzas.aplicacion.FinanzasServicio finanzasServicio;

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final SecureRandom secureRandom = new SecureRandom();

    public PedidoServicio(
            PedidoRepositorio pedidoRepositorio,
            DetallePedidoRepositorio detallePedidoRepositorio,
            ProductoRepositorio productoRepositorio,
            EmpresaRepositorio empresaRepositorio,
            UsuarioRepositorio usuarioRepositorio,
            ZonaCoberturaRepositorio zonaCoberturaRepositorio,
            RepartidorRepositorio repartidorRepositorio,
            VehiculoRepositorio vehiculoRepositorio,
            NotificacionWebSocketServicio notificacionWebSocketServicio,
            com.pidegas.modulos.inventario.aplicacion.InventarioServicio inventarioServicio,
            com.pidegas.modulos.fidelizacion.aplicacion.FidelizacionServicio fidelizacionServicio
    ) {
        this.pedidoRepositorio = pedidoRepositorio;
        this.detallePedidoRepositorio = detallePedidoRepositorio;
        this.productoRepositorio = productoRepositorio;
        this.empresaRepositorio = empresaRepositorio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.zonaCoberturaRepositorio = zonaCoberturaRepositorio;
        this.repartidorRepositorio = repartidorRepositorio;
        this.vehiculoRepositorio = vehiculoRepositorio;
        this.notificacionWebSocketServicio = notificacionWebSocketServicio;
        this.inventarioServicio = inventarioServicio;
        this.fidelizacionServicio = fidelizacionServicio;
    }

    /**
     * Crea un nuevo pedido para el cliente autenticado.
     * Valida cobertura PostGIS en tiempo real, verifica catálogo del tenant y notifica vía WebSocket.
     */
    public PedidoDetalleDto crearPedidoCliente(CrearPedidoDto dto, String emailUsuarioActual) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailUsuarioActual)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado o no encontrado."));

        Empresa empresa = empresaRepositorio.findByPublicId(dto.empresaPublicId())
                .orElseThrow(() -> new IllegalArgumentException("La empresa distribuidora seleccionada no existe."));

        if (empresa.getEstado() != EstadoEmpresa.APROBADA) {
            throw new IllegalArgumentException("La distribuidora seleccionada no está disponible para recibir pedidos actualmente.");
        }

        // Validación espacial PostGIS
        List<ZonaCobertura> zonasCubiertas = zonaCoberturaRepositorio.buscarZonasTenantQueCubrenPunto(
                empresa.getId(),
                dto.longitud(),
                dto.latitud()
        );

        if (zonasCubiertas.isEmpty()) {
            throw new IllegalArgumentException(
                    "Lo sentimos, la dirección de entrega (" + dto.direccionEntrega() +
                    ") se encuentra fuera de la zona de cobertura de " + empresa.getNombreComercial() + "."
            );
        }

        if (dto.items() == null || dto.items().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe contener al menos un producto.");
        }

        // Construir detalles del pedido y calcular total
        BigDecimal subtotalAcumulado = BigDecimal.ZERO;
        List<DetallePedido> detallesParaGuardar = new ArrayList<>();

        for (ItemPedidoDto itemDto : dto.items()) {
            Producto producto = productoRepositorio.findByPublicIdAndTenantId(itemDto.productoPublicId(), empresa.getId())
                    .orElseThrow(() -> new IllegalArgumentException("El producto solicitado no existe o no pertenece a la distribuidora."));

            if (producto.getEstado() != EstadoProducto.ACTIVO) {
                throw new IllegalArgumentException("El producto '" + producto.getNombre() + "' no se encuentra disponible.");
            }

            BigDecimal itemSubtotal = producto.getPrecio().multiply(BigDecimal.valueOf(itemDto.cantidad()));
            subtotalAcumulado = subtotalAcumulado.add(itemSubtotal);

            DetallePedido detalle = new DetallePedido(null, producto, itemDto.cantidad(), producto.getPrecio(), itemSubtotal);
            detallesParaGuardar.add(detalle);
        }

        Point puntoEntrega = geometryFactory.createPoint(new Coordinate(dto.longitud(), dto.latitud()));
        puntoEntrega.setSRID(4326);

        String codigoConfirmacion = String.format("%06d", secureRandom.nextInt(1000000));

        Pedido pedido = new Pedido(
                empresa.getId(),
                cliente.getId(),
                subtotalAcumulado,
                BigDecimal.ZERO,
                subtotalAcumulado,
                dto.metodoPago(),
                dto.direccionEntrega(),
                dto.referenciaDireccion(),
                puntoEntrega,
                dto.notasCliente(),
                codigoConfirmacion
        );

        Pedido pedidoGuardado = pedidoRepositorio.save(pedido);

        for (DetallePedido det : detallesParaGuardar) {
            det.setPedido(pedidoGuardado);
        }
        detallePedidoRepositorio.saveAll(detallesParaGuardar);
        pedidoGuardado.setDetalles(detallesParaGuardar);

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoGuardado, empresa, cliente, detallesParaGuardar);

        try {
            notificacionWebSocketServicio.notificarNuevoPedido(empresa.getId(), resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir notificación WebSocket para el pedido {}", pedidoGuardado.getPublicId(), e);
        }

        return resultadoDto;
    }

    /**
     * Asigna un repartidor de la distribuidora a un pedido específico.
     */
    public PedidoDetalleDto asignarRepartidor(UUID publicId, AsignarRepartidorDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        Pedido pedido = pedidoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado o no pertenece a su distribuidora."));

        Repartidor repartidor = repartidorRepositorio.findByPublicIdAndTenantId(dto.repartidorPublicId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("El repartidor no existe o no pertenece a su distribuidora."));

        pedido.setRepartidorId(repartidor.getUsuarioId());
        if (pedido.getEstado() == EstadoPedido.PENDIENTE || pedido.getEstado() == EstadoPedido.CONFIRMADO) {
            pedido.setEstado(EstadoPedido.ASIGNADO);
        }

        Pedido pedidoActualizado = pedidoRepositorio.save(pedido);

        Empresa empresa = empresaRepositorio.findById(tenantId).orElse(null);
        Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoActualizado, empresa, cliente, detalles);

        try {
            notificacionWebSocketServicio.notificarEstadoPedido(tenantId, publicId, resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir WebSocket de asignación de repartidor {}", publicId, e);
        }

        return resultadoDto;
    }

    /**
     * Lista los pedidos asignados al repartidor autenticado.
     */
    @Transactional(readOnly = true)
    public Page<PedidoDetalleDto> listarPedidosAsignadosRepartidor(String emailRepartidor, Pageable pageable) {
        Usuario usuario = usuarioRepositorio.findByEmail(emailRepartidor)
                .orElseThrow(() -> new AccessDeniedException("Usuario repartidor no encontrado."));

        return pedidoRepositorio.findByRepartidorIdAndEstadoInOrderByCreatedAtDesc(
                usuario.getId(),
                List.of(EstadoPedido.ASIGNADO, EstadoPedido.EN_CAMINO, EstadoPedido.ENTREGADO),
                pageable
        ).map(pedido -> {
            Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
            Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
            List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());
            return mapearAPedidoDetalleDto(pedido, empresa, cliente, detalles);
        });
    }

    /**
     * El repartidor inicia la entrega en ruta cambiando el estado a EN_CAMINO.
     */
    public PedidoDetalleDto iniciarRutaRepartidor(UUID publicId, String emailRepartidor) {
        Usuario usuario = usuarioRepositorio.findByEmail(emailRepartidor)
                .orElseThrow(() -> new AccessDeniedException("Usuario repartidor no encontrado."));

        Pedido pedido = pedidoRepositorio.findByPublicIdAndRepartidorId(publicId, usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado o no asignado a este repartidor."));

        if (pedido.getEstado() != EstadoPedido.ASIGNADO && pedido.getEstado() != EstadoPedido.CONFIRMADO) {
            throw new IllegalStateException("No se puede iniciar ruta para un pedido en estado " + pedido.getEstado());
        }

        pedido.setEstado(EstadoPedido.EN_CAMINO);
        Pedido pedidoGuardado = pedidoRepositorio.save(pedido);

        Repartidor repartidor = repartidorRepositorio.findByUsuarioId(usuario.getId()).orElse(null);
        if (repartidor != null) {
            repartidor.setEstado(EstadoRepartidor.EN_RUTA);
            repartidorRepositorio.save(repartidor);
        }

        Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
        Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoGuardado, empresa, cliente, detalles);

        try {
            notificacionWebSocketServicio.notificarEstadoPedido(pedido.getTenantId(), publicId, resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir WebSocket de inicio de ruta para {}", publicId, e);
        }

        return resultadoDto;
    }

    /**
     * El repartidor valida el código de confirmación de 6 dígitos del cliente y marca la entrega exitosa.
     */
    public PedidoDetalleDto confirmarEntregaRepartidor(UUID publicId, String codigoConfirmacion, String emailRepartidor) {
        Usuario usuario = usuarioRepositorio.findByEmail(emailRepartidor)
                .orElseThrow(() -> new AccessDeniedException("Usuario repartidor no encontrado."));

        Pedido pedido = pedidoRepositorio.findByPublicIdAndRepartidorId(publicId, usuario.getId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado o no asignado a este repartidor."));

        if (pedido.getEstado() != EstadoPedido.EN_CAMINO) {
            throw new IllegalStateException("El pedido debe estar EN_CAMINO para registrar la entrega.");
        }

        if (codigoConfirmacion == null || !pedido.getCodigoConfirmacion().equalsIgnoreCase(codigoConfirmacion.trim())) {
            throw new IllegalArgumentException("El código de confirmación ingresado es incorrecto.");
        }

        pedido.setEstado(EstadoPedido.ENTREGADO);
        pedido.setFechaEntrega(OffsetDateTime.now());
        pedido.setEstadoPago(EstadoPago.PAGADO);
        Pedido pedidoGuardado = pedidoRepositorio.save(pedido);

        try {
            if (inventarioServicio != null) {
                inventarioServicio.descontarStockPorPedido(pedidoGuardado);
            }
        } catch (Exception e) {
            log.error("Error al descontar stock por entrega de pedido {}", publicId, e);
        }

        try {
            if (fidelizacionServicio != null) {
                fidelizacionServicio.acumularPuntosPorPedido(pedidoGuardado);
            }
        } catch (Exception e) {
            log.error("Error al acumular puntos de fidelización por pedido {}", publicId, e);
        }

        try {
            if (finanzasServicio != null) {
                finanzasServicio.registrarPagoContraEntregaSiAplica(pedidoGuardado);
            }
        } catch (Exception e) {
            log.error("Error al registrar venta contable por entrega de pedido {}", publicId, e);
        }

        Repartidor repartidor = repartidorRepositorio.findByUsuarioId(usuario.getId()).orElse(null);
        if (repartidor != null) {
            repartidor.setEstado(EstadoRepartidor.DISPONIBLE);
            repartidorRepositorio.save(repartidor);
        }

        Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
        Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoGuardado, empresa, cliente, detalles);

        try {
            notificacionWebSocketServicio.notificarEstadoPedido(pedido.getTenantId(), publicId, resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir WebSocket de entrega completada para {}", publicId, e);
        }

        return resultadoDto;
    }

    /**
     * Lista los pedidos para la empresa (distribuidora) autenticada con aislamiento de tenant estricto.
     */
    @Transactional(readOnly = true)
    public Page<PedidoDetalleDto> listarPedidosEmpresa(EstadoPedido estado, Pageable pageable) {
        Long tenantId = obtenerTenantIdRequerido();
        Empresa empresa = empresaRepositorio.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));

        Page<Pedido> pedidosPage;
        if (estado != null) {
            pedidosPage = pedidoRepositorio.findByTenantIdAndEstadoOrderByCreatedAtDesc(tenantId, estado, pageable);
        } else {
            pedidosPage = pedidoRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }

        return pedidosPage.map(pedido -> {
            Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
            List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());
            return mapearAPedidoDetalleDto(pedido, empresa, cliente, detalles);
        });
    }

    /**
     * Obtiene el detalle de un pedido para la empresa autenticada.
     */
    @Transactional(readOnly = true)
    public PedidoDetalleDto obtenerPedidoEmpresa(UUID publicId) {
        Long tenantId = obtenerTenantIdRequerido();
        Pedido pedido = pedidoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado o no pertenece a su distribuidora."));

        Empresa empresa = empresaRepositorio.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada."));
        Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        return mapearAPedidoDetalleDto(pedido, empresa, cliente, detalles);
    }

    /**
     * Actualiza el estado de un pedido (ej. CONFIRMAR, DESPACHAR, ENTREGAR, CANCELAR).
     */
    public PedidoDetalleDto actualizarEstadoEmpresa(UUID publicId, ActualizarEstadoPedidoDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        Pedido pedido = pedidoRepositorio.findByPublicIdAndTenantId(publicId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado o no pertenece a su distribuidora."));

        if (!pedido.getEstado().puedeTransicionarA(dto.nuevoEstado())) {
            throw new IllegalStateException(
                    "Transición no permitida: no se puede cambiar el estado de " +
                    pedido.getEstado() + " a " + dto.nuevoEstado() + "."
            );
        }

        if (dto.nuevoEstado() == EstadoPedido.ENTREGADO) {
            if (dto.codigoConfirmacion() != null && !dto.codigoConfirmacion().isBlank()) {
                if (!pedido.getCodigoConfirmacion().equalsIgnoreCase(dto.codigoConfirmacion().trim())) {
                    throw new IllegalArgumentException("El código de confirmación (" + dto.codigoConfirmacion() + ") no coincide.");
                }
            }
            pedido.setFechaEntrega(OffsetDateTime.now());
            pedido.setEstadoPago(EstadoPago.PAGADO);
        } else if (dto.nuevoEstado() == EstadoPedido.CANCELADO) {
            if (pedido.getEstadoPago() == EstadoPago.PAGADO) {
                pedido.setEstadoPago(EstadoPago.REEMBOLSADO);
            }
        }

        pedido.setEstado(dto.nuevoEstado());
        Pedido pedidoActualizado = pedidoRepositorio.save(pedido);

        if (dto.nuevoEstado() == EstadoPedido.ENTREGADO) {
            try {
                if (inventarioServicio != null) {
                    inventarioServicio.descontarStockPorPedido(pedidoActualizado);
                }
            } catch (Exception e) {
                log.error("Error al descontar stock por entrega de pedido {}", publicId, e);
            }

            try {
                if (fidelizacionServicio != null) {
                    fidelizacionServicio.acumularPuntosPorPedido(pedidoActualizado);
                }
            } catch (Exception e) {
                log.error("Error al acumular puntos de fidelización por pedido {}", publicId, e);
            }

            try {
                if (finanzasServicio != null) {
                    finanzasServicio.registrarPagoContraEntregaSiAplica(pedidoActualizado);
                }
            } catch (Exception e) {
                log.error("Error al registrar pago o comisiones financieras por pedido {}", publicId, e);
            }
        }

        Empresa empresa = empresaRepositorio.findById(tenantId).orElse(null);
        Usuario cliente = usuarioRepositorio.findById(pedido.getClienteId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoActualizado, empresa, cliente, detalles);

        try {
            notificacionWebSocketServicio.notificarEstadoPedido(tenantId, publicId, resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir notificación WebSocket para el estado del pedido {}", publicId, e);
        }

        return resultadoDto;
    }

    /**
     * Resumen de métricas de pedidos para el dashboard de la distribuidora.
     */
    @Transactional(readOnly = true)
    public ResumenMetricasPedidosDto obtenerMetricasEmpresa() {
        Long tenantId = obtenerTenantIdRequerido();
        long pendientes = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.PENDIENTE);
        long confirmados = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.CONFIRMADO);
        long enCamino = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.EN_CAMINO);
        long entregados = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.ENTREGADO);
        long cancelados = pedidoRepositorio.countByTenantIdAndEstado(tenantId, EstadoPedido.CANCELADO);
        long total = pedidoRepositorio.countByTenantId(tenantId);

        return new ResumenMetricasPedidosDto(pendientes, confirmados, enCamino, entregados, cancelados, total);
    }

    /**
     * Lista los pedidos del cliente autenticado.
     */
    @Transactional(readOnly = true)
    public Page<PedidoDetalleDto> listarMisPedidosCliente(String emailUsuarioActual, Pageable pageable) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailUsuarioActual)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado."));

        return pedidoRepositorio.findByClienteIdOrderByCreatedAtDesc(cliente.getId(), pageable)
                .map(pedido -> {
                    Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
                    List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());
                    return mapearAPedidoDetalleDto(pedido, empresa, cliente, detalles);
                });
    }

    /**
     * Obtiene el detalle de un pedido específico del cliente autenticado.
     */
    @Transactional(readOnly = true)
    public PedidoDetalleDto obtenerMiPedidoCliente(UUID publicId, String emailUsuarioActual) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailUsuarioActual)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado."));

        Pedido pedido = pedidoRepositorio.findByPublicIdAndClienteId(publicId, cliente.getId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado."));

        Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        return mapearAPedidoDetalleDto(pedido, empresa, cliente, detalles);
    }

    /**
     * Permite al cliente cancelar un pedido que todavía está PENDIENTE.
     */
    public PedidoDetalleDto cancelarPedidoCliente(UUID publicId, String emailUsuarioActual) {
        Usuario cliente = usuarioRepositorio.findByEmail(emailUsuarioActual)
                .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado."));

        Pedido pedido = pedidoRepositorio.findByPublicIdAndClienteId(publicId, cliente.getId())
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado."));

        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new IllegalStateException("Solo puede cancelar pedidos que aún se encuentren en estado PENDIENTE.");
        }

        pedido.setEstado(EstadoPedido.CANCELADO);
        Pedido pedidoActualizado = pedidoRepositorio.save(pedido);

        Empresa empresa = empresaRepositorio.findById(pedido.getTenantId()).orElse(null);
        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());

        PedidoDetalleDto resultadoDto = mapearAPedidoDetalleDto(pedidoActualizado, empresa, cliente, detalles);

        try {
            notificacionWebSocketServicio.notificarEstadoPedido(pedido.getTenantId(), publicId, resultadoDto);
        } catch (Exception e) {
            log.error("Error al emitir WebSocket de cancelación para {}", publicId, e);
        }

        return resultadoDto;
    }

    // ==========================================
    // Métodos Auxiliares
    // ==========================================

    private Long obtenerTenantIdRequerido() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("Acción no autorizada: contexto de empresa (tenant) no encontrado.");
        }
        return tenantId;
    }

    private PedidoDetalleDto mapearAPedidoDetalleDto(
            Pedido pedido,
            Empresa empresa,
            Usuario cliente,
            List<DetallePedido> detalles
    ) {
        List<DetallePedidoItemDto> itemsDto = detalles.stream().map(det -> {
            Producto prod = det.getProducto();
            return new DetallePedidoItemDto(
                    prod.getPublicId(),
                    prod.getSku(),
                    prod.getNombre(),
                    prod.getTipoGas(),
                    prod.getTipoValvula(),
                    prod.getImagenUrl(),
                    det.getCantidad(),
                    det.getPrecioUnitario(),
                    det.getSubtotal()
            );
        }).toList();

        UUID repartidorPublicId = null;
        String nombreRepartidor = null;
        String telefonoRepartidor = null;
        String vehiculoPlaca = null;

        if (pedido.getRepartidorId() != null) {
            Usuario uRep = usuarioRepositorio.findById(pedido.getRepartidorId()).orElse(null);
            if (uRep != null) {
                nombreRepartidor = uRep.getNombres() + " " + uRep.getApellidos();
                telefonoRepartidor = uRep.getTelefono();
                Repartidor rep = repartidorRepositorio.findByUsuarioId(uRep.getId()).orElse(null);
                if (rep != null) {
                    repartidorPublicId = rep.getPublicId();
                    if (rep.getVehiculoId() != null) {
                        Vehiculo veh = vehiculoRepositorio.findById(rep.getVehiculoId()).orElse(null);
                        if (veh != null) {
                            vehiculoPlaca = veh.getPlaca();
                        }
                    }
                }
            }
        }

        return new PedidoDetalleDto(
                pedido.getPublicId(),
                pedido.getTenantId(),
                empresa != null ? empresa.getPublicId() : null,
                empresa != null ? empresa.getNombreComercial() : "Distribuidora Desconocida",
                empresa != null ? empresa.getTelefono() : null,
                cliente != null ? cliente.getPublicId() : null,
                cliente != null ? (cliente.getNombres() + " " + cliente.getApellidos()) : "Cliente Desconocido",
                cliente != null ? cliente.getTelefono() : null,
                cliente != null ? cliente.getEmail() : null,
                repartidorPublicId,
                nombreRepartidor,
                telefonoRepartidor,
                vehiculoPlaca,
                pedido.getSubtotal(),
                pedido.getDescuento(),
                pedido.getTotal(),
                pedido.getEstado(),
                pedido.getMetodoPago(),
                pedido.getEstadoPago(),
                pedido.getDireccionEntrega(),
                pedido.getReferenciaDireccion(),
                pedido.getCoordenadaEntrega() != null ? pedido.getCoordenadaEntrega().getY() : null,
                pedido.getCoordenadaEntrega() != null ? pedido.getCoordenadaEntrega().getX() : null,
                pedido.getNotasCliente(),
                pedido.getCodigoConfirmacion(),
                pedido.getFechaEntrega(),
                pedido.getCreatedAt(),
                pedido.getUpdatedAt(),
                itemsDto
        );
    }
}
