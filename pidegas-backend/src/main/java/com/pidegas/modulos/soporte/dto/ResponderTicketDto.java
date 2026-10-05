package com.pidegas.modulos.soporte.dto;

import jakarta.validation.constraints.NotBlank;

public class ResponderTicketDto {

    @NotBlank(message = "El mensaje de respuesta no puede estar vacío")
    private String mensaje;

    private String adjuntoUrl;

    public ResponderTicketDto() {
    }

    public ResponderTicketDto(String mensaje, String adjuntoUrl) {
        this.mensaje = mensaje;
        this.adjuntoUrl = adjuntoUrl;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getAdjuntoUrl() {
        return adjuntoUrl;
    }

    public void setAdjuntoUrl(String adjuntoUrl) {
        this.adjuntoUrl = adjuntoUrl;
    }
}
