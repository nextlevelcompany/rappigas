package com.pidegas.modulos.analytics.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardEmpresaDto {

    private BigDecimal ventasHoy = BigDecimal.ZERO;
    private BigDecimal ventasMes = BigDecimal.ZERO;
    private long totalPedidosMes = 0;
    private BigDecimal ticketPromedio = BigDecimal.ZERO;

    private long pedidosPendientes = 0;
    private long pedidosEnCamino = 0;
    private long pedidosEntregados = 0;

    private long productosAgotados = 0;
    private long balonesStockBajo = 0;
    private long repartidoresActivos = 0;

    private List<VentasDiaDto> ventasPorDia = new ArrayList<>();
    private Map<String, Long> pedidosPorMetodoPago = new HashMap<>();
    private List<VentaProductoDto> ventasPorProducto = new ArrayList<>();

    public DashboardEmpresaDto() {
    }

    public BigDecimal getVentasHoy() {
        return ventasHoy;
    }

    public void setVentasHoy(BigDecimal ventasHoy) {
        this.ventasHoy = ventasHoy;
    }

    public BigDecimal getVentasMes() {
        return ventasMes;
    }

    public void setVentasMes(BigDecimal ventasMes) {
        this.ventasMes = ventasMes;
    }

    public long getTotalPedidosMes() {
        return totalPedidosMes;
    }

    public void setTotalPedidosMes(long totalPedidosMes) {
        this.totalPedidosMes = totalPedidosMes;
    }

    public BigDecimal getTicketPromedio() {
        return ticketPromedio;
    }

    public void setTicketPromedio(BigDecimal ticketPromedio) {
        this.ticketPromedio = ticketPromedio;
    }

    public long getPedidosPendientes() {
        return pedidosPendientes;
    }

    public void setPedidosPendientes(long pedidosPendientes) {
        this.pedidosPendientes = pedidosPendientes;
    }

    public long getPedidosEnCamino() {
        return pedidosEnCamino;
    }

    public void setPedidosEnCamino(long pedidosEnCamino) {
        this.pedidosEnCamino = pedidosEnCamino;
    }

    public long getPedidosEntregados() {
        return pedidosEntregados;
    }

    public void setPedidosEntregados(long pedidosEntregados) {
        this.pedidosEntregados = pedidosEntregados;
    }

    public long getProductosAgotados() {
        return productosAgotados;
    }

    public void setProductosAgotados(long productosAgotados) {
        this.productosAgotados = productosAgotados;
    }

    public long getBalonesStockBajo() {
        return balonesStockBajo;
    }

    public void setBalonesStockBajo(long balonesStockBajo) {
        this.balonesStockBajo = balonesStockBajo;
    }

    public long getRepartidoresActivos() {
        return repartidoresActivos;
    }

    public void setRepartidoresActivos(long repartidoresActivos) {
        this.repartidoresActivos = repartidoresActivos;
    }

    public List<VentasDiaDto> getVentasPorDia() {
        return ventasPorDia;
    }

    public void setVentasPorDia(List<VentasDiaDto> ventasPorDia) {
        this.ventasPorDia = ventasPorDia;
    }

    public Map<String, Long> getPedidosPorMetodoPago() {
        return pedidosPorMetodoPago;
    }

    public void setPedidosPorMetodoPago(Map<String, Long> pedidosPorMetodoPago) {
        this.pedidosPorMetodoPago = pedidosPorMetodoPago;
    }

    public List<VentaProductoDto> getVentasPorProducto() {
        return ventasPorProducto;
    }

    public void setVentasPorProducto(List<VentaProductoDto> ventasPorProducto) {
        this.ventasPorProducto = ventasPorProducto;
    }
}
