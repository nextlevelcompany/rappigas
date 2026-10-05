package com.pidegas.modulos.soporte.repositorio;

import com.pidegas.modulos.soporte.dominio.EstadoTicket;
import com.pidegas.modulos.soporte.dominio.TicketSoporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketSoporteRepositorio extends JpaRepository<TicketSoporte, Long> {

    Optional<TicketSoporte> findByPublicId(UUID publicId);

    List<TicketSoporte> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    List<TicketSoporte> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<TicketSoporte> findAllByOrderByCreatedAtDesc();

    long countByTenantIdAndEstado(Long tenantId, EstadoTicket estado);

    long countByTenantId(Long tenantId);

    long countByEstado(EstadoTicket estado);
}
