package com.pidegas.modulos.empresas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroEmpresaDto(
        @NotBlank(message = "El RUC es obligatorio")
        @Pattern(regexp = "^(10|20)\\d{9}$", message = "El RUC debe tener 11 dígitos y comenzar con 10 o 20")
        String ruc,

        @NotBlank(message = "El nombre comercial es obligatorio")
        @Size(max = 150, message = "El nombre comercial no puede exceder 150 caracteres")
        String nombreComercial,

        String razonSocial,
        String telefono,

        @NotBlank(message = "El email comercial es obligatorio")
        @Email(message = "Email comercial inválido")
        String emailContacto,

        String direccionFiscal,

        @NotBlank(message = "El email de acceso del administrador es obligatorio")
        @Email(message = "Email de acceso inválido")
        String adminEmail,

        @NotBlank(message = "La contraseña de acceso es obligatoria")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String adminPassword,

        @NotBlank(message = "El nombre del administrador es obligatorio")
        String adminNombres,

        @NotBlank(message = "Los apellidos del administrador son obligatorios")
        String adminApellidos
) {}
