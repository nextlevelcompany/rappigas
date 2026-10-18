package com.pidegas.modulos.fidelizacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ValidarCuponDto(
        @NotBlank(message = "El código del cupón es obligatorio")
        String codigo,

        @NotNull(message = "El subtotal del pedido es obligatorio")
        BigDecimal subtotal,

        UUID empresaPublicId
) {}
