package com.pidegas.modulos.soporte.aplicacion;

import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import com.pidegas.modulos.pedidos.repositorio.PedidoRepositorio;
import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.dominio.MensajeTicket;
import com.pidegas.modulos.soporte.dominio.PrioridadTicket;
import com.pidegas.modulos.soporte.dominio.TicketSoporte;
import com.pidegas.modulos.soporte.dto.ActualizarEstadoTicketDto;
import com.pidegas.modulos.soporte.dto.CrearTicketDto;
import com.pidegas.modulos.soporte.dto.ResponderTicketDto;
import com.pidegas.modulos.soporte.dto.TicketDetalleDto;
import com.pidegas.modulos.soporte.repositorio.MensajeTicketRepositorio;
import com.pidegas.modulos.soporte.repositorio.TicketSoporteRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SoporteServicioTest {

    private TicketSoporteRepositorio ticketSoporteRepositorio;
    private MensajeTicketRepositorio mensajeTicketRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private EmpresaRepositorio empresaRepositorio;
    private PedidoRepositorio pedidoRepositorio;

    private SoporteServicio soporteServicio;

    private final Long TENANT_ID = 1L;
    private final Long CLIENTE_ID = 10L;
    private final Long EMPRESA_USER_ID = 20L;

    private Usuario cliente;
    private Usuario usuarioEmpresa;

    @BeforeEach
    void setUp() {
        ticketSoporteRepositorio = mock(TicketSoporteRepositorio.class);
        mensajeTicketRepositorio = mock(MensajeTicketRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        empresaRepositorio = mock(EmpresaRepositorio.class);
        pedidoRepositorio = mock(PedidoRepositorio.class);

        soporteServicio = new SoporteServicioImpl(
                ticketSoporteRepositorio,
                mensajeTicketRepositorio,
                usuarioRepositorio,
                empresaRepositorio,
                pedidoRepositorio
        );

        cliente = new Usuario();
        ReflectionTestUtils.setField(cliente, "id", CLIENTE_ID);
        cliente.setEmail("cliente@pidegas.pe");
        cliente.setNombres("María");
        cliente.setApellidos("Quispe");
        cliente.setRol(RolUsuario.CLIENTE);

        usuarioEmpresa = new Usuario();
        ReflectionTestUtils.setField(usuarioEmpresa, "id", EMPRESA_USER_ID);
        usuarioEmpresa.setEmail("empresa@pidegas.pe");
        usuarioEmpresa.setNombres("Distribuidora");
        usuarioEmpresa.setApellidos("Gas Olivos");
        usuarioEmpresa.setRol(RolUsuario.EMPRESA);

        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void debeCrearTicketClienteCorrectamente() {
        UUID pedidoPublicId = UUID.randomUUID();
        Pedido pedido = new Pedido();
        ReflectionTestUtils.setField(pedido, "id", 100L);
        pedido.setTenantId(TENANT_ID);

        when(pedidoRepositorio.findByPublicId(pedidoPublicId)).thenReturn(Optional.of(pedido));
        when(ticketSoporteRepositorio.save(any(TicketSoporte.class))).thenAnswer(invocation -> {
            TicketSoporte t = invocation.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 1L);
            return t;
        });
        when(usuarioRepositorio.findById(CLIENTE_ID)).thenReturn(Optional.of(cliente));

        CrearTicketDto dto = new CrearTicketDto(
                "Fuga leve en válvula de balón 10kg",
                PrioridadTicket.URGENTE,
                pedidoPublicId,
                "Se percibe olor a gas luego de instalar el balón click-on.",
                "https://ejemplo.pe/foto-fuga.jpg"
        );

        TicketDetalleDto resultado = soporteServicio.crearTicketCliente(cliente, dto);

        assertNotNull(resultado);
        assertEquals("Fuga leve en válvula de balón 10kg", resultado.getAsunto());
        assertEquals(EstadoTicket.ABIERTO, resultado.getEstado());
        assertEquals(PrioridadTicket.URGENTE, resultado.getPrioridad());
        verify(ticketSoporteRepositorio, times(1)).save(any(TicketSoporte.class));
        verify(mensajeTicketRepositorio, times(1)).save(any(MensajeTicket.class));
    }

    @Test
    void debeResponderTicketComoEmpresaYActualizarEstadoAEnProceso() {
        UUID ticketPublicId = UUID.randomUUID();
        TicketSoporte ticket = new TicketSoporte(TENANT_ID, CLIENTE_ID, 100L, "Fuga en válvula", PrioridadTicket.ALTA);
        ReflectionTestUtils.setField(ticket, "id", 1L);
        ticket.setPublicId(ticketPublicId);
        ticket.setEstado(EstadoTicket.ABIERTO);

        when(ticketSoporteRepositorio.findByPublicId(ticketPublicId)).thenReturn(Optional.of(ticket));
        when(ticketSoporteRepositorio.save(any(TicketSoporte.class))).thenReturn(ticket);
        when(usuarioRepositorio.findById(EMPRESA_USER_ID)).thenReturn(Optional.of(usuarioEmpresa));

        ResponderTicketDto dto = new ResponderTicketDto(
                "Estimada María, estamos enviando a un técnico inmediatamente con una nueva válvula y balón de reemplazo.",
                null
        );

        TicketDetalleDto resultado = soporteServicio.responderTicket(usuarioEmpresa, ticketPublicId, dto);

        assertNotNull(resultado);
        assertEquals(EstadoTicket.EN_PROCESO, ticket.getEstado());
        verify(mensajeTicketRepositorio, times(1)).save(any(MensajeTicket.class));
    }

    @Test
    void debeActualizarEstadoTicketComoEmpresa() {
        UUID ticketPublicId = UUID.randomUUID();
        TicketSoporte ticket = new TicketSoporte(TENANT_ID, CLIENTE_ID, 100L, "Fuga en válvula", PrioridadTicket.ALTA);
        ReflectionTestUtils.setField(ticket, "id", 1L);
        ticket.setPublicId(ticketPublicId);
        ticket.setEstado(EstadoTicket.EN_PROCESO);

        when(ticketSoporteRepositorio.findByPublicId(ticketPublicId)).thenReturn(Optional.of(ticket));
        when(ticketSoporteRepositorio.save(any(TicketSoporte.class))).thenReturn(ticket);
        when(usuarioRepositorio.findById(EMPRESA_USER_ID)).thenReturn(Optional.of(usuarioEmpresa));

        ActualizarEstadoTicketDto dto = new ActualizarEstadoTicketDto(EstadoTicket.RESUELTO);
        TicketDetalleDto resultado = soporteServicio.actualizarEstadoEmpresa(usuarioEmpresa, ticketPublicId, dto);

        assertNotNull(resultado);
        assertEquals(EstadoTicket.RESUELTO, ticket.getEstado());
    }

    @Test
    void debeLanzarAccesoDenegadoSiClienteNoEsDuenoDelTicket() {
        UUID ticketPublicId = UUID.randomUUID();
        TicketSoporte ticket = new TicketSoporte(TENANT_ID, 999L, null, "Consulta ajena", PrioridadTicket.BAJA);
        ticket.setPublicId(ticketPublicId);

        when(ticketSoporteRepositorio.findByPublicId(ticketPublicId)).thenReturn(Optional.of(ticket));

        assertThrows(AccessDeniedException.class, () -> {
            soporteServicio.obtenerTicketCliente(cliente, ticketPublicId);
        });
    }
}
