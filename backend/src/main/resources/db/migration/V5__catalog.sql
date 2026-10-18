-- V5: Catálogo de Productos y Precios por Empresa (Tenant)
CREATE TABLE productos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    sku VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_gas VARCHAR(30) DEFAULT 'GLP_10KG' NOT NULL,
    tipo_valvula VARCHAR(30) DEFAULT 'PREMIUM' NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    imagen_url VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL CHECK (estado IN ('ACTIVO', 'AGOTADO', 'INACTIVO')),
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (tenant_id, sku)
);
