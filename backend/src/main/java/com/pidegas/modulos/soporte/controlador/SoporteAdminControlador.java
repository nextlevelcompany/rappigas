package com.pidegas.modulos.soporte.controlador;

import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.soporte.aplicacion.SoporteServicio;
import com.pidegas.modulos.soporte.dto.ActualizarEstadoTicketDto;
import com.pidegas.modulos.soporte.dto.ResponderTicketDto;
import com.pidegas.modulos.soporte.dto.ResumenSoporteDto;
import com.pidegas.modulos.soporte.dto.TicketDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/soporte")
@Tag(name = "Soporte - Super Admin", description = "Supervisión global de incidencias y mediación de disputas PQRS")
@PreAuthorize("hasRole('ADMIN')")
public class SoporteAdminControlador {

    private final SoporteServicio soporteServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    public SoporteAdminControlador(SoporteServicio soporteServicio, UsuarioRepositorio usuarioRepositorio) {
        this.soporteServicio = soporteServicio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    private Usuario obtenerUsuarioActual(Authentication authentication) {
        return usuarioRepositorio.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no autenticado"));
    }

    @GetMapping
    @Operation(summary = "Listar todos los tickets del sistema", description = "Retorna todos los tickets de todas las distribuidoras y clientes para auditoría y mediación.")
    public ResponseEntity<List<TicketDetalleDto>> listarTodos() {
        return ResponseEntity.ok(soporteServicio.listarTicketsAdmin());
    }

    @GetMapping("/resumen")
    @Operation(summary = "Métricas globales de soporte", description = "Retorna contadores de tickets abiertos, en proceso, resueltos y cerrados en toda la plataforma.")
    public ResponseEntity<ResumenSoporteDto> obtenerMetricas() {
        return ResponseEntity.ok(soporteServicio.obtenerMetricasAdmin());
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obtener detalle y mensajes de un ticket", description = "Retorna el hilo completo de conversación.")
    public ResponseEntity<TicketDetalleDto> obtenerDetalleTicket(@PathVariable UUID publicId) {
        return ResponseEntity.ok(soporteServicio.obtenerTicketAdmin(publicId));
    }

    @PostMapping("/{publicId}/mensajes")
    @Operation(summary = "Mediar o responder como Super Administrador", description = "Agrega una resolución o intervención oficial en el hilo del ticket.")
    public ResponseEntity<TicketDetalleDto> responderTicket(
            @PathVariable UUID publicId,
            @Valid @RequestBody ResponderTicketDto dto,
            Authentication authentication
    ) {
        Usuario admin = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.responderTicket(admin, publicId, dto));
    }

    @PatchMapping("/{publicId}/estado")
    @Operation(summary = "Actualizar estado oficial del ticket", description = "Permite al administrador dictaminar el estado del reclamo (RESUELTO, CERRADO, etc.).")
    public ResponseEntity<TicketDetalleDto> actualizarEstado(
            @PathVariable UUID publicId,
            @Valid @RequestBody ActualizarEstadoTicketDto dto
    ) {
        return ResponseEntity.ok(soporteServicio.actualizarEstadoAdmin(publicId, dto));
    }
}
