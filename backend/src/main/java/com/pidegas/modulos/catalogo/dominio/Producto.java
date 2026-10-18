package com.pidegas.modulos.catalogo.dominio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "productos", uniqueConstraints = {
        @UniqueConstraint(name = "uk_productos_tenant_sku", columnNames = {"tenant_id", "sku"})
})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "sku", nullable = false, length = 50)
    private String sku;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_gas", nullable = false, length = 30)
    private TipoBalonGas tipoGas = TipoBalonGas.GLP_10KG;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_valvula", nullable = false, length = 30)
    private TipoValvulaGas tipoValvula = TipoValvulaGas.PREMIUM;

    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoProducto estado = EstadoProducto.ACTIVO;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Producto() {}

    public Producto(Long tenantId, String sku, String nombre, String descripcion,
                    TipoBalonGas tipoGas, TipoValvulaGas tipoValvula, BigDecimal precio, String imagenUrl) {
        this.tenantId = tenantId;
        this.sku = sku;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipoGas = tipoGas != null ? tipoGas : TipoBalonGas.GLP_10KG;
        this.tipoValvula = tipoValvula != null ? tipoValvula : TipoValvulaGas.PREMIUM;
        this.precio = precio;
        this.imagenUrl = imagenUrl;
        this.estado = EstadoProducto.ACTIVO;
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

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public TipoBalonGas getTipoGas() {
        return tipoGas;
    }

    public void setTipoGas(TipoBalonGas tipoGas) {
        this.tipoGas = tipoGas;
    }

    public TipoValvulaGas getTipoValvula() {
        return tipoValvula;
    }

    public void setTipoValvula(TipoValvulaGas tipoValvula) {
        this.tipoValvula = tipoValvula;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public EstadoProducto getEstado() {
        return estado;
    }

    public void setEstado(EstadoProducto estado) {
        this.estado = estado;
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
