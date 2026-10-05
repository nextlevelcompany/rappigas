package com.pidegas.modulos.inventario.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlmacenDetalleDto(
        UUID publicId,
        Long tenantId,
        String nombre,
        String direccion,
        Boolean activo,
        OffsetDateTime createdAt
) {}
