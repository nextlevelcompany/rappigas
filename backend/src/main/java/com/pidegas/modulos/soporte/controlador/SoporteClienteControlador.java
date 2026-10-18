package com.pidegas.modulos.soporte.controlador;

import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.modulos.soporte.aplicacion.SoporteServicio;
import com.pidegas.modulos.soporte.dto.CrearTicketDto;
import com.pidegas.modulos.soporte.dto.ResponderTicketDto;
import com.pidegas.modulos.soporte.dto.TicketDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clientes/soporte")
@Tag(name = "Soporte - Clientes", description = "Gestión de tickets de ayuda, garantías y reclamos de balones de gas")
@PreAuthorize("hasRole('CLIENTE')")
public class SoporteClienteControlador {

    private final SoporteServicio soporteServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    public SoporteClienteControlador(SoporteServicio soporteServicio, UsuarioRepositorio usuarioRepositorio) {
        this.soporteServicio = soporteServicio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    private Usuario obtenerUsuarioActual(Authentication authentication) {
        return usuarioRepositorio.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no autenticado"));
    }

    @PostMapping
    @Operation(summary = "Crear ticket de soporte o reclamo", description = "Permite al cliente registrar una incidencia o consulta sobre un pedido de gas o general.")
    public ResponseEntity<TicketDetalleDto> crearTicket(
            @Valid @RequestBody CrearTicketDto dto,
            Authentication authentication
    ) {
        Usuario cliente = obtenerUsuarioActual(authentication);
        TicketDetalleDto creado = soporteServicio.crearTicketCliente(cliente, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping
    @Operation(summary = "Listar mis tickets de soporte", description = "Retorna el historial de tickets registrados por el cliente.")
    public ResponseEntity<List<TicketDetalleDto>> listarMisTickets(Authentication authentication) {
        Usuario cliente = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.listarTicketsCliente(cliente));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obtener detalle y mensajes de un ticket", description = "Retorna el hilo completo de conversación del ticket de soporte.")
    public ResponseEntity<TicketDetalleDto> obtenerDetalleTicket(
            @PathVariable UUID publicId,
            Authentication authentication
    ) {
        Usuario cliente = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.obtenerTicketCliente(cliente, publicId));
    }

    @PostMapping("/{publicId}/mensajes")
    @Operation(summary = "Responder en un ticket existente", description = "Agrega una nueva respuesta o mensaje en el hilo del ticket.")
    public ResponseEntity<TicketDetalleDto> responderTicket(
            @PathVariable UUID publicId,
            @Valid @RequestBody ResponderTicketDto dto,
            Authentication authentication
    ) {
        Usuario cliente = obtenerUsuarioActual(authentication);
        return ResponseEntity.ok(soporteServicio.responderTicket(cliente, publicId, dto));
    }
}
