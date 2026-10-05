package com.pidegas.modulos.flota.controlador;

import com.pidegas.modulos.flota.aplicacion.FlotaServicio;
import com.pidegas.modulos.flota.dto.CrearVehiculoDto;
import com.pidegas.modulos.flota.dto.RegistrarRepartidorDto;
import com.pidegas.modulos.flota.dto.RepartidorDetalleDto;
import com.pidegas.modulos.flota.dto.VehiculoDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flota")
@Tag(name = "Flota & Repartidores - Distribuidora", description = "Gestión de vehículos de reparto y personal de distribución")
@PreAuthorize("hasAnyRole('EMPRESA', 'ADMIN')")
public class FlotaControlador {

    private final FlotaServicio flotaServicio;

    public FlotaControlador(FlotaServicio flotaServicio) {
        this.flotaServicio = flotaServicio;
    }

    @GetMapping("/vehiculos")
    @Operation(summary = "Listar vehículos de reparto de la distribuidora")
    public ResponseEntity<List<VehiculoDetalleDto>> listarVehiculos() {
        return ResponseEntity.ok(flotaServicio.listarVehiculos());
    }

    @PostMapping("/vehiculos")
    @Operation(summary = "Registrar un nuevo vehículo de reparto (moto furgón, camioneta, camión GLP)")
    public ResponseEntity<VehiculoDetalleDto> crearVehiculo(@Valid @RequestBody CrearVehiculoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotaServicio.crearVehiculo(dto));
    }

    @GetMapping("/repartidores")
    @Operation(summary = "Listar repartidores afiliados a la distribuidora")
    public ResponseEntity<List<RepartidorDetalleDto>> listarRepartidores() {
        return ResponseEntity.ok(flotaServicio.listarRepartidores());
    }

    @PostMapping("/repartidores")
    @Operation(summary = "Afiliar un repartidor existente a la distribuidora")
    public ResponseEntity<RepartidorDetalleDto> registrarRepartidor(@Valid @RequestBody RegistrarRepartidorDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotaServicio.registrarRepartidor(dto));
    }
}
