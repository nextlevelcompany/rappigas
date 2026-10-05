package com.pidegas.modulos.fidelizacion.dominio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cupones")
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(nullable = false, length = 30)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_descuento", nullable = false, length = 20)
    private TipoDescuento tipoDescuento;

    @Column(name = "valor_descuento", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDescuento;

    @Column(name = "pedido_minimo", nullable = false, precision = 10, scale = 2)
    private BigDecimal pedidoMinimo = BigDecimal.ZERO;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_actuales", nullable = false)
    private Integer usosActuales = 0;

    @Column(name = "valido_desde", nullable = false)
    private OffsetDateTime validoDesde;

    @Column(name = "valido_hasta", nullable = false)
    private OffsetDateTime validoHasta;

    @Column(nullable = false)
    private Boolean activo = true;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Cupon() {}

    public Cupon(Long tenantId, String codigo, TipoDescuento tipoDescuento, BigDecimal valorDescuento,
                 BigDecimal pedidoMinimo, Integer usosMaximos, OffsetDateTime validoDesde, OffsetDateTime validoHasta) {
        this.publicId = UUID.randomUUID();
        this.tenantId = tenantId;
        this.codigo = codigo.toUpperCase().trim();
        this.tipoDescuento = tipoDescuento;
        this.valorDescuento = valorDescuento;
        this.pedidoMinimo = pedidoMinimo != null ? pedidoMinimo : BigDecimal.ZERO;
        this.usosMaximos = usosMaximos;
        this.usosActuales = 0;
        this.validoDesde = validoDesde != null ? validoDesde : OffsetDateTime.now();
        this.validoHasta = validoHasta != null ? validoHasta : OffsetDateTime.now().plusMonths(3);
        this.activo = true;
    }

    @PrePersist
    public void prePersist() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
        if (this.usosActuales == null) {
            this.usosActuales = 0;
        }
        if (this.activo == null) {
            this.activo = true;
        }
    }

    public boolean esValido(BigDecimal subtotalPedido) {
        if (!Boolean.TRUE.equals(activo)) return false;
        OffsetDateTime ahora = OffsetDateTime.now();
        if (ahora.isBefore(validoDesde) || ahora.isAfter(validoHasta)) return false;
        if (usosMaximos != null && usosActuales >= usosMaximos) return false;
        return subtotalPedido.compareTo(pedidoMinimo) >= 0;
    }

    public BigDecimal calcularDescuento(BigDecimal subtotal) {
        if (!esValido(subtotal)) return BigDecimal.ZERO;
        if (tipoDescuento == TipoDescuento.MONTO_FIJO) {
            return valorDescuento.min(subtotal);
        } else {
            return subtotal.multiply(valorDescuento).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP).min(subtotal);
        }
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

    public String getCodigo() {
        return codigo;
    }

    public TipoDescuento getTipoDescuento() {
        return tipoDescuento;
    }

    public BigDecimal getValorDescuento() {
        return valorDescuento;
    }

    public BigDecimal getPedidoMinimo() {
        return pedidoMinimo;
    }

    public Integer getUsosMaximos() {
        return usosMaximos;
    }

    public Integer getUsosActuales() {
        return usosActuales;
    }

    public void setUsosActuales(Integer usosActuales) {
        this.usosActuales = usosActuales;
    }

    public OffsetDateTime getValidoDesde() {
        return validoDesde;
    }

    public OffsetDateTime getValidoHasta() {
        return validoHasta;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getVersion() {
        return version;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
