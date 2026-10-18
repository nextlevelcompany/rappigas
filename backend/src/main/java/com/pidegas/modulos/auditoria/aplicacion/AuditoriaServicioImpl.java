package com.pidegas.modulos.auditoria.aplicacion;

import com.pidegas.modulos.auditoria.dominio.RegistroAuditoria;
import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import com.pidegas.modulos.auditoria.dto.RegistroAuditoriaDto;
import com.pidegas.modulos.auditoria.repositorio.RegistroAuditoriaRepositorio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditoriaServicioImpl implements AuditoriaServicio {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaServicioImpl.class);

    private final RegistroAuditoriaRepositorio auditoriaRepositorio;

    public AuditoriaServicioImpl(RegistroAuditoriaRepositorio auditoriaRepositorio) {
        this.auditoriaRepositorio = auditoriaRepositorio;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarEvento(Long usuarioId, Long tenantId, TipoEventoAuditoria tipoEvento,
                                String descripcion, String ipOrigen, String userAgent, String detallesJson) {
        try {
            String ipFinal = ipOrigen;
            String userAgentFinal = userAgent;

            if (ipFinal == null || userAgentFinal == null) {
                var requestAttributes = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
                if (requestAttributes instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
                    var req = sra.getRequest();
                    if (ipFinal == null) {
                        String xff = req.getHeader("X-Forwarded-For");
                        ipFinal = (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
                    }
                    if (userAgentFinal == null) {
                        userAgentFinal = req.getHeader("User-Agent");
                    }
                }
            }

            RegistroAuditoria reg = new RegistroAuditoria(
                    usuarioId,
                    tenantId,
                    tipoEvento,
                    descripcion,
                    ipFinal != null ? ipFinal : "127.0.0.1",
                    userAgentFinal,
                    detallesJson
            );
            auditoriaRepositorio.save(reg);
            log.info("[AUDITORIA] Evento registrado: {} - Usuario: {} - Tenant: {} - IP: {}", tipoEvento, usuarioId, tenantId, ipFinal);
        } catch (Exception e) {
            log.error("[AUDITORIA] Error registrando evento sensible: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroAuditoriaDto> listarUltimosEventos() {
        return auditoriaRepositorio.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapearADto)
                .toList();
    }

    private RegistroAuditoriaDto mapearADto(RegistroAuditoria r) {
        return new RegistroAuditoriaDto(
                r.getPublicId(),
                r.getUsuarioId(),
                r.getTenantId(),
                r.getTipoEvento(),
                r.getDescripcion(),
                r.getIpOrigen(),
                r.getUserAgent(),
                r.getDetallesJson(),
                r.getCreatedAt()
        );
    }
}
