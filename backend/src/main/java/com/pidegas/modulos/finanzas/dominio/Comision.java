package com.pidegas.modulos.finanzas.dominio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "comisiones_plataforma")
public class Comision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "pedido_id", nullable = false)
    private Long pedidoId;

    @Column(name = "pago_id")
    private Long pagoId;

    @Column(name = "monto_pedido", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoPedido;

    @Column(name = "porcentaje_comision", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeComision;

    @Column(name = "monto_comision", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoComision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoComision estado = EstadoComision.PENDIENTE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Comision() {}

    public Comision(Long tenantId, Long pedidoId, Long pagoId, BigDecimal montoPedido, BigDecimal porcentajeComision) {
        this.tenantId = tenantId;
        this.pedidoId = pedidoId;
        this.pagoId = pagoId;
        this.montoPedido = montoPedido;
        this.porcentajeComision = porcentajeComision;
        this.montoComision = montoPedido.multiply(porcentajeComision)
                .divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        this.estado = EstadoComision.PENDIENTE;
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

    public void marcarComoLiquidada() {
        this.estado = EstadoComision.LIQUIDADA;
    }

    public Long getId() { return id; }
    public UUID getPublicId() { return publicId; }
    public Long getTenantId() { return tenantId; }
    public Long getPedidoId() { return pedidoId; }
    public Long getPagoId() { return pagoId; }
    public BigDecimal getMontoPedido() { return montoPedido; }
    public BigDecimal getPorcentajeComision() { return porcentajeComision; }
    public BigDecimal getMontoComision() { return montoComision; }
    public EstadoComision getEstado() { return estado; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
