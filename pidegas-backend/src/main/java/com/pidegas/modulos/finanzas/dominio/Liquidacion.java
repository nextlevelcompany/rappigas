package com.pidegas.modulos.finanzas.dominio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "liquidaciones")
public class Liquidacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "periodo_inicio", nullable = false)
    private OffsetDateTime periodoInicio;

    @Column(name = "periodo_fin", nullable = false)
    private OffsetDateTime periodoFin;

    @Column(name = "total_ventas", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVentas;

    @Column(name = "total_comisiones", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalComisiones;

    @Column(name = "total_a_liquidar", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalALiquidar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoLiquidacion estado = EstadoLiquidacion.PENDIENTE;

    @Column(name = "referencia_bancaria", length = 100)
    private String referenciaBancaria;

    @Column(name = "fecha_pago")
    private OffsetDateTime fechaPago;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Liquidacion() {}

    public Liquidacion(Long tenantId, OffsetDateTime periodoInicio, OffsetDateTime periodoFin,
                       BigDecimal totalVentas, BigDecimal totalComisiones) {
        this.tenantId = tenantId;
        this.periodoInicio = periodoInicio;
        this.periodoFin = periodoFin;
        this.totalVentas = totalVentas;
        this.totalComisiones = totalComisiones;
        this.totalALiquidar = totalVentas.subtract(totalComisiones).max(BigDecimal.ZERO);
        this.estado = EstadoLiquidacion.PENDIENTE;
        this.publicId = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public void marcarComoPagada(String referenciaBancaria) {
        this.estado = EstadoLiquidacion.PAGADA;
        this.referenciaBancaria = referenciaBancaria;
        this.fechaPago = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public UUID getPublicId() { return publicId; }
    public Long getTenantId() { return tenantId; }
    public OffsetDateTime getPeriodoInicio() { return periodoInicio; }
    public OffsetDateTime getPeriodoFin() { return periodoFin; }
    public BigDecimal getTotalVentas() { return totalVentas; }
    public BigDecimal getTotalComisiones() { return totalComisiones; }
    public BigDecimal getTotalALiquidar() { return totalALiquidar; }
    public EstadoLiquidacion getEstado() { return estado; }
    public String getReferenciaBancaria() { return referenciaBancaria; }
    public OffsetDateTime getFechaPago() { return fechaPago; }
    public Integer getVersion() { return version; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
