package com.pidegas.modulos.analytics.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardAdminDto {

    private BigDecimal volumenTransaccionadoTotal = BigDecimal.ZERO;
    private BigDecimal comisionesTotalesPlataforma = BigDecimal.ZERO;
    private long totalEmpresas = 0;
    private long empresasAprobadas = 0;
    private long empresasPendientes = 0;
    private long totalClientes = 0;
    private long totalRepartidores = 0;
    private long totalPedidosGlobal = 0;
    private double tasaEntregaExitosa = 0.0;
    private long ticketsAbiertos = 0;

    private List<VentasDiaDto> ventasPorDiaGlobal = new ArrayList<>();
    private Map<String, Long> distribucionPorMetodoPago = new HashMap<>();

    public DashboardAdminDto() {
    }

    public BigDecimal getVolumenTransaccionadoTotal() {
        return volumenTransaccionadoTotal;
    }

    public void setVolumenTransaccionadoTotal(BigDecimal volumenTransaccionadoTotal) {
        this.volumenTransaccionadoTotal = volumenTransaccionadoTotal;
    }

    public BigDecimal getComisionesTotalesPlataforma() {
        return comisionesTotalesPlataforma;
    }

    public void setComisionesTotalesPlataforma(BigDecimal comisionesTotalesPlataforma) {
        this.comisionesTotalesPlataforma = comisionesTotalesPlataforma;
    }

    public long getTotalEmpresas() {
        return totalEmpresas;
    }

    public void setTotalEmpresas(long totalEmpresas) {
        this.totalEmpresas = totalEmpresas;
    }

    public long getEmpresasAprobadas() {
        return empresasAprobadas;
    }

    public void setEmpresasAprobadas(long empresasAprobadas) {
        this.empresasAprobadas = empresasAprobadas;
    }

    public long getEmpresasPendientes() {
        return empresasPendientes;
    }

    public void setEmpresasPendientes(long empresasPendientes) {
        this.empresasPendientes = empresasPendientes;
    }

    public long getTotalClientes() {
        return totalClientes;
    }

    public void setTotalClientes(long totalClientes) {
        this.totalClientes = totalClientes;
    }

    public long getTotalRepartidores() {
        return totalRepartidores;
    }

    public void setTotalRepartidores(long totalRepartidores) {
        this.totalRepartidores = totalRepartidores;
    }

    public long getTotalPedidosGlobal() {
        return totalPedidosGlobal;
    }

    public void setTotalPedidosGlobal(long totalPedidosGlobal) {
        this.totalPedidosGlobal = totalPedidosGlobal;
    }

    public double getTasaEntregaExitosa() {
        return tasaEntregaExitosa;
    }

    public void setTasaEntregaExitosa(double tasaEntregaExitosa) {
        this.tasaEntregaExitosa = tasaEntregaExitosa;
    }

    public long getTicketsAbiertos() {
        return ticketsAbiertos;
    }

    public void setTicketsAbiertos(long ticketsAbiertos) {
        this.ticketsAbiertos = ticketsAbiertos;
    }

    public List<VentasDiaDto> getVentasPorDiaGlobal() {
        return ventasPorDiaGlobal;
    }

    public void setVentasPorDiaGlobal(List<VentasDiaDto> ventasPorDiaGlobal) {
        this.ventasPorDiaGlobal = ventasPorDiaGlobal;
    }

    public Map<String, Long> getDistribucionPorMetodoPago() {
        return distribucionPorMetodoPago;
    }

    public void setDistribucionPorMetodoPago(Map<String, Long> distribucionPorMetodoPago) {
        this.distribucionPorMetodoPago = distribucionPorMetodoPago;
    }
}
