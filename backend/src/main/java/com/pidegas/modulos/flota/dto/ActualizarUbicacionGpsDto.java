package com.pidegas.modulos.flota.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ActualizarUbicacionGpsDto(
        @NotNull(message = "La latitud es obligatoria")
        Double latitud,

        @NotNull(message = "La longitud es obligatoria")
        Double longitud,

        UUID pedidoPublicId
) {}
