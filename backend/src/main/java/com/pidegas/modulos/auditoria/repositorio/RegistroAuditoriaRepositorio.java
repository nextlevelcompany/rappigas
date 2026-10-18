package com.pidegas.modulos.auditoria.repositorio;

import com.pidegas.modulos.auditoria.dominio.RegistroAuditoria;
import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroAuditoriaRepositorio extends JpaRepository<RegistroAuditoria, Long> {

    List<RegistroAuditoria> findTop100ByOrderByCreatedAtDesc();

    Page<RegistroAuditoria> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<RegistroAuditoria> findByTipoEventoOrderByCreatedAtDesc(TipoEventoAuditoria tipoEvento, Pageable pageable);
}
