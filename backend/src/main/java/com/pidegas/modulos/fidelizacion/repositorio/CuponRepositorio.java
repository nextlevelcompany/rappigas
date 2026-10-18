package com.pidegas.modulos.fidelizacion.repositorio;

import com.pidegas.modulos.fidelizacion.dominio.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CuponRepositorio extends JpaRepository<Cupon, Long> {

    List<Cupon> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Cupon> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    @Query("SELECT c FROM Cupon c WHERE UPPER(c.codigo) = UPPER(:codigo) " +
           "AND (:tenantId IS NULL OR c.tenantId = :tenantId OR c.tenantId IS NULL) " +
           "AND c.activo = true " +
           "ORDER BY CASE WHEN :tenantId IS NOT NULL AND c.tenantId = :tenantId THEN 0 " +
           "              WHEN c.tenantId IS NULL THEN 1 ELSE 2 END")
    List<Cupon> findByCodigoValido(@Param("codigo") String codigo, @Param("tenantId") Long tenantId);

    boolean existsByTenantIdAndCodigoIgnoreCase(Long tenantId, String codigo);
}
