package com.pidegas.modulos.finanzas.dto;

import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ProcesarPagoDto(
        @NotNull(message = "El UUID del pedido es obligatorio")
        UUID pedidoPublicId,

        @NotNull(message = "El método de pago es obligatorio")
        MetodoPago metodoPago,

        String telefonoYapePlin,
        String tokenTarjeta,
        String nombreTitular
) {}
