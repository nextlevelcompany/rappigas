package com.pidegas.modulos.pedidos.controlador;

import com.pidegas.modulos.pedidos.aplicacion.PedidoServicio;
import com.pidegas.modulos.pedidos.dto.CrearPedidoDto;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clientes/pedidos")
@Tag(name = "Pedidos - Clientes", description = "Endpoints para que los clientes realicen y sigan sus pedidos de gas")
@PreAuthorize("isAuthenticated()")
public class PedidoClienteControlador {

    private final PedidoServicio pedidoServicio;

    public PedidoClienteControlador(PedidoServicio pedidoServicio) {
        this.pedidoServicio = pedidoServicio;
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo pedido con validación de cobertura espacial PostGIS y catálogo")
    public ResponseEntity<PedidoDetalleDto> crearPedido(
            @Valid @RequestBody CrearPedidoDto dto,
            Authentication authentication
    ) {
        String email = authentication.getName();
        PedidoDetalleDto pedido = pedidoServicio.crearPedidoCliente(dto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping
    @Operation(summary = "Listar el historial de pedidos del cliente autenticado")
    public ResponseEntity<Page<PedidoDetalleDto>> listarMisPedidos(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pedidoServicio.listarMisPedidosCliente(email, pageable));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obtener el detalle y seguimiento en vivo de un pedido del cliente")
    public ResponseEntity<PedidoDetalleDto> obtenerMiPedido(
            @PathVariable UUID publicId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pedidoServicio.obtenerMiPedidoCliente(publicId, email));
    }

    @PatchMapping("/{publicId}/cancelar")
    @Operation(summary = "Cancelar un pedido que aún se encuentra en estado PENDIENTE")
    public ResponseEntity<PedidoDetalleDto> cancelarMiPedido(
            @PathVariable UUID publicId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pedidoServicio.cancelarPedidoCliente(publicId, email));
    }
}
