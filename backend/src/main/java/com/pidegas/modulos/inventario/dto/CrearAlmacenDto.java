package com.pidegas.modulos.inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearAlmacenDto(
        @NotBlank(message = "El nombre del almacén es obligatorio")
        @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
        String nombre,

        @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
        String direccion
) {}
