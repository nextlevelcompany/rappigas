package com.pidegas.modulos.soporte.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class MensajeTicketDetalleDto {

    private Long id;
    private UUID remitentePublicId;
    private String nombreRemitente;
    private String rolRemitente;
    private boolean esMio;
    private String mensaje;
    private String adjuntoUrl;
    private OffsetDateTime createdAt;

    public MensajeTicketDetalleDto() {
    }

    public MensajeTicketDetalleDto(Long id, UUID remitentePublicId, String nombreRemitente,
                                   String rolRemitente, boolean esMio, String mensaje,
                                   String adjuntoUrl, OffsetDateTime createdAt) {
        this.id = id;
        this.remitentePublicId = remitentePublicId;
        this.nombreRemitente = nombreRemitente;
        this.rolRemitente = rolRemitente;
        this.esMio = esMio;
        this.mensaje = mensaje;
        this.adjuntoUrl = adjuntoUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getRemitentePublicId() {
        return remitentePublicId;
    }

    public void setRemitentePublicId(UUID remitentePublicId) {
        this.remitentePublicId = remitentePublicId;
    }

    public String getNombreRemitente() {
        return nombreRemitente;
    }

    public void setNombreRemitente(String nombreRemitente) {
        this.nombreRemitente = nombreRemitente;
    }

    public String getRolRemitente() {
        return rolRemitente;
    }

    public void setRolRemitente(String rolRemitente) {
        this.rolRemitente = rolRemitente;
    }

    public boolean isEsMio() {
        return esMio;
    }

    public void setEsMio(boolean esMio) {
        this.esMio = esMio;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
