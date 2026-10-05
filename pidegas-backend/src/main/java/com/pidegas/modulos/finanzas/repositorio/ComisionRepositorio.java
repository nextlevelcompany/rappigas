package com.pidegas.modulos.finanzas.repositorio;

import com.pidegas.modulos.finanzas.dominio.Comision;
import com.pidegas.modulos.finanzas.dominio.EstadoComision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ComisionRepositorio extends JpaRepository<Comision, Long> {

    List<Comision> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<Comision> findByTenantIdAndEstado(Long tenantId, EstadoComision estado);

    @Query("SELECT COALESCE(SUM(c.montoComision), 0) FROM Comision c WHERE c.tenantId = :tenantId")
    BigDecimal sumMontoComisionByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(c.montoComision), 0) FROM Comision c WHERE c.tenantId = :tenantId AND c.estado = 'PENDIENTE'")
    BigDecimal sumMontoComisionPendienteByTenantId(@Param("tenantId") Long tenantId);

    boolean existsByPedidoId(Long pedidoId);
}
