package com.pidegas.modulos.soporte.dto;

import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.dominio.PrioridadTicket;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TicketDetalleDto {

    private UUID publicId;
    private String asunto;
    private EstadoTicket estado;
    private PrioridadTicket prioridad;
    private UUID pedidoPublicId;
    private String usuarioNombre;
    private String usuarioEmail;
    private String usuarioRol;
    private Long tenantId;
    private String nombreEmpresa;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private int totalMensajes;
    private List<MensajeTicketDetalleDto> mensajes = new ArrayList<>();

    public TicketDetalleDto() {
    }

    public UUID getPublicId() {
        return publicId;
    }

    public void setPublicId(UUID publicId) {
        this.publicId = publicId;
    }

    public String getAsunto() {
        return asunto;
    }

    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }

    public EstadoTicket getEstado() {
        return estado;
    }

    public void setEstado(EstadoTicket estado) {
        this.estado = estado;
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

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public String getUsuarioRol() {
        return usuarioRol;
    }

    public void setUsuarioRol(String usuarioRol) {
        this.usuarioRol = usuarioRol;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getNombreEmpresa() {
        return nombreEmpresa;
    }

    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getTotalMensajes() {
        return totalMensajes;
    }

    public void setTotalMensajes(int totalMensajes) {
        this.totalMensajes = totalMensajes;
    }

    public List<MensajeTicketDetalleDto> getMensajes() {
        return mensajes;
    }

    public void setMensajes(List<MensajeTicketDetalleDto> mensajes) {
        this.mensajes = mensajes;
    }
}
