package com.pidegas.modulos.finanzas.dto;

import java.time.OffsetDateTime;

public record GenerarLiquidacionDto(
        OffsetDateTime periodoInicio,
        OffsetDateTime periodoFin
) {}
