package com.pidegas.modulos.cobertura.dominio;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Polygon;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "zonas_cobertura")
public class ZonaCobertura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "geometria", nullable = false, columnDefinition = "geometry(Polygon, 4326)")
    private Polygon geometria;

    @Column(name = "activa", nullable = false)
    private Boolean activa = true;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ZonaCobertura() {}

    public ZonaCobertura(Long tenantId, String nombre, Polygon geometria) {
        this.tenantId = tenantId;
        this.nombre = nombre;
        this.geometria = geometria;
        this.activa = true;
        this.publicId = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public UUID getPublicId() {
        return publicId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Polygon getGeometria() {
        return geometria;
    }

    public void setGeometria(Polygon geometria) {
        this.geometria = geometria;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public Integer getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
