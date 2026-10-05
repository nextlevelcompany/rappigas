package com.pidegas.modulos.inventario.dto;

import com.pidegas.modulos.inventario.dominio.TipoMovimientoStock;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegistrarMovimientoDto(
        @NotNull(message = "El public_id del almacén es obligatorio")
        UUID almacenPublicId,

        @NotNull(message = "El public_id del producto es obligatorio")
        UUID productoPublicId,

        @NotNull(message = "El tipo de movimiento es obligatorio")
        TipoMovimientoStock tipoMovimiento,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad mínima debe ser 1")
        Integer cantidad,

        @Size(max = 255, message = "El motivo no puede exceder 255 caracteres")
        String motivo
) {}
