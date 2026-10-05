package com.pidegas.modulos.flota.dominio;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "repartidores", uniqueConstraints = {
        @UniqueConstraint(name = "uk_repartidores_tenant_usuario", columnNames = {"tenant_id", "usuario_id"})
})
public class Repartidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "vehiculo_id")
    private Long vehiculoId;

    @Column(name = "licencia_conducir", length = 30)
    private String licenciaConducir;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoRepartidor estado = EstadoRepartidor.DISPONIBLE;

    @Column(name = "ultima_coordenada", columnDefinition = "geometry(Point, 4326)")
    private Point ultimaCoordenada;

    @Column(name = "ultima_actualizacion_gps")
    private OffsetDateTime ultimaActualizacionGps;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Repartidor() {}

    public Repartidor(Long tenantId, Long usuarioId, Long vehiculoId, String licenciaConducir) {
        this.tenantId = tenantId;
        this.usuarioId = usuarioId;
        this.vehiculoId = vehiculoId;
        this.licenciaConducir = licenciaConducir;
        this.estado = EstadoRepartidor.DISPONIBLE;
        this.publicId = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getVehiculoId() {
        return vehiculoId;
    }

    public void setVehiculoId(Long vehiculoId) {
        this.vehiculoId = vehiculoId;
    }

    public String getLicenciaConducir() {
        return licenciaConducir;
    }

    public void setLicenciaConducir(String licenciaConducir) {
        this.licenciaConducir = licenciaConducir;
    }

    public EstadoRepartidor getEstado() {
        return estado;
    }

    public void setEstado(EstadoRepartidor estado) {
        this.estado = estado;
    }

    public Point getUltimaCoordenada() {
        return ultimaCoordenada;
    }

    public void setUltimaCoordenada(Point ultimaCoordenada) {
        this.ultimaCoordenada = ultimaCoordenada;
    }

    public OffsetDateTime getUltimaActualizacionGps() {
        return ultimaActualizacionGps;
    }

    public void setUltimaActualizacionGps(OffsetDateTime ultimaActualizacionGps) {
        this.ultimaActualizacionGps = ultimaActualizacionGps;
    }

    public Integer getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
