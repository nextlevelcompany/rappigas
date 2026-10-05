package com.pidegas.modulos.flota.repositorio;

import com.pidegas.modulos.flota.dominio.EstadoRepartidor;
import com.pidegas.modulos.flota.dominio.Repartidor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepartidorRepositorio extends JpaRepository<Repartidor, Long> {

    List<Repartidor> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Repartidor> findByTenantIdAndEstado(Long tenantId, EstadoRepartidor estado);

    Optional<Repartidor> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Repartidor> findByPublicId(UUID publicId);

    Optional<Repartidor> findByUsuarioId(Long usuarioId);

    Optional<Repartidor> findByTenantIdAndUsuarioId(Long tenantId, Long usuarioId);

    boolean existsByTenantIdAndUsuarioId(Long tenantId, Long usuarioId);

    long countByTenantIdAndEstado(Long tenantId, EstadoRepartidor estado);

    long countByEstado(EstadoRepartidor estado);
}
