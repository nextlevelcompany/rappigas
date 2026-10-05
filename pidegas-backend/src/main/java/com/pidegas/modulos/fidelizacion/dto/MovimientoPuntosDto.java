package com.pidegas.modulos.fidelizacion.dto;

import com.pidegas.modulos.fidelizacion.dominio.TipoMovimientoPuntos;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MovimientoPuntosDto(
        Long id,
        TipoMovimientoPuntos tipoMovimiento,
        Integer puntos,
        Integer saldoResultante,
        String motivo,
        UUID pedidoPublicId,
        OffsetDateTime createdAt
) {}
