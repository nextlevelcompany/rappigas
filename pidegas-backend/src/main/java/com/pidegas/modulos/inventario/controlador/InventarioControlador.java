package com.pidegas.modulos.inventario.controlador;

import com.pidegas.modulos.inventario.aplicacion.InventarioServicio;
import com.pidegas.modulos.inventario.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventario")
@Tag(name = "Inventario y Kardex", description = "Endpoints de gestión de almacenes, stock de balones de gas y movimientos Kardex")
@PreAuthorize("hasAnyRole('EMPRESA', 'ADMIN')")
public class InventarioControlador {

    private final InventarioServicio inventarioServicio;

    public InventarioControlador(InventarioServicio inventarioServicio) {
        this.inventarioServicio = inventarioServicio;
    }

    @GetMapping("/almacenes")
    @Operation(summary = "Listar almacenes de la distribuidora", description = "Retorna todos los almacenes o plantas de despacho de la empresa autenticada.")
    public ResponseEntity<List<AlmacenDetalleDto>> listarAlmacenes() {
        return ResponseEntity.ok(inventarioServicio.listarAlmacenes());
    }

    @PostMapping("/almacenes")
    @Operation(summary = "Crear nuevo almacén o depósito de balones", description = "Registra un nuevo almacén para la distribuidora.")
    public ResponseEntity<AlmacenDetalleDto> crearAlmacen(@Valid @RequestBody CrearAlmacenDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioServicio.crearAlmacen(dto));
    }

    @GetMapping("/stock")
    @Operation(summary = "Consultar stock de balones de gas", description = "Retorna el inventario actual de balones con alertas de stock mínimo.")
    public ResponseEntity<List<StockProductoDetalleDto>> consultarStock(
            @RequestParam(required = false) UUID almacenPublicId
    ) {
        return ResponseEntity.ok(inventarioServicio.consultarStock(almacenPublicId));
    }

    @PostMapping("/movimientos")
    @Operation(summary = "Registrar movimiento de Kardex", description = "Registra una entrada, salida, ajuste o devolución en el inventario.")
    public ResponseEntity<StockProductoDetalleDto> registrarMovimiento(@Valid @RequestBody RegistrarMovimientoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioServicio.registrarMovimiento(dto));
    }

    @GetMapping("/kardex")
    @Operation(summary = "Historial de movimientos Kardex", description = "Consulta paginada de todos los movimientos de inventario de la distribuidora.")
    public ResponseEntity<Page<MovimientoStockDetalleDto>> obtenerKardex(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(inventarioServicio.obtenerKardex(pageable));
    }

    @GetMapping("/resumen")
    @Operation(summary = "Resumen de inventario y alertas", description = "Métricas globales de balones disponibles, reservados y alertas de reposición.")
    public ResponseEntity<ResumenInventarioDto> obtenerResumen() {
        return ResponseEntity.ok(inventarioServicio.obtenerResumenInventario());
    }
}
