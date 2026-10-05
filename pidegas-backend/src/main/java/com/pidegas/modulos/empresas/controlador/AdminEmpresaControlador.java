package com.pidegas.modulos.empresas.controlador;

import com.pidegas.modulos.empresas.aplicacion.EmpresaServicio;
import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import com.pidegas.modulos.empresas.dto.CambiarEstadoEmpresaDto;
import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/empresas")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Super Admin - Empresas", description = "Endpoints de administración global para supervisar y aprobar distribuidoras")
public class AdminEmpresaControlador {

    private final EmpresaServicio empresaServicio;

    public AdminEmpresaControlador(EmpresaServicio empresaServicio) {
        this.empresaServicio = empresaServicio;
    }

    @GetMapping
    @Operation(summary = "Listado administrativo de empresas", description = "Lista todas las empresas con filtro opcional por estado (PENDIENTE, APROBADA, etc.).")
    public ResponseEntity<List<EmpresaDetalleDto>> listarEmpresas(
            @RequestParam(required = false) EstadoEmpresa estado) {
        return ResponseEntity.ok(empresaServicio.listarEmpresasAdmin(estado));
    }

    @GetMapping("/{publicId}")
    @Operation(summary = "Detalle administrativo de empresa", description = "Obtiene los detalles completos de una empresa por su UUID.")
    public ResponseEntity<EmpresaDetalleDto> obtenerEmpresa(@PathVariable UUID publicId) {
        return ResponseEntity.ok(empresaServicio.obtenerPorPublicId(publicId));
    }

    @PatchMapping("/{publicId}/estado")
    @Operation(summary = "Aprobar / Suspender / Rechazar empresa", description = "Cambia el estado de afiliación de una empresa en la plataforma.")
    public ResponseEntity<EmpresaDetalleDto> cambiarEstado(
            @PathVariable UUID publicId,
            @Valid @RequestBody CambiarEstadoEmpresaDto dto) {
        return ResponseEntity.ok(empresaServicio.cambiarEstadoEmpresa(publicId, dto.nuevoEstado()));
    }
}
