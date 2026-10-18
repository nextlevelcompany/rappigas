package com.pidegas.nucleo.websocket;

import com.pidegas.modulos.flota.dto.EventoGpsWebSocketDto;
import com.pidegas.modulos.pedidos.dto.EventoPedidoWebSocketDto;
import com.pidegas.modulos.pedidos.dto.PedidoDetalleDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NotificacionWebSocketServicioImpl implements NotificacionWebSocketServicio {

    private static final Logger log = LoggerFactory.getLogger(NotificacionWebSocketServicioImpl.class);

    private final SimpMessagingTemplate messagingTemplate;

    public NotificacionWebSocketServicioImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void notificarNuevoPedido(Long tenantId, PedidoDetalleDto pedido) {
        String destino = "/topic/empresas/" + tenantId + "/pedidos";
        EventoPedidoWebSocketDto evento = new EventoPedidoWebSocketDto(
                "NUEVO_PEDIDO",
                "¡Nuevo pedido entrante de gas doméstico!",
                pedido
        );
        log.info("Emitiendo WebSocket NUEVO_PEDIDO a {}", destino);
        messagingTemplate.convertAndSend(destino, evento);
    }

    @Override
    public void notificarEstadoPedido(Long tenantId, UUID pedidoPublicId, PedidoDetalleDto pedido) {
        EventoPedidoWebSocketDto evento = new EventoPedidoWebSocketDto(
                "ESTADO_ACTUALIZADO",
                "El estado del pedido cambió a " + pedido.estado(),
                pedido
        );

        String destinoEmpresa = "/topic/empresas/" + tenantId + "/pedidos";
        log.info("Emitiendo WebSocket ESTADO_ACTUALIZADO a {}", destinoEmpresa);
        messagingTemplate.convertAndSend(destinoEmpresa, evento);

        String destinoPedido = "/topic/pedidos/" + pedidoPublicId;
        log.info("Emitiendo WebSocket ESTADO_ACTUALIZADO a {}", destinoPedido);
        messagingTemplate.convertAndSend(destinoPedido, evento);
    }

    @Override
    public void notificarUbicacionGps(Long tenantId, EventoGpsWebSocketDto evento) {
        if (tenantId != null) {
            String destinoEmpresa = "/topic/empresas/" + tenantId + "/gps";
            messagingTemplate.convertAndSend(destinoEmpresa, evento);
        }

        if (evento.pedidoPublicId() != null) {
            String destinoPedido = "/topic/pedidos/" + evento.pedidoPublicId() + "/gps";
            messagingTemplate.convertAndSend(destinoPedido, evento);
        }
    }
}
