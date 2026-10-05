package com.pidegas.modulos.catalogo.dto;

import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CrearProductoDto(
        @NotBlank(message = "El código SKU es obligatorio")
        @Size(max = 50, message = "El SKU no puede superar 50 caracteres")
        String sku,

        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        String descripcion,

        @NotNull(message = "El tipo de balón de gas es obligatorio")
        TipoBalonGas tipoGas,

        @NotNull(message = "El tipo de válvula es obligatorio")
        TipoValvulaGas tipoValvula,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
        BigDecimal precio,

        String imagenUrl
) {}
