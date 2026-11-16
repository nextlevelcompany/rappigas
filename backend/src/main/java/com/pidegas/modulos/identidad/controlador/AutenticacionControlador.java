package com.pidegas.modulos.identidad.controlador;

import com.pidegas.modulos.identidad.aplicacion.AutenticacionServicio;
import com.pidegas.modulos.identidad.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticación", description = "Endpoints de login, registro de clientes y gestión de tokens JWT")
public class AutenticacionControlador {

    private final AutenticacionServicio autenticacionServicio;

    public AutenticacionControlador(AutenticacionServicio autenticacionServicio) {
        this.autenticacionServicio = autenticacionServicio;
    }

    @PostMapping("/login")
    @Operation(summary = "Inicio de sesión", description = "Valida credenciales y retorna Access Token y Refresh Token")
    public ResponseEntity<RespuestaAutenticacionDto> login(@Valid @RequestBody LoginDto dto) {
        RespuestaAutenticacionDto respuesta = autenticacionServicio.iniciarSesion(dto);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/registro-cliente")
    @Operation(summary = "Registro de cliente", description = "Crea una cuenta para un cliente final y retorna tokens de sesión")
    public ResponseEntity<RespuestaAutenticacionDto> registrarCliente(@Valid @RequestBody RegistroClienteDto dto) {
        RespuestaAutenticacionDto respuesta = autenticacionServicio.registrarCliente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refrescar token", description = "Emite un nuevo Access Token a partir de un Refresh Token válido")
    public ResponseEntity<RespuestaAutenticacionDto> refrescarToken(@Valid @RequestBody RefreshTokenDto dto) {
        RespuestaAutenticacionDto respuesta = autenticacionServicio.refrescarToken(dto);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/yo")
    @Operation(summary = "Perfil del usuario autenticado", description = "Retorna los datos del usuario correspondiente al JWT actual")
    public ResponseEntity<UsuarioDetalleDto> obtenerPerfilActual(@AuthenticationPrincipal String email) {
        UsuarioDetalleDto usuario = autenticacionServicio.obtenerUsuarioActual(email);
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/yo")
    @Operation(summary = "Actualizar perfil del usuario autenticado", description = "Permite al cliente actualizar sus nombres, apellidos, teléfono o contraseña")
    public ResponseEntity<UsuarioDetalleDto> actualizarPerfilActual(
            @AuthenticationPrincipal String email,
            @RequestBody ActualizarPerfilDto dto) {
        UsuarioDetalleDto usuario = autenticacionServicio.actualizarPerfil(email, dto);
        return ResponseEntity.ok(usuario);
    }
}
