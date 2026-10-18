package com.pidegas.modulos.identidad.dto;

import java.util.UUID;

public record RespuestaAutenticacionDto(
        String accessToken,
        String refreshToken,
        String tokenType,
        UUID publicId,
        String email,
        String nombres,
        String apellidos,
        String rol,
        Long tenantId
) {}
