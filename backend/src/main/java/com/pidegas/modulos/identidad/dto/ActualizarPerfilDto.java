package com.pidegas.modulos.identidad.dto;

public record ActualizarPerfilDto(
        String nombres,
        String apellidos,
        String telefono,
        String nuevaPassword
) {}
