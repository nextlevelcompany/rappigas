package com.pidegas.modulos.inventario.aplicacion;

import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.inventario.dominio.Almacen;
import com.pidegas.modulos.inventario.dominio.StockProducto;
import com.pidegas.modulos.inventario.dominio.TipoMovimientoStock;
import com.pidegas.modulos.inventario.dto.CrearAlmacenDto;
import com.pidegas.modulos.inventario.dto.RegistrarMovimientoDto;
import com.pidegas.modulos.inventario.dto.StockProductoDetalleDto;
import com.pidegas.modulos.inventario.repositorio.AlmacenRepositorio;
import com.pidegas.modulos.inventario.repositorio.MovimientoStockRepositorio;
import com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio;
import com.pidegas.modulos.pedidos.dominio.DetallePedido;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.DetallePedidoRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventarioServicioTest {

    private AlmacenRepositorio almacenRepositorio;
    private StockProductoRepositorio stockProductoRepositorio;
    private MovimientoStockRepositorio movimientoStockRepositorio;
    private ProductoRepositorio productoRepositorio;
    private DetallePedidoRepositorio detallePedidoRepositorio;

    private InventarioServicio inventarioServicio;
    private final Long TENANT_ID = 1L;

    @BeforeEach
    void setUp() {
        almacenRepositorio = mock(AlmacenRepositorio.class);
        stockProductoRepositorio = mock(StockProductoRepositorio.class);
        movimientoStockRepositorio = mock(MovimientoStockRepositorio.class);
        productoRepositorio = mock(ProductoRepositorio.class);
        detallePedidoRepositorio = mock(DetallePedidoRepositorio.class);

        inventarioServicio = new InventarioServicioImpl(
                almacenRepositorio,
                stockProductoRepositorio,
                movimientoStockRepositorio,
                productoRepositorio,
                detallePedidoRepositorio
        );

        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void crearAlmacen_exitoso() {
        CrearAlmacenDto dto = new CrearAlmacenDto("Depósito Secundario", "Av. Canta Callao 500");
        when(almacenRepositorio.existsByTenantIdAndNombreIgnoreCase(TENANT_ID, "Depósito Secundario")).thenReturn(false);
        when(almacenRepositorio.save(any(Almacen.class))).thenAnswer(inv -> inv.getArgument(0));

        var resultado = inventarioServicio.crearAlmacen(dto);

        assertNotNull(resultado);
        assertEquals("Depósito Secundario", resultado.nombre());
        verify(almacenRepositorio, times(1)).save(any(Almacen.class));
    }

    @Test
    void registrarMovimiento_entrada_incrementaStock() {
        UUID almacenPubId = UUID.randomUUID();
        UUID prodPubId = UUID.randomUUID();

        Almacen almacen = new Almacen(TENANT_ID, "Almacén Central", "Av. Principal");
        Producto producto = new Producto(TENANT_ID, "BALON-10KG", "Balón 10kg", "Desc",
                TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), "");

        StockProducto stock = new StockProducto(TENANT_ID, 10L, 20L, 15, 5);

        when(almacenRepositorio.findByPublicIdAndTenantId(almacenPubId, TENANT_ID)).thenReturn(Optional.of(almacen));
        when(productoRepositorio.findByPublicId(prodPubId)).thenReturn(Optional.of(producto));
        when(stockProductoRepositorio.findByAlmacenIdAndProductoId(any(), any())).thenReturn(Optional.of(stock));
        when(stockProductoRepositorio.save(any(StockProducto.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistrarMovimientoDto dto = new RegistrarMovimientoDto(
                almacenPubId,
                prodPubId,
                TipoMovimientoStock.ENTRADA,
                10,
                "Llegada de camión cisterna / envasadora"
        );

        StockProductoDetalleDto resultado = inventarioServicio.registrarMovimiento(dto);

        assertNotNull(resultado);
        assertEquals(25, resultado.cantidadDisponible());
        verify(movimientoStockRepositorio, times(1)).save(any());
    }

    @Test
    void registrarMovimiento_salida_fallaPorStockInsuficiente() {
        UUID almacenPubId = UUID.randomUUID();
        UUID prodPubId = UUID.randomUUID();

        Almacen almacen = new Almacen(TENANT_ID, "Almacén Central", "Av. Principal");
        Producto producto = new Producto(TENANT_ID, "BALON-10KG", "Balón 10kg", "Desc",
                TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), "");

        StockProducto stock = new StockProducto(TENANT_ID, 10L, 20L, 3, 5);

        when(almacenRepositorio.findByPublicIdAndTenantId(almacenPubId, TENANT_ID)).thenReturn(Optional.of(almacen));
        when(productoRepositorio.findByPublicId(prodPubId)).thenReturn(Optional.of(producto));
        when(stockProductoRepositorio.findByAlmacenIdAndProductoId(any(), any())).thenReturn(Optional.of(stock));

        RegistrarMovimientoDto dto = new RegistrarMovimientoDto(
                almacenPubId,
                prodPubId,
                TipoMovimientoStock.SALIDA_VENTA,
                10,
                "Despacho"
        );

        assertThrows(IllegalStateException.class, () -> inventarioServicio.registrarMovimiento(dto));
        verify(movimientoStockRepositorio, never()).save(any());
    }

    @Test
    void descontarStockPorPedido_descuentaCorrectamente() {
        Almacen almacen = new Almacen(TENANT_ID, "Almacén Central", "Av. Principal");
        when(almacenRepositorio.findFirstByTenantIdAndActivoTrue(TENANT_ID)).thenReturn(Optional.of(almacen));

        Pedido pedido = new Pedido(TENANT_ID, 2L, new BigDecimal("100.00"), BigDecimal.ZERO,
                new BigDecimal("100.00"), com.pidegas.modulos.pedidos.dominio.MetodoPago.EFECTIVO,
                "Av. Lima 123", "Ref", null, "", "123456");
        org.springframework.test.util.ReflectionTestUtils.setField(pedido, "id", 100L);

        Producto prod = new Producto(TENANT_ID, "BALON-10KG", "Balón 10kg", "Desc",
                TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("50.00"), "");
        org.springframework.test.util.ReflectionTestUtils.setField(prod, "id", 50L);

        DetallePedido item = new DetallePedido(pedido, prod, 2, new BigDecimal("50.00"), new BigDecimal("100.00"));
        when(detallePedidoRepositorio.findByPedidoId(100L)).thenReturn(List.of(item));

        StockProducto stock = new StockProducto(TENANT_ID, almacen.getId(), 50L, 20, 5);
        when(stockProductoRepositorio.findByAlmacenIdAndProductoId(almacen.getId(), 50L)).thenReturn(Optional.of(stock));

        inventarioServicio.descontarStockPorPedido(pedido);

        assertEquals(18, stock.getCantidadDisponible());
        verify(stockProductoRepositorio, times(1)).save(stock);
        verify(movimientoStockRepositorio, times(1)).save(any());
    }
}
