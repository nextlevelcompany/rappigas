package com.pidegas.modulos.fidelizacion.repositorio;

import com.pidegas.modulos.fidelizacion.dominio.MovimientoPuntos;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoPuntosRepositorio extends JpaRepository<MovimientoPuntos, Long> {

    List<MovimientoPuntos> findByBilleteraIdOrderByCreatedAtDesc(Long billeteraId);

    Page<MovimientoPuntos> findByBilleteraIdOrderByCreatedAtDesc(Long billeteraId, Pageable pageable);
}
