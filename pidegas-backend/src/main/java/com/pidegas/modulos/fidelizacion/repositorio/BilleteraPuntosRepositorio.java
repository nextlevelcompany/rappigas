package com.pidegas.modulos.fidelizacion.repositorio;

import com.pidegas.modulos.fidelizacion.dominio.BilleteraPuntos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BilleteraPuntosRepositorio extends JpaRepository<BilleteraPuntos, Long> {

    Optional<BilleteraPuntos> findByClienteId(Long clienteId);

    boolean existsByClienteId(Long clienteId);
}
