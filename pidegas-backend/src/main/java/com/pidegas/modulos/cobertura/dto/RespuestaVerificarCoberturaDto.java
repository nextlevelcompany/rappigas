package com.pidegas.modulos.cobertura.dto;

import com.pidegas.modulos.empresas.dto.EmpresaDetalleDto;

import java.util.List;

public record RespuestaVerificarCoberturaDto(
        boolean tieneCobertura,
        Double lat,
        Double lng,
        int totalDistribuidoras,
        List<EmpresaDetalleDto> distribuidorasDisponibles
) {}
