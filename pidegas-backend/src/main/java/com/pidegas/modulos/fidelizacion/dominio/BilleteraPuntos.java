package com.pidegas.modulos.fidelizacion.dominio;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "billeteras_puntos")
public class BilleteraPuntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_id", nullable = false, unique = true)
    private Long clienteId;

    @Column(name = "saldo_puntos", nullable = false)
    private Integer saldoPuntos = 0;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public BilleteraPuntos() {}

    public BilleteraPuntos(Long clienteId) {
        this.clienteId = clienteId;
        this.saldoPuntos = 0;
        this.updatedAt = OffsetDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void preActualizar() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Integer getSaldoPuntos() {
        return saldoPuntos;
    }

    public void setSaldoPuntos(Integer saldoPuntos) {
        this.saldoPuntos = saldoPuntos;
    }

    public Integer getVersion() {
        return version;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
