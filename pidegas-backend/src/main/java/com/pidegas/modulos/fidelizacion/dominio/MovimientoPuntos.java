package com.pidegas.modulos.fidelizacion.dominio;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "movimientos_puntos")
public class MovimientoPuntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "billetera_id", nullable = false)
    private Long billeteraId;

    @Column(name = "pedido_id")
    private Long pedidoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private TipoMovimientoPuntos tipoMovimiento;

    @Column(nullable = false)
    private Integer puntos;

    @Column(name = "saldo_resultante", nullable = false)
    private Integer saldoResultante;

    @Column(length = 255)
    private String motivo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MovimientoPuntos() {}

    public MovimientoPuntos(Long billeteraId, Long pedidoId, TipoMovimientoPuntos tipoMovimiento,
                            Integer puntos, Integer saldoResultante, String motivo) {
        this.billeteraId = billeteraId;
        this.pedidoId = pedidoId;
        this.tipoMovimiento = tipoMovimiento;
        this.puntos = puntos;
        this.saldoResultante = saldoResultante;
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

    public Long getBilleteraId() {
        return billeteraId;
    }

    public Long getPedidoId() {
        return pedidoId;
    }

    public TipoMovimientoPuntos getTipoMovimiento() {
        return tipoMovimiento;
    }

    public Integer getPuntos() {
        return puntos;
    }

    public Integer getSaldoResultante() {
        return saldoResultante;
    }

    public String getMotivo() {
        return motivo;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
