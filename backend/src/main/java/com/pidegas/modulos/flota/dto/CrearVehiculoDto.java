package com.pidegas.modulos.flota.dto;

import com.pidegas.modulos.flota.dominio.TipoVehiculo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearVehiculoDto(
        @NotBlank(message = "La placa es obligatoria")
        String placa,

        String marca,
        String modelo,

        @NotNull(message = "El tipo de vehículo es obligatorio")
        TipoVehiculo tipoVehiculo,

        Integer capacidadBalones
) {}
