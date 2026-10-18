package com.pidegas.modulos.fidelizacion.controlador;

import com.pidegas.modulos.fidelizacion.aplicacion.FidelizacionServicio;
import com.pidegas.modulos.fidelizacion.dto.CrearCuponDto;
import com.pidegas.modulos.fidelizacion.dto.CuponDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empresa/promociones")
@Tag(name = "Promociones - Distribuidora", description = "Gestión de cupones y campañas promocionales de balones de gas")
@PreAuthorize("hasAnyRole('EMPRESA', 'ADMIN')")
public class PromocionesEmpresaControlador {

    private final FidelizacionServicio fidelizacionServicio;

    public PromocionesEmpresaControlador(FidelizacionServicio fidelizacionServicio) {
        this.fidelizacionServicio = fidelizacionServicio;
    }

    @GetMapping("/cupones")
    @Operation(summary = "Listar cupones de descuento de la distribuidora")
    public ResponseEntity<List<CuponDetalleDto>> listarCupones() {
        return ResponseEntity.ok(fidelizacionServicio.listarCuponesEmpresa());
    }

    @PostMapping("/cupones")
    @Operation(summary = "Crear nuevo cupón de descuento promocional")
    public ResponseEntity<CuponDetalleDto> crearCupon(@Valid @RequestBody CrearCuponDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fidelizacionServicio.crearCupon(dto));
    }
}
