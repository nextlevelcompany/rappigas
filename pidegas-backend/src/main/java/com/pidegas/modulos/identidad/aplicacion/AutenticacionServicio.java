package com.pidegas.modulos.identidad.aplicacion;

import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.EstadoUsuario;
import com.pidegas.modulos.identidad.dominio.RolUsuario;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.dto.*;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.JwtServicio;
import com.pidegas.modulos.auditoria.aplicacion.AuditoriaServicio;
import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AutenticacionServicio {

    private final UsuarioRepositorio usuarioRepositorio;
    private final EmpresaRepositorio empresaRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtServicio jwtServicio;
    private final AuditoriaServicio auditoriaServicio;

    public AutenticacionServicio(
            UsuarioRepositorio usuarioRepositorio,
            EmpresaRepositorio empresaRepositorio,
            PasswordEncoder passwordEncoder,
            JwtServicio jwtServicio,
            AuditoriaServicio auditoriaServicio) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.empresaRepositorio = empresaRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtServicio = jwtServicio;
        this.auditoriaServicio = auditoriaServicio;
    }

    @Transactional
    public RespuestaAutenticacionDto registrarCliente(RegistroClienteDto dto) {
        if (usuarioRepositorio.existsByEmail(dto.email().trim().toLowerCase())) {
            throw new IllegalArgumentException("El correo electrónico ya se encuentra registrado.");
        }

        Usuario usuario = new Usuario(
                null,
                dto.email().trim().toLowerCase(),
                passwordEncoder.encode(dto.password()),
                RolUsuario.CLIENTE,
                dto.nombres().trim(),
                dto.apellidos().trim(),
                dto.telefono() != null ? dto.telefono().trim() : null,
                EstadoUsuario.ACTIVO
        );

        usuario = usuarioRepositorio.save(usuario);

        String accessToken = jwtServicio.generarAccessToken(
                usuario.getId(),
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getRol().name(),
                null
        );

        String refreshToken = jwtServicio.generarRefreshToken(usuario.getEmail());

        auditoriaServicio.registrarEvento(
                usuario.getId(),
                null,
                TipoEventoAuditoria.REGISTRO_CLIENTE,
                "Cliente registrado exitosamente: " + usuario.getEmail(),
                null,
                null,
                null
        );

        return new RespuestaAutenticacionDto(
                accessToken,
                refreshToken,
                "Bearer",
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol().name(),
                null
        );
    }

    @Transactional(readOnly = true)
    public RespuestaAutenticacionDto iniciarSesion(LoginDto dto) {
        String email = dto.email().trim().toLowerCase();
        Usuario usuario = usuarioRepositorio.findByEmail(email).orElse(null);

        if (usuario == null || !passwordEncoder.matches(dto.password(), usuario.getPasswordHash())) {
            auditoriaServicio.registrarEvento(
                    usuario != null ? usuario.getId() : null,
                    null,
                    TipoEventoAuditoria.INICIO_SESION_FALLIDO,
                    "Intento fallido de inicio de sesión para email: " + email,
                    null,
                    null,
                    null
            );
            throw new IllegalArgumentException("Credenciales inválidas.");
        }

        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalArgumentException("La cuenta de usuario se encuentra " + usuario.getEstado().name().toLowerCase() + ".");
        }

        Long tenantId = null;
        if (usuario.getRol() == RolUsuario.EMPRESA) {
            Optional<Empresa> empresaOpt = empresaRepositorio.findByUsuarioAdminId(usuario.getId());
            if (empresaOpt.isPresent()) {
                tenantId = empresaOpt.get().getId();
            }
        }

        String accessToken = jwtServicio.generarAccessToken(
                usuario.getId(),
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getRol().name(),
                tenantId
        );

        String refreshToken = jwtServicio.generarRefreshToken(usuario.getEmail());

        auditoriaServicio.registrarEvento(
                usuario.getId(),
                tenantId,
                TipoEventoAuditoria.INICIO_SESION_EXITOSO,
                "Inicio de sesión exitoso (" + usuario.getRol().name() + ")",
                null,
                null,
                null
        );

        return new RespuestaAutenticacionDto(
                accessToken,
                refreshToken,
                "Bearer",
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol().name(),
                tenantId
        );
    }

    @Transactional(readOnly = true)
    public RespuestaAutenticacionDto refrescarToken(RefreshTokenDto dto) {
        if (!jwtServicio.esTokenValido(dto.refreshToken())) {
            throw new IllegalArgumentException("Token de actualización inválido o expirado.");
        }

        String email = jwtServicio.extraerEmail(dto.refreshToken());
        Usuario usuario = usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalArgumentException("La cuenta de usuario se encuentra " + usuario.getEstado().name().toLowerCase() + ".");
        }

        Long tenantId = null;
        if (usuario.getRol() == RolUsuario.EMPRESA) {
            Optional<Empresa> empresaOpt = empresaRepositorio.findByUsuarioAdminId(usuario.getId());
            if (empresaOpt.isPresent()) {
                tenantId = empresaOpt.get().getId();
            }
        }

        String nuevoAccessToken = jwtServicio.generarAccessToken(
                usuario.getId(),
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getRol().name(),
                tenantId
        );

        return new RespuestaAutenticacionDto(
                nuevoAccessToken,
                dto.refreshToken(),
                "Bearer",
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol().name(),
                tenantId
        );
    }

    @Transactional(readOnly = true)
    public UsuarioDetalleDto obtenerUsuarioActual(String email) {
        Usuario usuario = usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        return new UsuarioDetalleDto(
                usuario.getPublicId(),
                usuario.getEmail(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getTelefono(),
                usuario.getRol().name(),
                usuario.getEstado().name(),
                usuario.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<UsuarioDetalleDto> listarUsuariosAdmin(RolUsuario rol) {
        List<Usuario> lista;
        if (rol != null) {
            lista = usuarioRepositorio.findByRolOrderByCreatedAtDesc(rol);
        } else {
            lista = usuarioRepositorio.findAllByOrderByCreatedAtDesc();
        }
        return lista.stream()
                .map(u -> new UsuarioDetalleDto(
                        u.getPublicId(),
                        u.getEmail(),
                        u.getNombres(),
                        u.getApellidos(),
                        u.getTelefono(),
                        u.getRol().name(),
                        u.getEstado().name(),
                        u.getCreatedAt()
                ))
                .toList();
    }
}
