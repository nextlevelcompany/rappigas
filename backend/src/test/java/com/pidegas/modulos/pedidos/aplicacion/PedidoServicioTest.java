package com.pidegas.modulos.pedidos.aplicacion;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.Producto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import com.pidegas.modulos.catalogo.repositorio.ProductoRepositorio;
import com.pidegas.modulos.cobertura.dominio.ZonaCobertura;
import com.pidegas.modulos.cobertura.infraestructura.ZonaCoberturaRepositorio;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.EstadoPago;
import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.dto.ActualizarEstadoPedidoDto;
import com.pidegas.modulos.pedidos.dto.CrearPedidoDto;
import com.pidegas.modulos.pedidos.dto.ItemPedidoDto;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;
import com.pidegas.modulos.pedidos.repositorio.DetallePedidoRepositorio;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import com.pidegas.nucleo.websocket.NotificacionWebSocketServicio;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PedidoServicioTest {

    private PedidoRepositorio pedidoRepositorio;
    private DetallePedidoRepositorio detallePedidoRepositorio;
    private ProductoRepositorio productoRepositorio;
    private EmpresaRepositorio empresaRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private ZonaCoberturaRepositorio zonaCoberturaRepositorio;
    private com.pidegas.modulos.flota.repositorio.RepartidorRepositorio repartidorRepositorio;
    private com.pidegas.modulos.flota.repositorio.VehiculoRepositorio vehiculoRepositorio;
    private NotificacionWebSocketServicio notificacionWebSocketServicio;

    private PedidoServicio pedidoServicio;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @BeforeEach
    void setUp() {
        pedidoRepositorio = mock(PedidoRepositorio.class);
        detallePedidoRepositorio = mock(DetallePedidoRepositorio.class);
        productoRepositorio = mock(ProductoRepositorio.class);
        empresaRepositorio = mock(EmpresaRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        zonaCoberturaRepositorio = mock(ZonaCoberturaRepositorio.class);
        repartidorRepositorio = mock(com.pidegas.modulos.flota.repositorio.RepartidorRepositorio.class);
        vehiculoRepositorio = mock(com.pidegas.modulos.flota.repositorio.VehiculoRepositorio.class);
        notificacionWebSocketServicio = mock(NotificacionWebSocketServicio.class);
        var inventarioServicio = mock(com.pidegas.modulos.inventario.aplicacion.InventarioServicio.class);
        var fidelizacionServicio = mock(com.pidegas.modulos.fidelizacion.aplicacion.FidelizacionServicio.class);

        pedidoServicio = new PedidoServicio(
                pedidoRepositorio,
                detallePedidoRepositorio,
                productoRepositorio,
                empresaRepositorio,
                usuarioRepositorio,
                zonaCoberturaRepositorio,
                repartidorRepositorio,
                vehiculoRepositorio,
                notificacionWebSocketServicio,
                inventarioServicio,
                fidelizacionServicio
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void crearPedidoCliente_conCoberturaValida_creaPedidoYEmiteWebSocket() {
        String emailCliente = "cliente@pidegas.pe";
        UUID empresaPublicId = UUID.randomUUID();
        UUID productoPublicId = UUID.randomUUID();

        Usuario cliente = new Usuario(UUID.randomUUID(), emailCliente, "hash", RolUsuario.CLIENTE, "Juan", "Perez", "987654321", EstadoUsuario.ACTIVO);
        Empresa empresa = new Empresa(empresaPublicId, 10L, "20100070970", "Gas Los Olivos", "Distribuidora S.A.C.", "988777666", "c@gas.pe", "Av. Central", null, EstadoEmpresa.APROBADA);

        Producto producto = new Producto(empresa.getId(), "BALON-10KG", "Balón 10kg Premium", "Gas doméstico", TipoBalonGas.GLP_10KG, TipoValvulaGas.PREMIUM, new BigDecimal("52.00"), "url");

        when(usuarioRepositorio.findByEmail(emailCliente)).thenReturn(Optional.of(cliente));
        when(empresaRepositorio.findByPublicId(empresaPublicId)).thenReturn(Optional.of(empresa));

        // Cobertura encontrada para el punto
        ZonaCobertura zona = new ZonaCobertura(empresa.getId(), "Zona Norte", null);
        when(zonaCoberturaRepositorio.buscarZonasTenantQueCubrenPunto(eq(empresa.getId()), eq(-77.07), eq(-11.99)))
                .thenReturn(List.of(zona));

        when(productoRepositorio.findByPublicIdAndTenantId(productoPublicId, empresa.getId())).thenReturn(Optional.of(producto));
        when(pedidoRepositorio.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CrearPedidoDto dto = new CrearPedidoDto(
                empresaPublicId,
                -11.99,
                -77.07,
                "Av. Antunez de Mayolo 123",
                "Frente al parque",
                "Timbre rojo",
                MetodoPago.YAPE,
                List.of(new ItemPedidoDto(productoPublicId, 2))
        );

        PedidoDetalleDto resultado = pedidoServicio.crearPedidoCliente(dto, emailCliente);

        assertNotNull(resultado);
        assertEquals(new BigDecimal("104.00"), resultado.total());
        assertEquals(EstadoPedido.PENDIENTE, resultado.estado());
        assertEquals(MetodoPago.YAPE, resultado.metodoPago());
        assertNotNull(resultado.codigoConfirmacion());
        assertEquals(6, resultado.codigoConfirmacion().length());

        verify(pedidoRepositorio, times(1)).save(any(Pedido.class));
        verify(notificacionWebSocketServicio, times(1)).notificarNuevoPedido(eq(empresa.getId()), any(PedidoDetalleDto.class));
    }

    @Test
    void crearPedidoCliente_sinCobertura_lanzaExcepcion() {
        String emailCliente = "cliente@pidegas.pe";
        UUID empresaPublicId = UUID.randomUUID();
        Usuario cliente = new Usuario(UUID.randomUUID(), emailCliente, "hash", RolUsuario.CLIENTE, "Juan", "Perez", "987654321", EstadoUsuario.ACTIVO);
        Empresa empresa = new Empresa(empresaPublicId, 10L, "20100070970", "Gas Los Olivos", "Distribuidora S.A.C.", "988777666", "c@gas.pe", "Av. Central", null, EstadoEmpresa.APROBADA);

        when(usuarioRepositorio.findByEmail(emailCliente)).thenReturn(Optional.of(cliente));
        when(empresaRepositorio.findByPublicId(empresaPublicId)).thenReturn(Optional.of(empresa));

        // Sin cobertura en el punto
        when(zonaCoberturaRepositorio.buscarZonasTenantQueCubrenPunto(eq(empresa.getId()), eq(-77.07), eq(-11.99)))
                .thenReturn(List.of());

        CrearPedidoDto dto = new CrearPedidoDto(
                empresaPublicId,
                -11.99,
                -77.07,
                "Av. Fuera de Zona 999",
                null,
                null,
                MetodoPago.EFECTIVO,
                List.of(new ItemPedidoDto(UUID.randomUUID(), 1))
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                pedidoServicio.crearPedidoCliente(dto, emailCliente)
        );

        assertTrue(ex.getMessage().contains("fuera de la zona de cobertura"));
        verify(pedidoRepositorio, never()).save(any());
        verify(notificacionWebSocketServicio, never()).notificarNuevoPedido(any(), any());
    }

    @Test
    void crearPedidoCliente_conEmpresaNoAprobada_lanzaExcepcion() {
        String emailCliente = "cliente@pidegas.pe";
        UUID empresaPublicId = UUID.randomUUID();
        Usuario cliente = new Usuario(UUID.randomUUID(), emailCliente, "hash", RolUsuario.CLIENTE, "Juan", "Perez", "987654321", EstadoUsuario.ACTIVO);
        Empresa empresa = new Empresa(empresaPublicId, 10L, "20100070970", "Gas Pendiente", "Pendiente S.A.C.", "988777666", "c@gas.pe", "Av. Central", null, EstadoEmpresa.PENDIENTE);

        when(usuarioRepositorio.findByEmail(emailCliente)).thenReturn(Optional.of(cliente));
        when(empresaRepositorio.findByPublicId(empresaPublicId)).thenReturn(Optional.of(empresa));

        CrearPedidoDto dto = new CrearPedidoDto(
                empresaPublicId,
                -11.99,
                -77.07,
                "Av. Central 123",
                null,
                null,
                MetodoPago.EFECTIVO,
                List.of(new ItemPedidoDto(UUID.randomUUID(), 1))
        );

        assertThrows(IllegalArgumentException.class, () -> pedidoServicio.crearPedidoCliente(dto, emailCliente));
    }

    @Test
    void actualizarEstadoEmpresa_transicionValida_actualizaYEmiteWebSocket() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        UUID pedidoPublicId = UUID.randomUUID();

        Pedido pedido = new Pedido(
                tenantId, 5L, new BigDecimal("50.00"), BigDecimal.ZERO, new BigDecimal("50.00"),
                MetodoPago.EFECTIVO, "Av. Central", null, geometryFactory.createPoint(new Coordinate(-77.07, -11.99)), null, "123456"
        );
        pedido.setEstado(EstadoPedido.PENDIENTE);

        when(pedidoRepositorio.findByPublicIdAndTenantId(pedidoPublicId, tenantId)).thenReturn(Optional.of(pedido));
        when(pedidoRepositorio.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

        Empresa empresa = new Empresa();
        empresa.setNombreComercial("Gas Los Olivos");
        when(empresaRepositorio.findById(tenantId)).thenReturn(Optional.of(empresa));

        ActualizarEstadoPedidoDto dto = new ActualizarEstadoPedidoDto(EstadoPedido.CONFIRMADO, null, null);
        PedidoDetalleDto resultado = pedidoServicio.actualizarEstadoEmpresa(pedidoPublicId, dto);

        assertEquals(EstadoPedido.CONFIRMADO, resultado.estado());
        verify(notificacionWebSocketServicio, times(1)).notificarEstadoPedido(eq(tenantId), eq(pedidoPublicId), any());
    }

    @Test
    void actualizarEstadoEmpresa_transicionInvalida_lanzaExcepcion() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        UUID pedidoPublicId = UUID.randomUUID();

        Pedido pedido = new Pedido(
                tenantId, 5L, new BigDecimal("50.00"), BigDecimal.ZERO, new BigDecimal("50.00"),
                MetodoPago.EFECTIVO, "Av. Central", null, geometryFactory.createPoint(new Coordinate(-77.07, -11.99)), null, "123456"
        );
        pedido.setEstado(EstadoPedido.PENDIENTE);

        when(pedidoRepositorio.findByPublicIdAndTenantId(pedidoPublicId, tenantId)).thenReturn(Optional.of(pedido));

        // Intento de saltar de PENDIENTE directo a ENTREGADO
        ActualizarEstadoPedidoDto dto = new ActualizarEstadoPedidoDto(EstadoPedido.ENTREGADO, "123456", null);

        assertThrows(IllegalStateException.class, () ->
                pedidoServicio.actualizarEstadoEmpresa(pedidoPublicId, dto)
        );

        verify(notificacionWebSocketServicio, never()).notificarEstadoPedido(any(), any(), any());
    }

    @Test
    void actualizarEstadoEmpresa_aEntregadoConCodigoInvalido_lanzaExcepcion() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        UUID pedidoPublicId = UUID.randomUUID();

        Pedido pedido = new Pedido(
                tenantId, 5L, new BigDecimal("50.00"), BigDecimal.ZERO, new BigDecimal("50.00"),
                MetodoPago.EFECTIVO, "Av. Central", null, geometryFactory.createPoint(new Coordinate(-77.07, -11.99)), null, "654321"
        );
        pedido.setEstado(EstadoPedido.EN_CAMINO);

        when(pedidoRepositorio.findByPublicIdAndTenantId(pedidoPublicId, tenantId)).thenReturn(Optional.of(pedido));

        // Código erróneo
        ActualizarEstadoPedidoDto dto = new ActualizarEstadoPedidoDto(EstadoPedido.ENTREGADO, "000000", null);

        assertThrows(IllegalArgumentException.class, () ->
                pedidoServicio.actualizarEstadoEmpresa(pedidoPublicId, dto)
        );
    }

    @Test
    void asignarRepartidor_repartidorValido_asignaYCambiaEstadoAAsignado() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        UUID pedidoPublicId = UUID.randomUUID();
        UUID repartidorPublicId = UUID.randomUUID();

        Pedido pedido = new Pedido(
                tenantId, 5L, new BigDecimal("50.00"), BigDecimal.ZERO, new BigDecimal("50.00"),
                MetodoPago.EFECTIVO, "Av. Central", null, geometryFactory.createPoint(new Coordinate(-77.07, -11.99)), null, "123456"
        );
        pedido.setEstado(EstadoPedido.CONFIRMADO);

        com.pidegas.modulos.flota.dominio.Repartidor repartidor =
                new com.pidegas.modulos.flota.dominio.Repartidor(tenantId, 8L, null, "LIC-12345");

        when(pedidoRepositorio.findByPublicIdAndTenantId(pedidoPublicId, tenantId)).thenReturn(Optional.of(pedido));
        when(repartidorRepositorio.findByPublicIdAndTenantId(repartidorPublicId, tenantId)).thenReturn(Optional.of(repartidor));
        when(pedidoRepositorio.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

        com.pidegas.modulos.pedidos.dto.AsignarRepartidorDto dto =
                new com.pidegas.modulos.pedidos.dto.AsignarRepartidorDto(repartidorPublicId);

        PedidoDetalleDto resultado = pedidoServicio.asignarRepartidor(pedidoPublicId, dto);

        assertNotNull(resultado);
        assertEquals(EstadoPedido.ASIGNADO, resultado.estado());
        assertEquals(8L, pedido.getRepartidorId());
        verify(notificacionWebSocketServicio, times(1)).notificarEstadoPedido(eq(tenantId), eq(pedidoPublicId), any());
    }
}
