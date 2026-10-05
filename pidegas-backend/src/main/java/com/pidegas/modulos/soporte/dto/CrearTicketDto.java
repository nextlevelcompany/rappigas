package com.pidegas.modulos.soporte.dto;

import com.pidegas.modulos.soporte.dominio.PrioridadTicket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class CrearTicketDto {

    @NotBlank(message = "El asunto del ticket o reclamo es obligatorio")
    @Size(max = 150, message = "El asunto no puede superar los 150 caracteres")
    private String asunto;

    private PrioridadTicket prioridad = PrioridadTicket.MEDIA;

    private UUID pedidoPublicId;

    @NotBlank(message = "El mensaje inicial describiendo la incidencia es obligatorio")
    private String mensajeInicial;

    private String adjuntoUrl;

    public CrearTicketDto() {
    }

    public CrearTicketDto(String asunto, PrioridadTicket prioridad, UUID pedidoPublicId, String mensajeInicial, String adjuntoUrl) {
        this.asunto = asunto;
        this.prioridad = prioridad;
        this.pedidoPublicId = pedidoPublicId;
        this.mensajeInicial = mensajeInicial;
        this.adjuntoUrl = adjuntoUrl;
    }

    public String getAsunto() {
        return asunto;
    }

    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }

    public PrioridadTicket getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(PrioridadTicket prioridad) {
        this.prioridad = prioridad;
    }

    public UUID getPedidoPublicId() {
        return pedidoPublicId;
    }

    public void setPedidoPublicId(UUID pedidoPublicId) {
        this.pedidoPublicId = pedidoPublicId;
    }

    public String getMensajeInicial() {
        return mensajeInicial;
    }

    public void setMensajeInicial(String mensajeInicial) {
        this.mensajeInicial = mensajeInicial;
    }

    public String getAdjuntoUrl() {
        return adjuntoUrl;
    }

    public void setAdjuntoUrl(String adjuntoUrl) {
        this.adjuntoUrl = adjuntoUrl;
    }
}
