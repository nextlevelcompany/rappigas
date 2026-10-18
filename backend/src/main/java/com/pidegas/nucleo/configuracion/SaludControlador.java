package com.pidegas.nucleo.configuracion;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/publico")
public class SaludControlador {

    @GetMapping("/salud")
    public ResponseEntity<Map<String, Object>> verificarSalud() {
        return ResponseEntity.ok(Map.of(
                "estado", "ACTIVO",
                "servicio", "RappiGas Backend API",
                "timestamp", Instant.now().toString(),
                "version", "1.0.0"
        ));
    }
}
