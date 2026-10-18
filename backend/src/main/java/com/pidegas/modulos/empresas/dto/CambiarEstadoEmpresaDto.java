package com.pidegas.modulos.empresas.dto;

import com.pidegas.modulos.empresas.dominio.EstadoEmpresa;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoEmpresaDto(
        @NotNull(message = "El nuevo estado es obligatorio")
        EstadoEmpresa nuevoEstado,

        String motivo
) {}
