package com.pidegas.modulos.pedidos.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AsignarRepartidorDto(
        @NotNull(message = "El public_id del repartidor es obligatorio")
        UUID repartidorPublicId
) {}
