package com.pidegas.modulos.empresas.controlador;

import com.pidegas.modulos.empresas.aplicacion.EmpresaServicio;
import com.pidegas.modulos.empresas.dto.ActualizarEmpresaDto;
import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;
import com.pidegas.modulos.empresas.dto.RegistroEmpresaDto;
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
@Tag(name = "Empresas", description = "Endpoints de distribuidoras de gas y operaciones multi-tenant")
public class EmpresaControlador {

    private final EmpresaServicio empresaServicio;

    public EmpresaControlador(EmpresaServicio empresaServicio) {
        this.empresaServicio = empresaServicio;
    }

    @PostMapping("/empresas/registro")
    @Operation(summary = "Postulación / Registro de Distribuidora", description = "Registra una nueva empresa distribuidora en estado PENDIENTE de aprobación.")
    public ResponseEntity<EmpresaDetalleDto> registrarEmpresa(@Valid @RequestBody RegistroEmpresaDto dto) {
        EmpresaDetalleDto respuesta = empresaServicio.registrarEmpresa(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @GetMapping("/empresas/mi-empresa")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Perfil de la empresa autenticada", description = "Retorna los datos de la distribuidora del tenant autenticado.")
    public ResponseEntity<EmpresaDetalleDto> obtenerMiEmpresa() {
        return ResponseEntity.ok(empresaServicio.obtenerEmpresaActual());
    }

    @PutMapping("/empresas/mi-empresa")
    @PreAuthorize("hasRole('EMPRESA')")
    @Operation(summary = "Actualizar perfil de mi empresa", description = "Actualiza los datos comerciales de la empresa autenticada.")
    public ResponseEntity<EmpresaDetalleDto> actualizarMiEmpresa(@Valid @RequestBody ActualizarEmpresaDto dto) {
        return ResponseEntity.ok(empresaServicio.actualizarEmpresaActual(dto));
    }

    @GetMapping("/publico/empresas")
    @Operation(summary = "Directorio público de distribuidoras", description = "Lista todas las empresas aprobadas disponibles para clientes.")
    public ResponseEntity<List<EmpresaDetalleDto>> listarEmpresasPublicas() {
        return ResponseEntity.ok(empresaServicio.listarEmpresasPublicas());
    }

    @GetMapping("/publico/empresas/{publicId}")
    @Operation(summary = "Detalle público de una empresa", description = "Consulta la información pública de una empresa por su UUID.")
    public ResponseEntity<EmpresaDetalleDto> obtenerEmpresaPublica(@PathVariable UUID publicId) {
        return ResponseEntity.ok(empresaServicio.obtenerPorPublicId(publicId));
    }
}
