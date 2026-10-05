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
@RequestMapping("/api/v1/empresa/soporte")
@Tag(name = "Soporte - Distribuidora", description = "Atención y resolución de incidencias de balones de gas y clientes")
@PreAuthorize("hasRole('EMPRESA')")
public class SoporteEmpresaControlador {

    private final SoporteServicio soporteServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    public SoporteEmpresaControlador(SoporteServicio soporteServicio, UsuarioRepositorio usuarioRepositorio) {
        this.soporteServicio = soporteServicio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    private Usuario obtenerUsuarioActual(Authentication authentication) {
        return usuarioRepositorio.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no autenticado"));
    }

    @GetMapping
    @Operation(summary = "Listar tickets asignados a la distribuidora", description = "Retorna todos los reclamos e incidencias dirigidas a la distribuidora.")
    public ResponseEntity<List<TicketDetalleDto>> listarTickets(Authentication authentication) {
        Usuario usuarioEmpresa = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.listarTicketsEmpresa(usuarioEmpresa));
    }

    @GetMapping("/resumen")
    @Operation(summary = "Métricas de tickets de la distribuidora", description = "Retorna contadores de tickets abiertos, en proceso y resueltos.")
    public ResponseEntity<ResumenSoporteDto> obtenerMetricas(Authentication authentication) {
        Usuario usuarioEmpresa = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.obtenerMetricasEmpresa(usuarioEmpresa));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obtener detalle y mensajes de un ticket", description = "Retorna el hilo completo de conversación.")
    public ResponseEntity<TicketDetalleDto> obtenerDetalleTicket(
            @PathVariable UUID publicId,
            Authentication authentication
    ) {
        Usuario usuarioEmpresa = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.obtenerTicketEmpresa(usuarioEmpresa, publicId));
    }

    @PostMapping("/{publicId}/mensajes")
    @Operation(summary = "Responder a un ticket de cliente", description = "Agrega una respuesta por parte de la distribuidora.")
    public ResponseEntity<TicketDetalleDto> responderTicket(
            @PathVariable UUID publicId,
            @Valid @RequestBody ResponderTicketDto dto,
            Authentication authentication
    ) {
        Usuario usuarioEmpresa = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.responderTicket(usuarioEmpresa, publicId, dto));
    }

    @PatchMapping("/{publicId}/estado")
    @Operation(summary = "Actualizar estado del ticket", description = "Permite cambiar el estado (p.ej. EN_PROCESO, RESUELTO, CERRADO).")
    public ResponseEntity<TicketDetalleDto> actualizarEstado(
            @PathVariable UUID publicId,
            @Valid @RequestBody ActualizarEstadoTicketDto dto,
            Authentication authentication
    ) {
        Usuario usuarioEmpresa = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.actualizarEstadoEmpresa(usuarioEmpresa, publicId, dto));
    }
}
