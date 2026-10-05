package com.pidegas.modulos.pedidos.repositorio;

import com.pidegas.modulos.pedidos.dominio.EstadoPedido;
import com.pidegas.modulos.pedidos.dominio.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {

    Page<Pedido> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<Pedido> findByTenantIdAndEstadoOrderByCreatedAtDesc(Long tenantId, EstadoPedido estado, Pageable pageable);

    Optional<Pedido> findByPublicIdAndTenantId(UUID publicId, Long tenantId);

    Optional<Pedido> findByPublicId(UUID publicId);

    Page<Pedido> findByClienteIdOrderByCreatedAtDesc(Long clienteId, Pageable pageable);

    Optional<Pedido> findByPublicIdAndClienteId(UUID publicId, Long clienteId);

    Page<Pedido> findByRepartidorIdAndEstadoInOrderByCreatedAtDesc(Long repartidorId, Collection<EstadoPedido> estados, Pageable pageable);

    Optional<Pedido> findByPublicIdAndRepartidorId(UUID publicId, Long repartidorId);

    long countByTenantIdAndEstado(Long tenantId, EstadoPedido estado);

    long countByTenantId(Long tenantId);

    long countByEstado(EstadoPedido estado);

    List<Pedido> findByTenantIdAndCreatedAtGreaterThanEqual(Long tenantId, OffsetDateTime fecha);

    List<Pedido> findByCreatedAtGreaterThanEqual(OffsetDateTime fecha);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.detalles d LEFT JOIN FETCH d.producto WHERE p.tenantId = :tenantId")
    List<Pedido> findByTenantIdWithDetalles(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM Pedido p LEFT JOIN FETCH p.detalles d LEFT JOIN FETCH d.producto")
    List<Pedido> findAllWithDetalles();
}
