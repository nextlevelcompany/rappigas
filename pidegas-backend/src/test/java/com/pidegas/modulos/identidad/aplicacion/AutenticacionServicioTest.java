package com.pidegas.modulos.identidad.aplicacion;

import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.dto.LoginDto;
import com.pidegas.modulos.identidad.dto.RefreshTokenDto;
import com.pidegas.modulos.identidad.dto.RegistroClienteDto;
import com.pidegas.modulos.identidad.dto.RespuestaAutenticacionDto;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.JwtServicio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutenticacionServicioTest {

    @Mock
    private UsuarioRepositorio usuarioRepositorio;

    @Mock
    private EmpresaRepositorio empresaRepositorio;

    @Mock
    private com.pidegas.modulos.auditoria.aplicacion.AuditoriaServicio auditoriaServicio;

    private PasswordEncoder passwordEncoder;
    private JwtServicio jwtServicio;
    private AutenticacionServicio autenticacionServicio;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtServicio = new JwtServicio(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86400000,
                604800000
        );

        autenticacionServicio = new AutenticacionServicio(
                usuarioRepositorio,
                empresaRepositorio,
                passwordEncoder,
                jwtServicio,
                auditoriaServicio
        );
    }

    @Test
    void registrarCliente_Exitoso() {
        RegistroClienteDto dto = new RegistroClienteDto(
                "nuevo@cliente.pe",
                "Password123!",
                "Ana",
                "García",
                "+51987654321"
        );

        when(usuarioRepositorio.existsByEmail("nuevo@cliente.pe")).thenReturn(false);

        Usuario usuarioGuardado = new Usuario(
                UUID.randomUUID(),
                "nuevo@cliente.pe",
                passwordEncoder.encode("Password123!"),
                RolUsuario.CLIENTE,
                "Ana",
                "García",
                "+51987654321",
                EstadoUsuario.ACTIVO
        );
        usuarioGuardado.setId(10L);

        when(usuarioRepositorio.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        RespuestaAutenticacionDto respuesta = autenticacionServicio.registrarCliente(dto);

        assertNotNull(respuesta);
        assertEquals("nuevo@cliente.pe", respuesta.email());
        assertEquals("CLIENTE", respuesta.rol());
        assertNotNull(respuesta.accessToken());
        assertNotNull(respuesta.refreshToken());
        assertTrue(jwtServicio.esTokenValido(respuesta.accessToken()));
        assertEquals("nuevo@cliente.pe", jwtServicio.extraerEmail(respuesta.accessToken()));
        assertEquals("CLIENTE", jwtServicio.extraerRol(respuesta.accessToken()));
    }

    @Test
    void registrarCliente_EmailDuplicado_LanzaExcepcion() {
        RegistroClienteDto dto = new RegistroClienteDto(
                "duplicado@cliente.pe",
                "Password123!",
                "Pedro",
                "Pérez",
                null
        );

        when(usuarioRepositorio.existsByEmail("duplicado@cliente.pe")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> autenticacionServicio.registrarCliente(dto));
        verify(usuarioRepositorio, never()).save(any());
    }

    @Test
    void iniciarSesion_Exitoso() {
        LoginDto dto = new LoginDto("usuario@pidegas.pe", "MiPassword123!");

        Usuario usuario = new Usuario(
                UUID.randomUUID(),
                "usuario@pidegas.pe",
                passwordEncoder.encode("MiPassword123!"),
                RolUsuario.CLIENTE,
                "María",
                "López",
                "+51912345678",
                EstadoUsuario.ACTIVO
        );
        usuario.setId(5L);

        when(usuarioRepositorio.findByEmail("usuario@pidegas.pe")).thenReturn(Optional.of(usuario));

        RespuestaAutenticacionDto respuesta = autenticacionServicio.iniciarSesion(dto);

        assertNotNull(respuesta);
        assertEquals("usuario@pidegas.pe", respuesta.email());
        assertTrue(jwtServicio.esTokenValido(respuesta.accessToken()));
        assertEquals("CLIENTE", jwtServicio.extraerRol(respuesta.accessToken()));
    }

    @Test
    void iniciarSesion_PasswordInvalido_LanzaExcepcion() {
        LoginDto dto = new LoginDto("usuario@pidegas.pe", "PasswordErroneo");

        Usuario usuario = new Usuario(
                UUID.randomUUID(),
                "usuario@pidegas.pe",
                passwordEncoder.encode("PasswordCorrecto123!"),
                RolUsuario.CLIENTE,
                "María",
                "López",
                null,
                EstadoUsuario.ACTIVO
        );

        when(usuarioRepositorio.findByEmail("usuario@pidegas.pe")).thenReturn(Optional.of(usuario));

        assertThrows(IllegalArgumentException.class, () -> autenticacionServicio.iniciarSesion(dto));
    }

    @Test
    void iniciarSesion_UsuarioBaneado_LanzaExcepcion() {
        LoginDto dto = new LoginDto("baneado@pidegas.pe", "PassCorrecto123!");

        Usuario usuario = new Usuario(
                UUID.randomUUID(),
                "baneado@pidegas.pe",
                passwordEncoder.encode("PassCorrecto123!"),
                RolUsuario.CLIENTE,
                "Usuario",
                "Baneado",
                null,
                EstadoUsuario.BANEADO
        );

        when(usuarioRepositorio.findByEmail("baneado@pidegas.pe")).thenReturn(Optional.of(usuario));

        assertThrows(IllegalArgumentException.class, () -> autenticacionServicio.iniciarSesion(dto));
    }

    @Test
    void refrescarToken_Exitoso() {
        String refreshToken = jwtServicio.generarRefreshToken("usuario@pidegas.pe");
        RefreshTokenDto dto = new RefreshTokenDto(refreshToken);

        Usuario usuario = new Usuario(
                UUID.randomUUID(),
                "usuario@pidegas.pe",
                "hash",
                RolUsuario.CLIENTE,
                "User",
                "Test",
                null,
                EstadoUsuario.ACTIVO
        );
        usuario.setId(7L);

        when(usuarioRepositorio.findByEmail("usuario@pidegas.pe")).thenReturn(Optional.of(usuario));

        RespuestaAutenticacionDto respuesta = autenticacionServicio.refrescarToken(dto);

        assertNotNull(respuesta);
        assertNotNull(respuesta.accessToken());
        assertTrue(jwtServicio.esTokenValido(respuesta.accessToken()));
        assertEquals("usuario@pidegas.pe", jwtServicio.extraerEmail(respuesta.accessToken()));
    }
}
