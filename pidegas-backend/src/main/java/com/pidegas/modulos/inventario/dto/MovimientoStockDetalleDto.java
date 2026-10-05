package com.pidegas.modulos.inventario.dto;

import com.pidegas.modulos.inventario.dominio.TipoMovimientoStock;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MovimientoStockDetalleDto(
        Long id,
        String nombreAlmacen,
        UUID productoPublicId,
        String skuProducto,
        String nombreProducto,
        TipoMovimientoStock tipoMovimiento,
        Integer cantidad,
        String motivo,
        UUID pedidoPublicId,
        OffsetDateTime createdAt
) {}
