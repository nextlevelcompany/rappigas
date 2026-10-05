package com.pidegas.nucleo.websocket;

import com.pidegas.modulos.flota.dto.EventoGpsWebSocketDto;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;

import java.util.UUID;

public interface NotificacionWebSocketServicio {

    void notificarNuevoPedido(Long tenantId, PedidoDetalleDto pedido);

    void notificarEstadoPedido(Long tenantId, UUID pedidoPublicId, PedidoDetalleDto pedido);

    void notificarUbicacionGps(Long tenantId, EventoGpsWebSocketDto evento);
}
