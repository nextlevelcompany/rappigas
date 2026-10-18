package com.pidegas.modulos.finanzas.repositorio;

import com.pidegas.modulos.finanzas.dominio.EstadoTransaccionPago;
import com.pidegas.modulos.finanzas.dominio.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PagoRepositorio extends JpaRepository<Pago, Long> {

    List<Pago> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<Pago> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Pago> findByPublicId(UUID publicId);

    List<Pago> findByPedidoId(Long pedidoId);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.tenantId = :tenantId AND p.estado = 'APROBADO'")
    BigDecimal sumMontoAprobadoByTenantId(@Param("tenantId") Long tenantId);

    long countByTenantIdAndEstado(Long tenantId, EstadoTransaccionPago estado);
}
