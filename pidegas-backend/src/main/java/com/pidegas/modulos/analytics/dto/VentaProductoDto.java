package com.pidegas.modulos.analytics.dto;

import java.math.BigDecimal;

public class VentaProductoDto {

    private String nombreProducto;
    private String sku;
    private long unidadesVendidas;
    private BigDecimal totalVentas;

    public VentaProductoDto() {
    }

    public VentaProductoDto(String nombreProducto, String sku, long unidadesVendidas, BigDecimal totalVentas) {
        this.nombreProducto = nombreProducto;
        this.sku = sku;
        this.unidadesVendidas = unidadesVendidas;
        this.totalVentas = totalVentas;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public long getUnidadesVendidas() {
        return unidadesVendidas;
    }

    public void setUnidadesVendidas(long unidadesVendidas) {
        this.unidadesVendidas = unidadesVendidas;
    }

    public BigDecimal getTotalVentas() {
        return totalVentas;
    }

    public void setTotalVentas(BigDecimal totalVentas) {
        this.totalVentas = totalVentas;
    }
}
