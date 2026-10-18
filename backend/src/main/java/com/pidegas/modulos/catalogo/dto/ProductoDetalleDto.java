package com.pidegas.modulos.catalogo.dto;

import com.pidegas.modulos.catalogo.dominio.EstadoProducto;
import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductoDetalleDto(
        Long id,
        UUID publicId,
        Long tenantId,
        String sku,
        String nombre,
        String descripcion,
        TipoBalonGas tipoGas,
        String tipoGasDescripcion,
        TipoValvulaGas tipoValvula,
        String tipoValvulaDescripcion,
        BigDecimal precio,
        String imagenUrl,
        EstadoProducto estado,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
