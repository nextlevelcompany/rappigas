package com.pidegas.modulos.cobertura.dto;

import jakarta.validation.constraints.NotNull;

public record VerificarCoberturaDto(
        @NotNull(message = "La latitud es obligatoria")
        Double lat,

        @NotNull(message = "La longitud es obligatoria")
        Double lng
) {}
