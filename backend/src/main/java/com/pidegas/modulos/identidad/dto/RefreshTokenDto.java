package com.pidegas.modulos.identidad.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenDto(
        @NotBlank(message = "El refresh token es obligatorio")
        String refreshToken
) {}
