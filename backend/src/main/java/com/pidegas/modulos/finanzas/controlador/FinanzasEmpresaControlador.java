package com.pidegas.modulos.finanzas.controlador;

import com.pidegas.modulos.finanzas.aplicacion.FinanzasServicio;
import com.pidegas.modulos.finanzas.dto.*;
import com.pidegas.nucleo.seguridad.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empresa/finanzas")
@Tag(name = "Finanzas - Distribuidora", description = "Resumen financiero, pagos, comisiones y liquidaciones")
@PreAuthorize("hasAnyRole('EMPRESA', 'ADMIN')")
public class FinanzasEmpresaControlador {

    private final FinanzasServicio finanzasServicio;

    public FinanzasEmpresaControlador(FinanzasServicio finanzasServicio) {
        this.finanzasServicio = finanzasServicio;
    }

    private Long obtenerTenantRequerido() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalArgumentException("Se requiere contexto de tenant de distribuidora.");
        }
        return tenantId;
    }

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen financiero del distribuidor", description = "Ventas aprobadas, comisiones retenidas, pedidos pagados y saldo por liquidar.")
    public ResponseEntity<ResumenFinancieroDto> obtenerResumen() {
        return ResponseEntity.ok(finanzasServicio.obtenerResumenFinanciero(obtenerTenantRequerido()));
    }

    @GetMapping("/pagos")
    @Operation(summary = "Listar transacciones de pago de la distribuidora")
    public ResponseEntity<List<PagoDetalleDto>> listarPagos() {
        return ResponseEntity.ok(finanzasServicio.listarPagosPorEmpresa(obtenerTenantRequerido()));
    }

    @GetMapping("/liquidaciones")
    @Operation(summary = "Listar liquidaciones periódicas de la distribuidora")
    public ResponseEntity<List<LiquidacionDto>> listarLiquidaciones() {
        return ResponseEntity.ok(finanzasServicio.listarLiquidaciones(obtenerTenantRequerido()));
    }

    @PostMapping("/liquidaciones")
    @Operation(summary = "Generar liquidación de saldo para la distribuidora")
    public ResponseEntity<LiquidacionDto> generarLiquidacion(@Valid @RequestBody(required = false) GenerarLiquidacionDto dto) {
        return ResponseEntity.ok(finanzasServicio.generarLiquidacion(dto, obtenerTenantRequerido()));
    }

    @GetMapping(value = "/exportar/csv", produces = "text/csv")
    @Operation(summary = "Exportar reporte financiero completo a CSV/Excel", description = "Genera archivo CSV compatible con Excel con transacciones, comisiones y liquidaciones.")
    public ResponseEntity<byte[]> exportarCsv() {
        Long tenantId = obtenerTenantRequerido();
        byte[] csvData = finanzasServicio.exportarReporteFinancieroCsv(tenantId);
        String filename = "reporte_financiero_pidegas_" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }
}
