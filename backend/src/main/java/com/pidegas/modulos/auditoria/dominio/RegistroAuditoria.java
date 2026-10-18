package com.pidegas.modulos.auditoria.dominio;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "auditoria_eventos")
public class RegistroAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false, length = 50)
    private TipoEventoAuditoria tipoEvento;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "detalles_json", columnDefinition = "TEXT")
    private String detallesJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public RegistroAuditoria() {
    }

    public RegistroAuditoria(Long usuarioId, Long tenantId, TipoEventoAuditoria tipoEvento,
                             String descripcion, String ipOrigen, String userAgent, String detallesJson) {
        this.publicId = UUID.randomUUID();
        this.usuarioId = usuarioId;
        this.tenantId = tenantId;
        this.tipoEvento = tipoEvento;
        this.descripcion = descripcion;
        this.ipOrigen = ipOrigen;
        this.userAgent = userAgent;
        this.detallesJson = detallesJson;
        this.createdAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public UUID getPublicId() {
        return publicId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public TipoEventoAuditoria getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(TipoEventoAuditoria tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getIpOrigen() {
        return ipOrigen;
    }

    public void setIpOrigen(String ipOrigen) {
        this.ipOrigen = ipOrigen;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDetallesJson() {
        return detallesJson;
    }

    public void setDetallesJson(String detallesJson) {
        this.detallesJson = detallesJson;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
