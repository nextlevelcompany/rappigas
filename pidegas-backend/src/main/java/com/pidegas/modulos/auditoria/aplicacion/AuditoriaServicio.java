package com.pidegas.modulos.auditoria.aplicacion;

import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import com.pidegas.modulos.auditoria.dto.RegistroAuditoriaDto;

import java.util.List;

public interface AuditoriaServicio {

    void registrarEvento(Long usuarioId, Long tenantId, TipoEventoAuditoria tipoEvento,
                         String descripcion, String ipOrigen, String userAgent, String detallesJson);

    List<RegistroAuditoriaDto> listarUltimosEventos();
}
