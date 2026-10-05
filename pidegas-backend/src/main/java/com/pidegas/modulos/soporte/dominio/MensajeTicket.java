package com.pidegas.modulos.soporte.dominio;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "mensajes_ticket")
public class MensajeTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "remitente_id", nullable = false)
    private Long remitenteId;

    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "adjunto_url", length = 255)
    private String adjuntoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MensajeTicket() {
    }

    public MensajeTicket(Long ticketId, Long remitenteId, String mensaje, String adjuntoUrl) {
        this.ticketId = ticketId;
        this.remitenteId = remitenteId;
        this.mensaje = mensaje;
        this.adjuntoUrl = adjuntoUrl;
        this.createdAt = OffsetDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getRemitenteId() {
        return remitenteId;
    }

    public void setRemitenteId(Long remitenteId) {
        this.remitenteId = remitenteId;
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
}
