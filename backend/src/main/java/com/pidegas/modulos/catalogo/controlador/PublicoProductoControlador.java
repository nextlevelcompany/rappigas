package com.pidegas.modulos.catalogo.controlador;

import com.pidegas.modulos.catalogo.aplicacion.ProductoServicio;
import com.pidegas.modulos.catalogo.dto.ProductoDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publico")
@Tag(name = "Catálogo Público", description = "Endpoints públicos de consulta de balones de gas de cocina para clientes")
public class PublicoProductoControlador {

    private final ProductoServicio productoServicio;

    public PublicoProductoControlador(ProductoServicio productoServicio) {
        this.productoServicio = productoServicio;
    }

    @GetMapping("/empresas/{empresaPublicId}/productos")
    @Operation(summary = "Catálogo de balones de una distribuidora", description = "Consulta la lista de balones de gas de cocina y precios activos que ofrece una empresa autorizada.")
    public ResponseEntity<List<ProductoDetalleDto>> listarProductosPublicos(@PathVariable UUID empresaPublicId) {
        return ResponseEntity.ok(productoServicio.listarProductosPorEmpresaPublica(empresaPublicId));
    }
}
