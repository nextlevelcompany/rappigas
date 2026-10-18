package com.pidegas.modulos.auditoria.dto;

import com.pidegas.modulos.auditoria.dominio.TipoEventoAuditoria;
import java.time.OffsetDateTime;
import java.util.UUID;

public record RegistroAuditoriaDto(
        UUID publicId,
        Long usuarioId,
        Long tenantId,
        TipoEventoAuditoria tipoEvento,
        String descripcion,
        String ipOrigen,
        String userAgent,
        String detallesJson,
        OffsetDateTime createdAt
) {}
