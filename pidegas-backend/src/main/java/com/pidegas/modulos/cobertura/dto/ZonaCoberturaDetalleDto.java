package com.pidegas.modulos.cobertura.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ZonaCoberturaDetalleDto(
        Long id,
        UUID publicId,
        Long tenantId,
        String nombre,
        Boolean activa,
        List<List<Double>> coordenadas,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
