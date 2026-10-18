package com.pidegas.modulos.cobertura.controlador;

import com.pidegas.modulos.cobertura.aplicacion.UbigeoServicio;
import com.pidegas.modulos.cobertura.dto.UbigeoDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/publico/ubigeo")
@Tag(name = "Ubigeo INEI", description = "Endpoints públicos para consulta de Departamentos, Provincias y Distritos del Perú")
public class UbigeoControlador {

    private final UbigeoServicio ubigeoServicio;

    public UbigeoControlador(UbigeoServicio ubigeoServicio) {
        this.ubigeoServicio = ubigeoServicio;
    }

    @GetMapping("/departamentos")
    @Operation(summary = "Listar departamentos", description = "Retorna la lista de todos los departamentos disponibles.")
    public ResponseEntity<List<String>> listarDepartamentos() {
        return ResponseEntity.ok(ubigeoServicio.listarDepartamentos());
    }

    @GetMapping("/provincias")
    @Operation(summary = "Listar provincias", description = "Retorna las provincias de un departamento específico.")
    public ResponseEntity<List<String>> listarProvincias(@RequestParam String departamento) {
        return ResponseEntity.ok(ubigeoServicio.listarProvincias(departamento));
    }

    @GetMapping("/distritos")
    @Operation(summary = "Listar distritos", description = "Retorna los distritos con su código INEI para un departamento y provincia dados.")
    public ResponseEntity<List<UbigeoDto>> listarDistritos(
            @RequestParam String departamento,
            @RequestParam String provincia
    ) {
        return ResponseEntity.ok(ubigeoServicio.listarDistritos(departamento, provincia));
    }

    @GetMapping("/{codigoInei}")
    @Operation(summary = "Buscar ubigeo por código INEI", description = "Consulta la información geográfica de un código de 6 dígitos.")
    public ResponseEntity<UbigeoDto> buscarPorCodigoInei(@PathVariable String codigoInei) {
        return ResponseEntity.ok(ubigeoServicio.buscarPorCodigoInei(codigoInei));
    }
}
