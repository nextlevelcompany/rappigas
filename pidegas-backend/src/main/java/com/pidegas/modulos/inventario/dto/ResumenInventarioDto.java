package com.pidegas.modulos.inventario.dto;

public record ResumenInventarioDto(
        Long totalBalonesDisponibles,
        Long totalBalonesReservados,
        Long almacenesActivos,
        Long productosBajoStock
) {}
