package com.pidegas.modulos.empresas.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload para que el Super Administrador cambie la contraseña del administrador de la distribuidora")
public record CambiarPasswordEmpresaDto(
        @Schema(description = "Nueva contraseña de acceso (mínimo 6 caracteres)", example = "Segura123$")
        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
        String nuevaPassword
) {}
