package com.pidegas.modulos.finanzas.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumenFinancieroDto(
        BigDecimal totalVentasAprobadas,
        BigDecimal totalComisiones,
        BigDecimal comisionesPendientes,
        BigDecimal totalPorLiquidar,
        long pedidosPagados,
        List<PagoDetalleDto> ultimosPagos
) {}
