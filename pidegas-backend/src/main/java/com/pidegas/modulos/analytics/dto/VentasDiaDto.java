package com.pidegas.modulos.analytics.dto;

import java.math.BigDecimal;

public class VentasDiaDto {

    private String dia;
    private BigDecimal monto;
    private long pedidos;

    public VentasDiaDto() {
    }

    public VentasDiaDto(String dia, BigDecimal monto, long pedidos) {
        this.dia = dia;
        this.monto = monto;
        this.pedidos = pedidos;
    }

    public String getDia() {
        return dia;
    }

    public void setDia(String dia) {
        this.dia = dia;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public long getPedidos() {
        return pedidos;
    }

    public void setPedidos(long pedidos) {
        this.pedidos = pedidos;
    }
}
