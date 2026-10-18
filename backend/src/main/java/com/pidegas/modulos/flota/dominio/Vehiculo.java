package com.pidegas.modulos.flota.dominio;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehiculos", uniqueConstraints = {
        @UniqueConstraint(name = "uk_vehiculos_tenant_placa", columnNames = {"tenant_id", "placa"})
})
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "placa", nullable = false, length = 15)
    private String placa;

    @Column(name = "marca", length = 50)
    private String marca;

    @Column(name = "modelo", length = 50)
    private String modelo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vehiculo", nullable = false, length = 30)
    private TipoVehiculo tipoVehiculo = TipoVehiculo.MOTO_FURGON;

    @Column(name = "capacidad_balones", nullable = false)
    private Integer capacidadBalones = 10;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoVehiculo estado = EstadoVehiculo.ACTIVO;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Vehiculo() {}

    public Vehiculo(Long tenantId, String placa, String marca, String modelo,
                    TipoVehiculo tipoVehiculo, Integer capacidadBalones) {
        this.tenantId = tenantId;
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.tipoVehiculo = tipoVehiculo != null ? tipoVehiculo : TipoVehiculo.MOTO_FURGON;
        this.capacidadBalones = capacidadBalones != null ? capacidadBalones : 10;
        this.estado = EstadoVehiculo.ACTIVO;
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

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public TipoVehiculo getTipoVehiculo() {
        return tipoVehiculo;
    }

    public void setTipoVehiculo(TipoVehiculo tipoVehiculo) {
        this.tipoVehiculo = tipoVehiculo;
    }

    public Integer getCapacidadBalones() {
        return capacidadBalones;
    }

    public void setCapacidadBalones(Integer capacidadBalones) {
        this.capacidadBalones = capacidadBalones;
    }

    public EstadoVehiculo getEstado() {
        return estado;
    }

    public void setEstado(EstadoVehiculo estado) {
        this.estado = estado;
    }

    public Integer getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
