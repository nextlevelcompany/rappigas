package com.pidegas.modulos.pedidos.dto;

import com.pidegas.modulos.catalogo.dominio.TipoBalonGas;
import com.pidegas.modulos.catalogo.dominio.TipoValvulaGas;
import java.math.BigDecimal;
import java.util.UUID;

public record DetallePedidoItemDto(
        UUID productoPublicId,
        String sku,
        String nombreProducto,
        TipoBalonGas tipoGas,
        TipoValvulaGas tipoValvula,
        String imagenUrl,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {}
