package com.pidegas.modulos.cobertura.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CrearZonaCoberturaDto(
        @NotBlank(message = "El nombre de la zona es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
        String nombre,

        @NotNull(message = "Las coordenadas del polígono son obligatorias")
        @Size(min = 4, message = "Un polígono cerrado requiere al menos 4 puntos [lng, lat] donde el primero y último coincidan")
        List<List<Double>> coordenadas
) {}
