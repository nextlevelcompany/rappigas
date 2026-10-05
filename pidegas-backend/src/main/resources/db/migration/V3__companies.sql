-- V3: Empresas Distribuidoras Afiliadas (Tenants)
CREATE TABLE empresas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    usuario_admin_id BIGINT NOT NULL REFERENCES usuarios(id),
    ruc VARCHAR(11) UNIQUE NOT NULL,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(200),
    telefono VARCHAR(15),
    email_contacto VARCHAR(150),
    direccion_fiscal VARCHAR(255),
    logo_url VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado IN ('PENDIENTE', 'APROBADA', 'SUSPENDIDA', 'RECHAZADA')),
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
