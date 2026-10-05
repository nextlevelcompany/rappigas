package com.pidegas.modulos.fidelizacion.dto;

import java.math.BigDecimal;

public record ResultadoValidacionCuponDto(
        boolean valido,
        String codigo,
        BigDecimal descuento,
        BigDecimal nuevoTotal,
        String mensaje
) {}
