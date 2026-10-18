package com.pidegas.modulos.pedidos.controlador;

import com.pidegas.modulos.pedidos.aplicacion.PedidoServicio;
import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dto.ActualizarEstadoPedidoDto;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;
import com.pidegas.modulos.pedidos.dto.ResumenMetricasPedidosDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pedidos")
@Tag(name = "Pedidos - Distribuidora", description = "Endpoints de gestión de pedidos y despacho para distribuidoras")
@PreAuthorize("hasAnyRole('EMPRESA', 'ADMIN')")
public class PedidoEmpresaControlador {

    private final PedidoServicio pedidoServicio;

    public PedidoEmpresaControlador(PedidoServicio pedidoServicio) {
        this.pedidoServicio = pedidoServicio;
    }

    @GetMapping
    @Operation(summary = "Listar pedidos de la distribuidora autenticada con filtro opcional de estado")
    public ResponseEntity<Page<PedidoDetalleDto>> listarPedidos(
            @RequestParam(required = false) EstadoPedido estado,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(pedidoServicio.listarPedidosEmpresa(estado, pageable));
    }

    @GetMapping("/metricas")
    @Operation(summary = "Obtener resumen y contadores de pedidos para el centro de control")
    public ResponseEntity<ResumenMetricasPedidosDto> obtenerMetricas() {
        return ResponseEntity.ok(pedidoServicio.obtenerMetricasEmpresa());
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Obtener detalle completo de un pedido de la distribuidora")
    public ResponseEntity<PedidoDetalleDto> obtenerPedido(@PathVariable UUID publicId) {
        return ResponseEntity.ok(pedidoServicio.obtenerPedidoEmpresa(publicId));
    }

    @PatchMapping("/{publicId}/estado")
    @Operation(summary = "Actualizar el estado del pedido (Confirmar, Despachar, Entregar, Cancelar)")
    public ResponseEntity<PedidoDetalleDto> actualizarEstado(
            @PathVariable UUID publicId,
            @Valid @RequestBody ActualizarEstadoPedidoDto dto
    ) {
        return ResponseEntity.ok(pedidoServicio.actualizarEstadoEmpresa(publicId, dto));
    }

    @PatchMapping("/{publicId}/asignar-repartidor")
    @Operation(summary = "Asignar un repartidor de la flota al pedido (cambia estado a ASIGNADO)")
    public ResponseEntity<PedidoDetalleDto> asignarRepartidor(
            @PathVariable UUID publicId,
            @Valid @RequestBody com.pidegas.modulos.pedidos.dto.AsignarRepartidorDto dto
    ) {
        return ResponseEntity.ok(pedidoServicio.asignarRepartidor(publicId, dto));
    }
}
