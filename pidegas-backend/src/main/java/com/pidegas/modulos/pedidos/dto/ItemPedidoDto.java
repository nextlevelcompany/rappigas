package com.pidegas.modulos.pedidos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ItemPedidoDto(
        @NotNull(message = "El public_id del producto es obligatorio")
        UUID productoPublicId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima es 1")
        Integer cantidad
) {}
