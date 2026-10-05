-- V15: Registro y Auditoría de Eventos Sensibles
CREATE TABLE auditoria_eventos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    tenant_id BIGINT REFERENCES empresas(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    ip_origen VARCHAR(45),
    user_agent VARCHAR(255),
    detalles_json TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_auditoria_usuario ON auditoria_eventos(usuario_id);
CREATE INDEX idx_auditoria_tenant ON auditoria_eventos(tenant_id);
CREATE INDEX idx_auditoria_tipo_fecha ON auditoria_eventos(tipo_evento, created_at DESC);
