package com.pidegas.modulos.flota.aplicacion;

import com.pidegas.modulos.flota.dominio.EstadoVehiculo;
import com.pidegas.modulos.flota.dominio.Repartidor;
import com.pidegas.modulos.flota.dominio.TipoVehiculo;
import com.pidegas.modulos.flota.dominio.Vehiculo;
import com.pidegas.modulos.flota.dto.ActualizarUbicacionGpsDto;
import com.pidegas.modulos.flota.dto.CrearVehiculoDto;
import com.pidegas.modulos.flota.dto.RegistrarRepartidorDto;
import com.pidegas.modulos.flota.dto.RepartidorDetalleDto;
import com.pidegas.modulos.flota.dto.VehiculoDetalleDto;
import com.pidegas.modulos.flota.repositorio.RepartidorRepositorio;
import com.pidegas.modulos.flota.repositorio.VehiculoRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import com.pidegas.nucleo.websocket.NotificacionWebSocketServicio;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class FlotaServicioTest {

    private VehiculoRepositorio vehiculoRepositorio;
    private RepartidorRepositorio repartidorRepositorio;
    private UsuarioRepositorio usuarioRepositorio;
    private NotificacionWebSocketServicio notificacionWebSocketServicio;
    private FlotaServicio flotaServicio;

    @BeforeEach
    void setUp() {
        vehiculoRepositorio = mock(VehiculoRepositorio.class);
        repartidorRepositorio = mock(RepartidorRepositorio.class);
        usuarioRepositorio = mock(UsuarioRepositorio.class);
        notificacionWebSocketServicio = mock(NotificacionWebSocketServicio.class);

        flotaServicio = new FlotaServicio(
                vehiculoRepositorio,
                repartidorRepositorio,
                usuarioRepositorio,
                notificacionWebSocketServicio
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void crearVehiculo_conPlacaUnica_guardaExitosamente() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);

        CrearVehiculoDto dto = new CrearVehiculoDto("7821-4A", "Wanxin", "W150", TipoVehiculo.MOTO_FURGON, 12);

        when(vehiculoRepositorio.existsByTenantIdAndPlaca(tenantId, "7821-4A")).thenReturn(false);
        when(vehiculoRepositorio.save(any(Vehiculo.class))).thenAnswer(i -> i.getArgument(0));

        VehiculoDetalleDto resultado = flotaServicio.crearVehiculo(dto);

        assertNotNull(resultado);
        assertEquals("7821-4A", resultado.placa());
        assertEquals(TipoVehiculo.MOTO_FURGON, resultado.tipoVehiculo());
        assertEquals(EstadoVehiculo.ACTIVO, resultado.estado());
        verify(vehiculoRepositorio, times(1)).save(any(Vehiculo.class));
    }

    @Test
    void crearVehiculo_conPlacaDuplicada_lanzaExcepcion() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);

        CrearVehiculoDto dto = new CrearVehiculoDto("7821-4A", "Wanxin", "W150", TipoVehiculo.MOTO_FURGON, 12);
        when(vehiculoRepositorio.existsByTenantIdAndPlaca(tenantId, "7821-4A")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> flotaServicio.crearVehiculo(dto));
        verify(vehiculoRepositorio, never()).save(any());
    }

    @Test
    void registrarRepartidor_conUsuarioRepartidorValido_guardaExitosamente() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        String email = "repartidor@pidegas.pe";

        Usuario usuario = new Usuario(UUID.randomUUID(), email, "hash", RolUsuario.REPARTIDOR, "Manuel", "Rojas", "966555444", EstadoUsuario.ACTIVO);
        when(usuarioRepositorio.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(usuarioRepositorio.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(repartidorRepositorio.existsByTenantIdAndUsuarioId(tenantId, usuario.getId())).thenReturn(false);
        when(repartidorRepositorio.save(any(Repartidor.class))).thenAnswer(i -> i.getArgument(0));

        RegistrarRepartidorDto dto = new RegistrarRepartidorDto(email, "LIC-9988", null);
        RepartidorDetalleDto resultado = flotaServicio.registrarRepartidor(dto);

        assertNotNull(resultado);
        assertEquals("Manuel", resultado.nombres());
        assertEquals("Rojas", resultado.apellidos());
        assertEquals("LIC-9988", resultado.licenciaConducir());
        verify(repartidorRepositorio, times(1)).save(any(Repartidor.class));
    }

    @Test
    void registrarRepartidor_conRolInvalido_lanzaExcepcion() {
        Long tenantId = 1L;
        TenantContext.setTenantId(tenantId);
        String email = "cliente@pidegas.pe";

        Usuario usuario = new Usuario(UUID.randomUUID(), email, "hash", RolUsuario.CLIENTE, "Juan", "Perez", "966555444", EstadoUsuario.ACTIVO);
        when(usuarioRepositorio.findByEmail(email)).thenReturn(Optional.of(usuario));

        RegistrarRepartidorDto dto = new RegistrarRepartidorDto(email, "LIC-9988", null);

        assertThrows(IllegalArgumentException.class, () -> flotaServicio.registrarRepartidor(dto));
        verify(repartidorRepositorio, never()).save(any());
    }

    @Test
    void actualizarUbicacionGps_emiteWebSocket() {
        String email = "repartidor@pidegas.pe";
        Usuario usuario = new Usuario(UUID.randomUUID(), email, "hash", RolUsuario.REPARTIDOR, "Manuel", "Rojas", "966555444", EstadoUsuario.ACTIVO);
        Repartidor repartidor = new Repartidor(1L, usuario.getId(), null, "LIC-9988");

        when(usuarioRepositorio.findByEmail(email)).thenReturn(Optional.of(usuario));
        when(repartidorRepositorio.findByUsuarioId(usuario.getId())).thenReturn(Optional.of(repartidor));

        ActualizarUbicacionGpsDto dto = new ActualizarUbicacionGpsDto(-11.9950, -77.0720, UUID.randomUUID());
        flotaServicio.actualizarUbicacionGps(dto, email);

        assertNotNull(repartidor.getUltimaCoordenada());
        assertEquals(-77.0720, repartidor.getUltimaCoordenada().getX());
        assertEquals(-11.9950, repartidor.getUltimaCoordenada().getY());
        verify(notificacionWebSocketServicio, times(1)).notificarUbicacionGps(eq(1L), any());
    }
}
