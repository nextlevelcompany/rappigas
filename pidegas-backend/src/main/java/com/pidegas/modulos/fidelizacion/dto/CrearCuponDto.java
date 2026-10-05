package com.pidegas.modulos.fidelizacion.dto;

import com.pidegas.modulos.fidelizacion.dominio.TipoDescuento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CrearCuponDto(
        @NotBlank(message = "El código del cupón es obligatorio")
        @Size(max = 30, message = "El código no puede exceder 30 caracteres")
        String codigo,

        @NotNull(message = "El tipo de descuento es obligatorio")
        TipoDescuento tipoDescuento,

        @NotNull(message = "El valor del descuento es obligatorio")
        @DecimalMin(value = "0.01", message = "El descuento debe ser mayor a 0")
        BigDecimal valorDescuento,

        BigDecimal pedidoMinimo,

        Integer usosMaximos,

        OffsetDateTime validoDesde,

        OffsetDateTime validoHasta
) {}
