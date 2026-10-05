package com.pidegas.modulos.fidelizacion.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BilleteraPuntosDto(
        Long id,
        UUID clientePublicId,
        String nombreCliente,
        Integer saldoPuntos,
        OffsetDateTime updatedAt
) {}
