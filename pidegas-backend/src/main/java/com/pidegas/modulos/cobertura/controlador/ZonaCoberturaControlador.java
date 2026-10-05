package com.pidegas.modulos.cobertura.controlador;

import com.pidegas.modulos.cobertura.aplicacion.ZonaCoberturaServicio;
import com.pidegas.modulos.cobertura.dto.*;
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
@RequestMapping("/api/v1")
@Tag(name = "Cobertura Geoespacial", description = "Endpoints de polígonos de reparto PostGIS y verificación geoespacial ST_Covers")
public class ZonaCoberturaControlador {

    private final ZonaCoberturaServicio zonaCoberturaServicio;

    public ZonaCoberturaControlador(ZonaCoberturaServicio zonaCoberturaServicio) {
        this.zonaCoberturaServicio = zonaCoberturaServicio;
    }

    @GetMapping("/cobertura/zonas")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Listar zonas de mi empresa", description = "Retorna todas las zonas de cobertura poligonales de la distribuidora autenticada.")
    public ResponseEntity<List<ZonaCoberturaDetalleDto>> listarMisZonas() {
        return ResponseEntity.ok(zonaCoberturaServicio.listarMisZonas());
    }

    @GetMapping("/cobertura/zonas/{publicId}")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Obtener detalle de zona", description = "Obtiene los puntos del polígono de una zona específica de la empresa.")
    public ResponseEntity<ZonaCoberturaDetalleDto> obtenerMiZona(@PathVariable UUID publicId) {
        return ResponseEntity.ok(zonaCoberturaServicio.obtenerMiZona(publicId));
    }

    @PostMapping("/cobertura/zonas")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Crear zona de cobertura", description = "Crea un nuevo polígono de reparto en formato GeoJSON para la empresa autenticada.")
    public ResponseEntity<ZonaCoberturaDetalleDto> crearZona(@Valid @RequestBody CrearZonaCoberturaDto dto) {
        ZonaCoberturaDetalleDto creada = zonaCoberturaServicio.crearZona(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/cobertura/zonas/{publicId}")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Actualizar zona de cobertura", description = "Modifica el nombre, estado o geometría del polígono de cobertura.")
    public ResponseEntity<ZonaCoberturaDetalleDto> actualizarZona(
            @PathVariable UUID publicId,
            @Valid @RequestBody ActualizarZonaCoberturaDto dto
    ) {
        return ResponseEntity.ok(zonaCoberturaServicio.actualizarZona(publicId, dto));
    }

    @DeleteMapping("/cobertura/zonas/{publicId}")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Desactivar zona de cobertura", description = "Desactiva la zona de reparto para suspender despachos en esa área.")
    public ResponseEntity<Void> eliminarZona(@PathVariable UUID publicId) {
        zonaCoberturaServicio.eliminarZona(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/publico/cobertura/verificar")
    @Operation(summary = "Verificar cobertura por coordenadas", description = "Consulta espacial (ST_Covers) para determinar si una coordenada geográfica tiene cobertura de alguna distribuidora aprobada.")
    public ResponseEntity<RespuestaVerificarCoberturaDto> verificarCobertura(@Valid @RequestBody VerificarCoberturaDto dto) {
        return ResponseEntity.ok(zonaCoberturaServicio.verificarCobertura(dto));
    }
}
