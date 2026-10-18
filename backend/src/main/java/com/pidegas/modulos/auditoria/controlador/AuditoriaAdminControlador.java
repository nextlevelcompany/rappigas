package com.pidegas.modulos.auditoria.controlador;

import com.pidegas.modulos.auditoria.aplicacion.AuditoriaServicio;
import com.pidegas.modulos.auditoria.dto.RegistroAuditoriaDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/auditoria")
@Tag(name = "Auditoría - Super Admin", description = "Trazabilidad forense y registro cronológico de eventos sensibles")
@PreAuthorize("hasRole('ADMIN')")
public class AuditoriaAdminControlador {

    private final AuditoriaServicio auditoriaServicio;

    public AuditoriaAdminControlador(AuditoriaServicio auditoriaServicio) {
        this.auditoriaServicio = auditoriaServicio;
    }

    @GetMapping
    @Operation(summary = "Listar últimos 100 eventos sensibles del sistema", description = "Retorna historial cronológico de auditoría con IPs, usuarios y tipos de evento.")
    public ResponseEntity<List<RegistroAuditoriaDto>> listarEventos() {
        return ResponseEntity.ok(auditoriaServicio.listarUltimosEventos());
    }
}
