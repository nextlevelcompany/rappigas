package com.pidegas.modulos.soporte.repositorio;

import com.pidegas.modulos.soporte.dominio.MensajeTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeTicketRepositorio extends JpaRepository<MensajeTicket, Long> {

    List<MensajeTicket> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    int countByTicketId(Long ticketId);
}
