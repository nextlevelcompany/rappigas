package com.pidegas.modulos.empresas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActualizarEmpresaDto(
        @NotBlank(message = "El nombre comercial es obligatorio")
        @Size(max = 150, message = "El nombre comercial no puede exceder 150 caracteres")
        String nombreComercial,

        String razonSocial,
        String telefono,
        String emailContacto,
        String direccionFiscal,
        String logoUrl
) {}
