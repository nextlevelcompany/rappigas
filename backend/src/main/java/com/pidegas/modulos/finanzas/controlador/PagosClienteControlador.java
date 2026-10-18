package com.pidegas.modulos.finanzas.controlador;

import com.pidegas.modulos.finanzas.aplicacion.FinanzasServicio;
import com.pidegas.modulos.finanzas.dto.ProcesarPagoDto;
import com.pidegas.modulos.finanzas.pasarela.ResultadoProcesamientoPago;
import com.pidegas.modulos.identidad.dominio.Usuario;
import com.pidegas.modulos.identidad.repositorio.UsuarioRepositorio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clientes/pagos")
@Tag(name = "Finanzas - Clientes", description = "Procesamiento de pagos y pasarela electrónica")
@PreAuthorize("isAuthenticated()")
public class PagosClienteControlador {

    private final FinanzasServicio finanzasServicio;
    private final UsuarioRepositorio usuarioRepositorio;

    public PagosClienteControlador(FinanzasServicio finanzasServicio, UsuarioRepositorio usuarioRepositorio) {
        this.finanzasServicio = finanzasServicio;
        this.usuarioRepositorio = usuarioRepositorio;
    }

    @PostMapping("/procesar")
    @Operation(summary = "Procesar pago de pedido con pasarela", description = "Procesa el pago vía Yape, Plin o Tarjeta para un pedido existente.")
    public ResponseEntity<ResultadoProcesamientoPago> procesarPago(
            @Valid @RequestBody ProcesarPagoDto dto,
            Authentication authentication
    ) {
        Usuario cliente = usuarioRepositorio.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        ResultadoProcesamientoPago resultado = finanzasServicio.procesarPagoPedido(dto, cliente.getId());
        return ResponseEntity.ok(resultado);
    }
}
