package com.pidegas.modulos.finanzas.dto;

import com.pidegas.modulos.finanzas.dominio.EstadoLiquidacion;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record LiquidacionDto(
        UUID publicId,
        OffsetDateTime periodoInicio,
        OffsetDateTime periodoFin,
        BigDecimal totalVentas,
        BigDecimal totalComisiones,
        BigDecimal totalALiquidar,
        EstadoLiquidacion estado,
        String referenciaBancaria,
        OffsetDateTime fechaPago,
        OffsetDateTime createdAt
) {}
