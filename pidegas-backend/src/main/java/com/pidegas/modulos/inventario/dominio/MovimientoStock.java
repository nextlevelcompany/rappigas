package com.pidegas.modulos.inventario.dominio;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "movimientos_stock")
public class MovimientoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "almacen_id", nullable = false)
    private Long almacenId;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "pedido_id")
    private Long pedidoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private TipoMovimientoStock tipoMovimiento;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(length = 255)
    private String motivo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MovimientoStock() {}

    public MovimientoStock(Long tenantId, Long almacenId, Long productoId, Long pedidoId,
                           TipoMovimientoStock tipoMovimiento, Integer cantidad, String motivo) {
        this.tenantId = tenantId;
        this.almacenId = almacenId;
        this.productoId = productoId;
        this.pedidoId = pedidoId;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.motivo = motivo;
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

    public Long getTenantId() {
        return tenantId;
    }

    public Long getAlmacenId() {
        return almacenId;
    }

    public Long getProductoId() {
        return productoId;
    }

    public Long getPedidoId() {
        return pedidoId;
    }

    public TipoMovimientoStock getTipoMovimiento() {
        return tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public String getMotivo() {
        return motivo;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
