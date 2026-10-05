package com.pidegas.modulos.inventario.dominio;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_productos", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"almacen_id", "producto_id"})
})
public class StockProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "almacen_id", nullable = false)
    private Long almacenId;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "cantidad_disponible", nullable = false)
    private Integer cantidadDisponible = 0;

    @Column(name = "cantidad_reservada", nullable = false)
    private Integer cantidadReservada = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Version
    @Column(nullable = false)
    private Integer version = 0;

    public StockProducto() {}

    public StockProducto(Long tenantId, Long almacenId, Long productoId, Integer cantidadDisponible, Integer stockMinimo) {
        this.tenantId = tenantId;
        this.almacenId = almacenId;
        this.productoId = productoId;
        this.cantidadDisponible = cantidadDisponible != null ? cantidadDisponible : 0;
        this.cantidadReservada = 0;
        this.stockMinimo = stockMinimo != null ? stockMinimo : 5;
    }

    public Long getId() {
        return id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getAlmacenId() {
        return almacenId;
    }

    public void setAlmacenId(Long almacenId) {
        this.almacenId = almacenId;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public Integer getCantidadDisponible() {
        return cantidadDisponible;
    }

    public void setCantidadDisponible(Integer cantidadDisponible) {
        this.cantidadDisponible = cantidadDisponible;
    }

    public Integer getCantidadReservada() {
        return cantidadReservada;
    }

    public void setCantidadReservada(Integer cantidadReservada) {
        this.cantidadReservada = cantidadReservada;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Integer getVersion() {
        return version;
    }
}
