package com.pidegas.modulos.identidad.dto;

import java.time.Instant;
import java.util.UUID;

public record UsuarioDetalleDto(
        UUID publicId,
        String email,
        String nombres,
        String apellidos,
        String telefono,
        String rol,
        String estado,
        Instant createdAt
) {}
