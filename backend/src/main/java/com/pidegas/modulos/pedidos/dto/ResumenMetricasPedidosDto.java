package com.pidegas.modulos.pedidos.dto;

public record ResumenMetricasPedidosDto(
        long pendientes,
        long confirmados,
        long enCamino,
        long entregados,
        long cancelados,
        long total
) {}
