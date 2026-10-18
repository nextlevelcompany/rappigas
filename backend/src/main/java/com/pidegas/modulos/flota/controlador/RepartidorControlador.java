package com.pidegas.modulos.flota.controlador;

import com.pidegas.modulos.flota.aplicacion.FlotaServicio;
import com.pidegas.modulos.flota.dto.ActualizarUbicacionGpsDto;
import com.pidegas.modulos.pedidos.aplicacion.PedidoServicio;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repartidores")
@Tag(name = "Repartidores - Operaciones en Ruta", description = "Endpoints para que los repartidores gestionen entregas y transmitan GPS")
@PreAuthorize("hasAnyRole('REPARTIDOR', 'ADMIN')")
public class RepartidorControlador {

    private final PedidoServicio pedidoServicio;
    private final FlotaServicio flotaServicio;

    public RepartidorControlador(PedidoServicio pedidoServicio, FlotaServicio flotaServicio) {
        this.pedidoServicio = pedidoServicio;
        this.flotaServicio = flotaServicio;
    }

    @GetMapping("/pedidos/asignados")
    @Operation(summary = "Listar pedidos asignados y en camino para el repartidor autenticado")
    public ResponseEntity<Page<PedidoDetalleDto>> listarPedidosAsignados(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pedidoServicio.listarPedidosAsignadosRepartidor(email, pageable));
    }

    @PatchMapping("/pedidos/{publicId}/iniciar-ruta")
    @Operation(summary = "El repartidor inicia la entrega (cambia estado a EN_CAMINO)")
    public ResponseEntity<PedidoDetalleDto> iniciarRuta(
            @PathVariable UUID publicId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pedidoServicio.iniciarRutaRepartidor(publicId, email));
    }

    @PatchMapping("/pedidos/{publicId}/entregar")
    @Operation(summary = "El repartidor ingresa el código de 6 dígitos del cliente y marca ENTREGADO")
    public ResponseEntity<PedidoDetalleDto> confirmarEntrega(
            @PathVariable UUID publicId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String codigo = body != null ? body.get("codigoConfirmacion") : null;
        return ResponseEntity.ok(pedidoServicio.confirmarEntregaRepartidor(publicId, codigo, email));
    }

    @PostMapping("/ubicacion")
    @Operation(summary = "Actualizar posición GPS en vivo del repartidor durante la entrega")
    public ResponseEntity<Void> actualizarUbicacion(
            @Valid @RequestBody ActualizarUbicacionGpsDto dto,
            Authentication authentication
    ) {
        String email = authentication.getName();
        flotaServicio.actualizarUbicacionGps(dto, email);
        return ResponseEntity.noContent().build();
    }
}
