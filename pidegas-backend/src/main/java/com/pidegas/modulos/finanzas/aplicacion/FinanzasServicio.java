package com.pidegas.modulos.finanzas.aplicacion;

import com.pidegas.modulos.finanzas.dto.*;
import com.pidegas.modulos.finanzas.pasarela.ResultadoProcesamientoPago;
import com.pidegas.modulos.pedidos.dominio.Pedido;

import java.util.List;

public interface FinanzasServicio {

    ResultadoProcesamientoPago procesarPagoPedido(ProcesarPagoDto dto, Long clienteId);

    ResumenFinancieroDto obtenerResumenFinanciero(Long tenantId);

    List<PagoDetalleDto> listarPagosPorEmpresa(Long tenantId);

    List<LiquidacionDto> listarLiquidaciones(Long tenantId);

    LiquidacionDto generarLiquidacion(GenerarLiquidacionDto dto, Long tenantId);

    void registrarPagoContraEntregaSiAplica(Pedido pedido);

    byte[] exportarReporteFinancieroCsv(Long tenantId);
}
