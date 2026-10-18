package com.pidegas.modulos.cobertura.infraestructura;

import com.pidegas.modulos.cobertura.dominio.Ubigeo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UbigeoRepositorio extends JpaRepository<Ubigeo, Long> {

    @Query("SELECT DISTINCT u.departamento FROM Ubigeo u ORDER BY u.departamento ASC")
    List<String> listarDepartamentos();

    @Query("SELECT DISTINCT u.provincia FROM Ubigeo u WHERE UPPER(u.departamento) = UPPER(:departamento) ORDER BY u.provincia ASC")
    List<String> listarProvinciasPorDepartamento(@Param("departamento") String departamento);

    List<Ubigeo> findByDepartamentoIgnoreCaseAndProvinciaIgnoreCaseOrderByDistritoAsc(String departamento, String provincia);

    Optional<Ubigeo> findByCodigoInei(String codigoInei);
}
