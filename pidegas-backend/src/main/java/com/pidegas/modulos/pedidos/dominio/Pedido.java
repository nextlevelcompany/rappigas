package com.pidegas.modulos.pedidos.dominio;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;

    @Column(name = "repartidor_id")
    private Long repartidorId;

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "descuento", nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 30)
    private MetodoPago metodoPago = MetodoPago.EFECTIVO;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false, length = 20)
    private EstadoPago estadoPago = EstadoPago.PENDIENTE;

    @Column(name = "direccion_entrega", nullable = false, length = 255)
    private String direccionEntrega;

    @Column(name = "referencia_direccion", length = 255)
    private String referenciaDireccion;

    @Column(name = "coordenada_entrega", nullable = false, columnDefinition = "geometry(Point, 4326)")
    private Point coordenadaEntrega;

    @Column(name = "notas_cliente", columnDefinition = "TEXT")
    private String notasCliente;

    @Column(name = "codigo_confirmacion", length = 6)
    private String codigoConfirmacion;

    @Column(name = "fecha_entrega")
    private OffsetDateTime fechaEntrega;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetallePedido> detalles = new ArrayList<>();

    public Pedido() {}

    public Pedido(Long tenantId, Long clienteId, BigDecimal subtotal, BigDecimal descuento,
                  BigDecimal total, MetodoPago metodoPago, String direccionEntrega,
                  String referenciaDireccion, Point coordenadaEntrega, String notasCliente,
                  String codigoConfirmacion) {
        this.tenantId = tenantId;
        this.clienteId = clienteId;
        this.subtotal = subtotal;
        this.descuento = descuento != null ? descuento : BigDecimal.ZERO;
        this.total = total;
        this.metodoPago = metodoPago != null ? metodoPago : MetodoPago.EFECTIVO;
        this.estado = EstadoPedido.PENDIENTE;
        this.estadoPago = EstadoPago.PENDIENTE;
        this.direccionEntrega = direccionEntrega;
        this.referenciaDireccion = referenciaDireccion;
        this.coordenadaEntrega = coordenadaEntrega;
        this.notasCliente = notasCliente;
        this.codigoConfirmacion = codigoConfirmacion;
        this.publicId = UUID.randomUUID();
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public void agregarDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }

    public void removerDetalle(DetallePedido detalle) {
        detalles.remove(detalle);
        detalle.setPedido(null);
    }

    // Getters y Setters
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

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public Long getRepartidorId() {
        return repartidorId;
    }

    public void setRepartidorId(Long repartidorId) {
        this.repartidorId = repartidorId;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDescuento() {
        return descuento;
    }

    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public EstadoPago getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(EstadoPago estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getDireccionEntrega() {
        return direccionEntrega;
    }

    public void setDireccionEntrega(String direccionEntrega) {
        this.direccionEntrega = direccionEntrega;
    }

    public String getReferenciaDireccion() {
        return referenciaDireccion;
    }

    public void setReferenciaDireccion(String referenciaDireccion) {
        this.referenciaDireccion = referenciaDireccion;
    }

    public Point getCoordenadaEntrega() {
        return coordenadaEntrega;
    }

    public void setCoordenadaEntrega(Point coordenadaEntrega) {
        this.coordenadaEntrega = coordenadaEntrega;
    }

    public String getNotasCliente() {
        return notasCliente;
    }

    public void setNotasCliente(String notasCliente) {
        this.notasCliente = notasCliente;
    }

    public String getCodigoConfirmacion() {
        return codigoConfirmacion;
    }

    public void setCodigoConfirmacion(String codigoConfirmacion) {
        this.codigoConfirmacion = codigoConfirmacion;
    }

    public OffsetDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(OffsetDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
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

    public List<DetallePedido> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedido> detalles) {
        this.detalles = detalles;
    }
}
