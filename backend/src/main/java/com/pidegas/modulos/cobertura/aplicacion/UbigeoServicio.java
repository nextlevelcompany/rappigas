package com.pidegas.modulos.cobertura.aplicacion;

import com.pidegas.modulos.cobertura.dominio.Ubigeo;
import com.pidegas.modulos.cobertura.dto.UbigeoDto;
import com.pidegas.modulos.cobertura.infraestructura.UbigeoRepositorio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UbigeoServicio {

    private final UbigeoRepositorio ubigeoRepositorio;

    public UbigeoServicio(UbigeoRepositorio ubigeoRepositorio) {
        this.ubigeoRepositorio = ubigeoRepositorio;
    }

    public List<String> listarDepartamentos() {
        return ubigeoRepositorio.listarDepartamentos();
    }

    public List<String> listarProvincias(String departamento) {
        return ubigeoRepositorio.listarProvinciasPorDepartamento(departamento);
    }

    public List<UbigeoDto> listarDistritos(String departamento, String provincia) {
        return ubigeoRepositorio.findByDepartamentoIgnoreCaseAndProvinciaIgnoreCaseOrderByDistritoAsc(departamento, provincia)
                .stream()
                .map(this::mapearADto)
                .toList();
    }

    public UbigeoDto buscarPorCodigoInei(String codigoInei) {
        return ubigeoRepositorio.findByCodigoInei(codigoInei)
                .map(this::mapearADto)
                .orElseThrow(() -> new IllegalArgumentException("Código de Ubigeo no encontrado: " + codigoInei));
    }

    private UbigeoDto mapearADto(Ubigeo entidad) {
        return new UbigeoDto(
                entidad.getId(),
                entidad.getCodigoInei(),
                entidad.getDepartamento(),
                entidad.getProvincia(),
                entidad.getDistrito()
        );
    }
}
