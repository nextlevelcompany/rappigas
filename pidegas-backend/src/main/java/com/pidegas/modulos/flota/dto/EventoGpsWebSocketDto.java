package com.pidegas.modulos.flota.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EventoGpsWebSocketDto(
        UUID repartidorPublicId,
        UUID pedidoPublicId,
        Double latitud,
        Double longitud,
        OffsetDateTime timestamp
) {}
