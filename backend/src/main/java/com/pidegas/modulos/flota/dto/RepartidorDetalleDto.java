package com.pidegas.modulos.flota.dto;

import com.pidegas.modulos.flota.dominio.EstadoRepartidor;
import com.pidegas.modulos.flota.dominio.TipoVehiculo;

import java.time.OffsetDateTime;
import java.util.UUID;

public record RepartidorDetalleDto(
        UUID publicId,
        Long tenantId,
        UUID usuarioPublicId,
        String nombres,
        String apellidos,
        String email,
        String telefono,
        String licenciaConducir,
        UUID vehiculoPublicId,
        String vehiculoPlaca,
        TipoVehiculo vehiculoTipo,
        EstadoRepartidor estado,
        Double latitudActual,
        Double longitudActual,
        OffsetDateTime ultimaActualizacionGps,
        OffsetDateTime createdAt
) {}
