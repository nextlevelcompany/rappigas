package com.pidegas.modulos.flota.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record RegistrarRepartidorDto(
        @NotBlank(message = "El email del usuario repartidor es obligatorio")
        @Email(message = "Email inválido")
        String email,

        String licenciaConducir,

        UUID vehiculoPublicId
) {}
