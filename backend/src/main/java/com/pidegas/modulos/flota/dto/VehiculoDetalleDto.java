package com.pidegas.modulos.flota.dto;

import com.pidegas.modulos.flota.dominio.EstadoVehiculo;
import com.pidegas.modulos.flota.dominio.TipoVehiculo;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VehiculoDetalleDto(
        UUID publicId,
        Long tenantId,
        String placa,
        String marca,
        String modelo,
        TipoVehiculo tipoVehiculo,
        Integer capacidadBalones,
        EstadoVehiculo estado,
        OffsetDateTime createdAt
) {}
