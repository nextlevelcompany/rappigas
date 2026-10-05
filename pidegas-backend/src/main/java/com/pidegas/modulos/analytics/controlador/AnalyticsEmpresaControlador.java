package com.pidegas.modulos.analytics.controlador;

import com.pidegas.modulos.analytics.aplicacion.AnalyticsServicio;
import com.pidegas.modulos.analytics.dto.DashboardEmpresaDto;
import com.pidegas.modulos.empresas.dominio.Empresa;
import com.pidegas.modulos.empresas.repositorio.EmpresaRepositorio;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import com.pidegas.nucleo.seguridad.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/empresa/dashboard")
@Tag(name = "Analytics - Distribuidora", description = "Métricas operativas y de ventas de balones de gas en tiempo real")
@PreAuthorize("hasRole('EMPRESA')")
public class AnalyticsEmpresaControlador {

    private final AnalyticsServicio analyticsServicio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final EmpresaRepositorio empresaRepositorio;

    public AnalyticsEmpresaControlador(
            AnalyticsServicio analyticsServicio,
            UsuarioRepositorio usuarioRepositorio,
            EmpresaRepositorio empresaRepositorio) {
        this.analyticsServicio = analyticsServicio;
        this.usuarioRepositorio = usuarioRepositorio;
        this.empresaRepositorio = empresaRepositorio;
    }

    @GetMapping
    @Operation(summary = "Obtener dashboard consolidado de la distribuidora",
            description = "Retorna ventas del día, ventas del mes, ticket promedio, pedidos por estado, stock de balones y ventas por producto.")
    public ResponseEntity<DashboardEmpresaDto> obtenerDashboard(Authentication authentication) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            Usuario usuario = usuarioRepositorio.findByEmail(authentication.getName())
                    .orElseThrow(() -> new AccessDeniedException("Usuario no autenticado"));
            Empresa empresa = empresaRepositorio.findByUsuarioAdminId(usuario.getId())
                    .orElseThrow(() -> new AccessDeniedException("No se encontró empresa vinculada a este usuario"));
            tenantId = empresa.getId();
        }

        DashboardEmpresaDto dashboard = analyticsServicio.obtenerDashboardEmpresa(tenantId);
        return ResponseEntity.ok(dashboard);
    }
}
