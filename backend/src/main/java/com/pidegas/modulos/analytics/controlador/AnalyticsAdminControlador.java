package com.pidegas.modulos.analytics.controlador;

import com.pidegas.modulos.analytics.aplicacion.AnalyticsServicio;
import com.pidegas.modulos.analytics.dto.DashboardAdminDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "Analytics - Super Admin", description = "Métricas globales de la plataforma PideGas: GMV, comisiones, empresas, clientes y entregas")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsAdminControlador {

    private final AnalyticsServicio analyticsServicio;

    public AnalyticsAdminControlador(AnalyticsServicio analyticsServicio) {
        this.analyticsServicio = analyticsServicio;
    }

    @GetMapping
    @Operation(summary = "Obtener dashboard global de la plataforma",
            description = "Retorna GMV, comisiones acumuladas, empresas activas, clientes registrados, tasa de entrega exitosa y volumen histórico.")
    public ResponseEntity<DashboardAdminDto> obtenerDashboard() {
        DashboardAdminDto dashboard = analyticsServicio.obtenerDashboardAdmin();
        return ResponseEntity.ok(dashboard);
    }
}
