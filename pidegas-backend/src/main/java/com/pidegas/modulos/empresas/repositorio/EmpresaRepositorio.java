package com.pidegas.modulos.empresas.repositorio;

import com.pidegas.modulos.empresas.dominio.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmpresaRepositorio extends JpaRepository<Empresa, Long> {

    Optional<Empresa> findByPublicId(UUID publicId);

    Optional<Empresa> findByUsuarioAdminId(Long usuarioAdminId);

    Optional<Empresa> findByRuc(String ruc);

    boolean existsByRuc(String ruc);

    java.util.List<Empresa> findByEstado(com.pidegas.modulos.empresas.dominio.EstadoEmpresa estado);

    java.util.List<Empresa> findAllByOrderByCreatedAtDesc();

    java.util.List<Empresa> findByEstadoOrderByNombreComercialAsc(com.pidegas.modulos.empresas.dominio.EstadoEmpresa estado);

    long countByEstado(com.pidegas.modulos.empresas.dominio.EstadoEmpresa estado);
}
