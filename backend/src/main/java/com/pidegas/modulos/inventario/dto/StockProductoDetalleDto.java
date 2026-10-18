package com.pidegas.modulos.inventario.dto;

import java.util.UUID;

public record StockProductoDetalleDto(
        Long id,
        UUID almacenPublicId,
        String nombreAlmacen,
        UUID productoPublicId,
        String sku,
        String nombreProducto,
        String tipoGas,
        String tipoValvula,
        Integer cantidadDisponible,
        Integer cantidadReservada,
        Integer stockMinimo,
        Boolean alertaBajoStock
) {}
