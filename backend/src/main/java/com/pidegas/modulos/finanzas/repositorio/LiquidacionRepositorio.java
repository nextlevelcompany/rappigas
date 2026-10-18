package com.pidegas.modulos.finanzas.repositorio;

import com.pidegas.modulos.finanzas.dominio.Liquidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LiquidacionRepositorio extends JpaRepository<Liquidacion, Long> {

    List<Liquidacion> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Liquidacion> findByPublicIdAndTenantId(UUID publicId, Long tenantId);
}
