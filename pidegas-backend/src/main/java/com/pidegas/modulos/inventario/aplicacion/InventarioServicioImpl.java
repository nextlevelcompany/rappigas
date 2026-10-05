package com.pidegas.modulos.inventario.aplicacion;

import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.inventario.dominio.Almacen;
import com.pidegas.modulos.inventario.dominio.MovimientoStock;
import com.pidegas.modulos.inventario.dominio.StockProducto;
import com.pidegas.modulos.inventario.dominio.TipoMovimientoStock;
import com.pidegas.modulos.inventario.dto.*;
import com.pidegas.modulos.inventario.repositorio.AlmacenRepositorio;
import com.pidegas.modulos.inventario.repositorio.MovimientoStockRepositorio;
import com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio;
import com.pidegas.modulos.pedidos.dominio.DetallePedido;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.DetallePedidoRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class InventarioServicioImpl implements InventarioServicio {

    private static final Logger log = LoggerFactory.getLogger(InventarioServicioImpl.class);

    private final AlmacenRepositorio almacenRepositorio;
    private final StockProductoRepositorio stockProductoRepositorio;
    private final MovimientoStockRepositorio movimientoStockRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;

    public InventarioServicioImpl(
            AlmacenRepositorio almacenRepositorio,
            StockProductoRepositorio stockProductoRepositorio,
            MovimientoStockRepositorio movimientoStockRepositorio,
            ProductoRepositorio productoRepositorio,
            DetallePedidoRepositorio detallePedidoRepositorio
    ) {
        this.almacenRepositorio = almacenRepositorio;
        this.stockProductoRepositorio = stockProductoRepositorio;
        this.movimientoStockRepositorio = movimientoStockRepositorio;
        this.productoRepositorio = productoRepositorio;
        this.detallePedidoRepositorio = detallePedidoRepositorio;
    }

    private Long obtenerTenantIdRequerido() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("Operación no permitida: contexto multi-tenant no establecido.");
        }
        return tenantId;
    }

    // --- ALMACENES ---

    @Override
    @Transactional(readOnly = true)
    public List<AlmacenDetalleDto> listarAlmacenes() {
        Long tenantId = obtenerTenantIdRequerido();
        return almacenRepositorio.findByTenantIdOrderByNombreAsc(tenantId).stream()
                .map(this::mapearAlmacenDto)
                .toList();
    }

    @Override
    public AlmacenDetalleDto crearAlmacen(CrearAlmacenDto dto) {
        Long tenantId = obtenerTenantIdRequerido();
        if (almacenRepositorio.existsByTenantIdAndNombreIgnoreCase(tenantId, dto.nombre())) {
            throw new IllegalArgumentException("Ya existe un almacén con el nombre '" + dto.nombre() + "'.");
        }

        Almacen almacen = new Almacen(tenantId, dto.nombre().trim(), dto.direccion() != null ? dto.direccion().trim() : null);
        Almacen guardado = almacenRepositorio.save(almacen);
        log.info("Nuevo almacén creado para tenant {}: '{}'", tenantId, guardado.getNombre());
        return mapearAlmacenDto(guardado);
    }

    // --- STOCK DE PRODUCTOS ---

    @Override
    @Transactional(readOnly = true)
    public List<StockProductoDetalleDto> consultarStock(UUID almacenPublicId) {
        Long tenantId = obtenerTenantIdRequerido();

        List<StockProducto> stocks;
        if (almacenPublicId != null) {
            Almacen almacen = almacenRepositorio.findByPublicIdAndTenantId(almacenPublicId, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Almacén no encontrado."));
            stocks = stockProductoRepositorio.findByTenantIdAndAlmacenId(tenantId, almacen.getId());
        } else {
            stocks = stockProductoRepositorio.findByTenantId(tenantId);
        }

        Map<Long, Almacen> almacenesMap = new HashMap<>();
        Map<Long, Producto> productosMap = new HashMap<>();

        return stocks.stream().map(s -> {
            Almacen a = almacenesMap.computeIfAbsent(s.getAlmacenId(), id -> almacenRepositorio.findById(id).orElse(null));
            Producto p = productosMap.computeIfAbsent(s.getProductoId(), id -> productoRepositorio.findById(id).orElse(null));

            String nombreAlmacen = a != null ? a.getNombre() : "Almacén Desconocido";
            UUID almacenPubId = a != null ? a.getPublicId() : null;
            UUID prodPubId = p != null ? p.getPublicId() : null;
            String sku = p != null ? p.getSku() : "";
            String nombreProd = p != null ? p.getNombre() : "Producto Desconocido";
            String tipoGas = p != null ? p.getTipoGas().name() : "";
            String tipoValvula = p != null ? p.getTipoValvula().name() : "";
            boolean bajoStock = s.getCantidadDisponible() <= s.getStockMinimo();

            return new StockProductoDetalleDto(
                    s.getId(),
                    almacenPubId,
                    nombreAlmacen,
                    prodPubId,
                    sku,
                    nombreProd,
                    tipoGas,
                    tipoValvula,
                    s.getCantidadDisponible(),
                    s.getCantidadReservada(),
                    s.getStockMinimo(),
                    bajoStock
            );
        }).toList();
    }

    // --- MOVIMIENTOS KARDEX ---

    @Override
    public StockProductoDetalleDto registrarMovimiento(RegistrarMovimientoDto dto) {
        Long tenantId = obtenerTenantIdRequerido();

        Almacen almacen = almacenRepositorio.findByPublicIdAndTenantId(dto.almacenPublicId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("El almacén especificado no existe o no pertenece a su distribuidora."));

        Producto producto = productoRepositorio.findByPublicId(dto.productoPublicId())
                .orElseThrow(() -> new IllegalArgumentException("El balón o producto no existe."));

        if (!producto.getTenantId().equals(tenantId)) {
            throw new AccessDeniedException("El producto no pertenece a su empresa distribuidora.");
        }

        StockProducto stock = stockProductoRepositorio.findByAlmacenIdAndProductoId(almacen.getId(), producto.getId())
                .orElseGet(() -> new StockProducto(tenantId, almacen.getId(), producto.getId(), 0, 5));

        int cantidad = dto.cantidad();
        switch (dto.tipoMovimiento()) {
            case ENTRADA, DEVOLUCION -> stock.setCantidadDisponible(stock.getCantidadDisponible() + cantidad);
            case SALIDA_VENTA -> {
                if (stock.getCantidadDisponible() < cantidad) {
                    throw new IllegalStateException("Stock insuficiente. Disponibles: " + stock.getCantidadDisponible() + ", Requeridos: " + cantidad);
                }
                stock.setCantidadDisponible(stock.getCantidadDisponible() - cantidad);
            }
            case AJUSTE -> stock.setCantidadDisponible(cantidad);
        }

        StockProducto stockGuardado = stockProductoRepositorio.save(stock);

        MovimientoStock movimiento = new MovimientoStock(
                tenantId,
                almacen.getId(),
                producto.getId(),
                null,
                dto.tipoMovimiento(),
                cantidad,
                dto.motivo() != null ? dto.motivo().trim() : "Movimiento manual de kardex"
        );
        movimientoStockRepositorio.save(movimiento);

        log.info("Movimiento de inventario {} registrado para producto '{}' en almacén '{}' (Cantidad: {})",
                dto.tipoMovimiento(), producto.getNombre(), almacen.getNombre(), cantidad);

        boolean bajoStock = stockGuardado.getCantidadDisponible() <= stockGuardado.getStockMinimo();
        return new StockProductoDetalleDto(
                stockGuardado.getId(),
                almacen.getPublicId(),
                almacen.getNombre(),
                producto.getPublicId(),
                producto.getSku(),
                producto.getNombre(),
                producto.getTipoGas().name(),
                producto.getTipoValvula().name(),
                stockGuardado.getCantidadDisponible(),
                stockGuardado.getCantidadReservada(),
                stockGuardado.getStockMinimo(),
                bajoStock
        );
    }

    /**
     * Hook automatizado: Al entregarse un pedido, descuenta el stock de balones del almacén principal de la distribuidora.
     */
    @Override
    public void descontarStockPorPedido(Pedido pedido) {
        Long tenantId = pedido.getTenantId();
        Almacen almacen = almacenRepositorio.findFirstByTenantIdAndActivoTrue(tenantId).orElse(null);
        if (almacen == null) {
            log.warn("No se encontró almacén activo para el tenant {} al descontar stock del pedido {}", tenantId, pedido.getPublicId());
            return;
        }

        List<DetallePedido> detalles = detallePedidoRepositorio.findByPedidoId(pedido.getId());
        for (DetallePedido item : detalles) {
            Long prodId = item.getProducto() != null ? item.getProducto().getId() : null;
            if (prodId == null) continue;

            StockProducto stock = stockProductoRepositorio.findByAlmacenIdAndProductoId(almacen.getId(), prodId)
                    .orElseGet(() -> new StockProducto(tenantId, almacen.getId(), prodId, 0, 5));

            int nuevaCantidad = Math.max(0, stock.getCantidadDisponible() - item.getCantidad());
            stock.setCantidadDisponible(nuevaCantidad);
            stockProductoRepositorio.save(stock);

            MovimientoStock movimiento = new MovimientoStock(
                    tenantId,
                    almacen.getId(),
                    prodId,
                    pedido.getId(),
                    TipoMovimientoStock.SALIDA_VENTA,
                    item.getCantidad(),
                    "Despacho y entrega confirmada de pedido #PG-" + pedido.getPublicId().toString().substring(0, 8)
            );
            movimientoStockRepositorio.save(movimiento);
        }
        log.info("Stock descontado exitosamente para el pedido completado {}", pedido.getPublicId());
    }

    // --- HISTORIAL KARDEX ---

    @Override
    @Transactional(readOnly = true)
    public Page<MovimientoStockDetalleDto> obtenerKardex(Pageable pageable) {
        Long tenantId = obtenerTenantIdRequerido();

        Map<Long, Almacen> almacenesMap = new HashMap<>();
        Map<Long, Producto> productosMap = new HashMap<>();

        return movimientoStockRepositorio.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(m -> {
                    Almacen a = almacenesMap.computeIfAbsent(m.getAlmacenId(), id -> almacenRepositorio.findById(id).orElse(null));
                    Producto p = productosMap.computeIfAbsent(m.getProductoId(), id -> productoRepositorio.findById(id).orElse(null));

                    String nombreAlmacen = a != null ? a.getNombre() : "Almacén Desconocido";
                    UUID prodPubId = p != null ? p.getPublicId() : null;
                    String sku = p != null ? p.getSku() : "";
                    String nombreProd = p != null ? p.getNombre() : "Producto Desconocido";

                    return new MovimientoStockDetalleDto(
                            m.getId(),
                            nombreAlmacen,
                            prodPubId,
                            sku,
                            nombreProd,
                            m.getTipoMovimiento(),
                            m.getCantidad(),
                            m.getMotivo(),
                            null,
                            m.getCreatedAt()
                    );
                });
    }

    // --- RESUMEN MÉTRICAS INVENTARIO ---

    @Override
    @Transactional(readOnly = true)
    public ResumenInventarioDto obtenerResumenInventario() {
        Long tenantId = obtenerTenantIdRequerido();

        Long disponibles = stockProductoRepositorio.sumCantidadDisponibleByTenantId(tenantId);
        Long reservados = stockProductoRepositorio.sumCantidadReservadaByTenantId(tenantId);
        Long almacenesActivos = almacenRepositorio.countByTenantIdAndActivoTrue(tenantId);
        Long productosBajoStock = stockProductoRepositorio.countStockBajoByTenantId(tenantId);

        return new ResumenInventarioDto(
                disponibles != null ? disponibles : 0L,
                reservados != null ? reservados : 0L,
                almacenesActivos != null ? almacenesActivos : 0L,
                productosBajoStock != null ? productosBajoStock : 0L
        );
    }

    private AlmacenDetalleDto mapearAlmacenDto(Almacen a) {
        return new AlmacenDetalleDto(
                a.getPublicId(),
                a.getTenantId(),
                a.getNombre(),
                a.getDireccion(),
                a.getActivo(),
                a.getCreatedAt()
        );
    }
}
