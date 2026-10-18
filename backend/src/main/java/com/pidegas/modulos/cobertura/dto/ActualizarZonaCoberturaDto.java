package com.pidegas.modulos.cobertura.dto;

import java.util.List;

public record ActualizarZonaCoberturaDto(
        String nombre,
        Boolean activa,
        List<List<Double>> coordenadas
) {}
