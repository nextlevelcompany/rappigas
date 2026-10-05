package com.pidegas.modulos.fidelizacion.dto;

import com.pidegas.modulos.fidelizacion.dominio.TipoDescuento;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CuponDetalleDto(
        UUID publicId,
        Long tenantId,
        String codigo,
        TipoDescuento tipoDescuento,
        BigDecimal valorDescuento,
        BigDecimal pedidoMinimo,
        Integer usosMaximos,
        Integer usosActuales,
        OffsetDateTime validoDesde,
        OffsetDateTime validoHasta,
        Boolean activo
) {}
