package com.pidegas.modulos.finanzas.dominio;

import com.pidegas.modulos.pedidos.dominio.MetodoPago;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "pedido_id", nullable = false)
    private Long pedidoId;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 30)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTransaccionPago estado = EstadoTransaccionPago.PENDIENTE;

    @Column(name = "referencia_transaccion", length = 100)
    private String referenciaTransaccion;

    @Column(name = "codigo_autorizacion", length = 50)
    private String codigoAutorizacion;

    @Column(name = "metadata_pasarela", columnDefinition = "TEXT")
    private String metadataPasarela;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Pago() {}

    public Pago(Long tenantId, Long pedidoId, Long clienteId, BigDecimal monto, MetodoPago metodoPago) {
        this.tenantId = tenantId;
        this.pedidoId = pedidoId;
        this.clienteId = clienteId;
        this.monto = monto;
        this.metodoPago = metodoPago;
        this.estado = EstadoTransaccionPago.PENDIENTE;
        this.publicId = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public void aprobar(String referencia, String codAutorizacion, String metadata) {
        this.estado = EstadoTransaccionPago.APROBADO;
        this.referenciaTransaccion = referencia;
        this.codigoAutorizacion = codAutorizacion;
        this.metadataPasarela = metadata;
        this.updatedAt = OffsetDateTime.now();
    }

    public void rechazar(String motivo) {
        this.estado = EstadoTransaccionPago.RECHAZADO;
        this.metadataPasarela = motivo;
        this.updatedAt = OffsetDateTime.now();
    }

    public void reembolsar() {
        this.estado = EstadoTransaccionPago.REEMBOLSADO;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public UUID getPublicId() { return publicId; }
    public Long getTenantId() { return tenantId; }
    public Long getPedidoId() { return pedidoId; }
    public Long getClienteId() { return clienteId; }
    public BigDecimal getMonto() { return monto; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public EstadoTransaccionPago getEstado() { return estado; }
    public String getReferenciaTransaccion() { return referenciaTransaccion; }
    public String getCodigoAutorizacion() { return codigoAutorizacion; }
    public String getMetadataPasarela() { return metadataPasarela; }
    public Integer getVersion() { return version; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
