package com.pidegas.modulos.fidelizacion.controlador;

import com.pidegas.modulos.fidelizacion.aplicacion.FidelizacionServicio;
import com.pidegas.modulos.fidelizacion.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/fidelizacion")
@Tag(name = "Fidelización - Clientes", description = "Billetera de puntos por compras de gas y validación de cupones")
@PreAuthorize("isAuthenticated()")
public class FidelizacionClienteControlador {

    private final FidelizacionServicio fidelizacionServicio;

    public FidelizacionClienteControlador(FidelizacionServicio fidelizacionServicio) {
        this.fidelizacionServicio = fidelizacionServicio;
    }

    @GetMapping("/billetera")
    @Operation(summary = "Consultar saldo de puntos de gas del cliente", description = "Retorna el saldo actual de puntos acumulados para canjes o descuentos.")
    public ResponseEntity<BilleteraPuntosDto> obtenerBilletera(Authentication authentication) {
        return ResponseEntity.ok(fidelizacionServicio.obtenerBilleteraCliente(authentication.getName()));
    }

    @GetMapping("/movimientos")
    @Operation(summary = "Historial de puntos acumulados y canjeados", description = "Lista los movimientos de puntos por compras de balones de gas.")
    public ResponseEntity<List<MovimientoPuntosDto>> obtenerMovimientos(Authentication authentication) {
        return ResponseEntity.ok(fidelizacionServicio.obtenerMovimientosPuntos(authentication.getName()));
    }

    @PostMapping("/validar-cupon")
    @Operation(summary = "Validar cupón de descuento promocional", description = "Verifica la validez de un código de descuento y calcula el monto descontado.")
    public ResponseEntity<ResultadoValidacionCuponDto> validarCupon(@Valid @RequestBody ValidarCuponDto dto) {
        return ResponseEntity.ok(fidelizacionServicio.validarCupon(dto));
    }
}
