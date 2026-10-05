package com.pidegas.modulos.pedidos.dto;

public record EventoPedidoWebSocketDto(
        String tipoEvento,
        String mensaje,
        PedidoDetalleDto pedido
) {}
