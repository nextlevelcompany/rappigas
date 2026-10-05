package com.pidegas.modulos.catalogo.dto;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ActualizarProductoDto(
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        String descripcion,

        TipoBalonGas tipoGas,

        TipoValvulaGas tipoValvula,

        @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
        BigDecimal precio,

        String imagenUrl,

        EstadoProducto estado
) {}
