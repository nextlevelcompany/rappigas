package com.pidegas.modulos.analytics.aplicacion;

import com.pidegas.modulos.analytics.dto.DashboardAdminDto;
import com.pidegas.modulos.analytics.dto.DashboardEmpresaDto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.flota.dominio.EstadoRepartidor;
import com.pidegas.modulos.flota.repositorio.RepartidorRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.inventario.repositorio.StockProductoRepositorio;
import com.pidegas.modulos.pedidos.dominio.DetallePedido;
import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.repositorio.TicketSoporteRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AnalyticsServicioTest {

    private PedidoRepositorio pedidoRepositorio;
    private StockProductoRepositorio stockProductoRepositorio;
    private RepartidorRepositorio repartidorRepositorio;
    private EmpresaRepositorio empresaRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private TicketSoporteRepositorio ticketSoporteRepositorio;

    private AnalyticsServicio analyticsServicio;

    private final Long TENANT_ID = 1L;

    @BeforeEach
    void setUp() {
        pedidoRepositorio = mock(PedidoRepositorio.class);
        stockProductoRepositorio = mock(StockProductoRepositorio.class);
        repartidorRepositorio = mock(RepartidorRepositorio.class);
        empresaRepositorio = mock(EmpresaRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        ticketSoporteRepositorio = mock(TicketSoporteRepositorio.class);

        analyticsServicio = new AnalyticsServicioImpl(
                pedidoRepositorio,
                stockProductoRepositorio,
                repartidorRepositorio,
                empresaRepositorio,
                usuarioRepositorio,
                ticketSoporteRepositorio
        );
    }

    @Test
    void debeCalcularDashboardEmpresaCorrectamente() {
        // Mock pedidos
        Pedido pedido1 = new Pedido();
        pedido1.setTenantId(TENANT_ID);
        pedido1.setTotal(new BigDecimal("60.00"));
        pedido1.setEstado(EstadoPedido.ENTREGADO);
        pedido1.setMetodoPago(MetodoPago.YAPE);
        ReflectionTestUtils.setField(pedido1, "createdAt", OffsetDateTime.now(ZoneOffset.UTC));

        Producto prod10kg = new Producto();
        prod10kg.setNombre("Balón GLP 10kg Premium");
        prod10kg.setSku("GLP-10KG-PREM");

        DetallePedido detalle1 = new DetallePedido(pedido1, prod10kg, 1, new BigDecimal("60.00"), new BigDecimal("60.00"));
        pedido1.agregarDetalle(detalle1);

        when(pedidoRepositorio.findByTenantIdWithDetalles(TENANT_ID)).thenReturn(List.of(pedido1));
        when(pedidoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoPedido.PENDIENTE)).thenReturn(2L);
        when(pedidoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoPedido.ASIGNADO)).thenReturn(1L);
        when(pedidoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoPedido.EN_CAMINO)).thenReturn(1L);
        when(pedidoRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoPedido.ENTREGADO)).thenReturn(5L);

        when(stockProductoRepositorio.countStockBajoByTenantId(TENANT_ID)).thenReturn(3L);
        when(stockProductoRepositorio.countAgotadosByTenantId(TENANT_ID)).thenReturn(0L);
        when(repartidorRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoRepartidor.DISPONIBLE)).thenReturn(3L);
        when(repartidorRepositorio.countByTenantIdAndEstado(TENANT_ID, EstadoRepartidor.EN_RUTA)).thenReturn(1L);

        DashboardEmpresaDto dto = analyticsServicio.obtenerDashboardEmpresa(TENANT_ID);

        assertNotNull(dto);
        assertEquals(new BigDecimal("60.00"), dto.getVentasHoy());
        assertEquals(new BigDecimal("60.00"), dto.getVentasMes());
        assertEquals(1, dto.getTotalPedidosMes());
        assertEquals(new BigDecimal("60.00"), dto.getTicketPromedio());
        assertEquals(2L, dto.getPedidosPendientes());
        assertEquals(2L, dto.getPedidosEnCamino());
        assertEquals(5L, dto.getPedidosEntregados());
        assertEquals(3L, dto.getBalonesStockBajo());
        assertEquals(0L, dto.getProductosAgotados());
        assertEquals(4L, dto.getRepartidoresActivos());
        assertEquals(7, dto.getVentasPorDia().size());
        assertEquals(1, dto.getVentasPorProducto().size());
        assertEquals("Balón GLP 10kg Premium", dto.getVentasPorProducto().get(0).getNombreProducto());
        assertEquals(1L, dto.getVentasPorProducto().get(0).getUnidadesVendidas());
    }

    @Test
    void debeCalcularDashboardAdminCorrectamente() {
        Pedido p1 = new Pedido();
        p1.setTotal(new BigDecimal("1000.00"));
        p1.setEstado(EstadoPedido.ENTREGADO);
        p1.setMetodoPago(MetodoPago.TARJETA);
        ReflectionTestUtils.setField(p1, "createdAt", OffsetDateTime.now(ZoneOffset.UTC));

        when(pedidoRepositorio.findAllWithDetalles()).thenReturn(List.of(p1));
        when(empresaRepositorio.count()).thenReturn(10L);
        when(empresaRepositorio.countByEstado(EstadoEmpresa.APROBADA)).thenReturn(8L);
        when(empresaRepositorio.countByEstado(EstadoEmpresa.PENDIENTE)).thenReturn(2L);
        when(usuarioRepositorio.countByRol(RolUsuario.CLIENTE)).thenReturn(250L);
        when(repartidorRepositorio.count()).thenReturn(35L);
        when(ticketSoporteRepositorio.countByEstado(EstadoTicket.ABIERTO)).thenReturn(2L);
        when(ticketSoporteRepositorio.countByEstado(EstadoTicket.EN_PROCESO)).thenReturn(1L);

        DashboardAdminDto dto = analyticsServicio.obtenerDashboardAdmin();

        assertNotNull(dto);
        assertEquals(new BigDecimal("1000.00"), dto.getVolumenTransaccionadoTotal());
        // 5% de 1000 = 50.00
        assertEquals(new BigDecimal("50.00"), dto.getComisionesTotalesPlataforma());
        assertEquals(10L, dto.getTotalEmpresas());
        assertEquals(8L, dto.getEmpresasAprobadas());
        assertEquals(2L, dto.getEmpresasPendientes());
        assertEquals(250L, dto.getTotalClientes());
        assertEquals(35L, dto.getTotalRepartidores());
        assertEquals(1L, dto.getTotalPedidosGlobal());
        assertEquals(100.0, dto.getTasaEntregaExitosa());
        assertEquals(3L, dto.getTicketsAbiertos());
        assertEquals(7, dto.getVentasPorDiaGlobal().size());
    }
}
