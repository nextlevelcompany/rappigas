package com.pidegas.modulos.catalogo.controlador;

import com.pidegas.modulos.catalogo.aplicacion.ProductoServicio;
import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dto.ActualizarProductoDto;
import com.pidegas.modulos.catalogo.dto.CrearProductoDto;
import com.pidegas.modulos.catalogo.dto.ProductoDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/productos")
@PreAuthorize("hasRole('EMPRESA')")
@Tag(name = "Catálogo de Productos", description = "Endpoints de gestión de balones de gas de cocina, válvulas y precios por distribuidora")
public class ProductoControlador {

    private final ProductoServicio productoServicio;

    public ProductoControlador(ProductoServicio productoServicio) {
        this.productoServicio = productoServicio;
    }

    @GetMapping
    @Operation(summary = "Listar balones de gas de mi distribuidora", description = "Retorna el catálogo de balones y accesorios del tenant autenticado con filtro opcional de estado.")
    public ResponseEntity<List<ProductoDetalleDto>> listarMisProductos(
            @RequestParam(required = false) EstadoProducto estado
    ) {
        return ResponseEntity.ok(productoServicio.listarMisProductos(estado));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Detalle de un producto de mi catálogo", description = "Obtiene los datos completos de un balón de gas por su ID público.")
    public ResponseEntity<ProductoDetalleDto> obtenerMiProducto(@PathVariable UUID publicId) {
        return ResponseEntity.ok(productoServicio.obtenerMiProducto(publicId));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo balón de gas de cocina", description = "Agrega un nuevo producto al catálogo de la distribuidora autenticada.")
    public ResponseEntity<ProductoDetalleDto> crearProducto(@Valid @RequestBody CrearProductoDto dto) {
        ProductoDetalleDto creado = productoServicio.crearProducto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{publicId}")
    @Operation(summary = "Actualizar balón de gas o precio", description = "Modifica precio, disponibilidad, válvula o descripción de un balón.")
    public ResponseEntity<ProductoDetalleDto> actualizarProducto(
            @PathVariable UUID publicId,
            @Valid @RequestBody ActualizarProductoDto dto
    ) {
        return ResponseEntity.ok(productoServicio.actualizarProducto(publicId, dto));
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Desactivar balón de gas del catálogo", description = "Realiza la baja lógica del producto en el catálogo de la empresa.")
    public ResponseEntity<Void> eliminarProducto(@PathVariable UUID publicId) {
        productoServicio.eliminarProducto(publicId);
        return ResponseEntity.noContent().build();
    }
}
