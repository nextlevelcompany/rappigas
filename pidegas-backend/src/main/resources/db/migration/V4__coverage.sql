-- V4: Ubigeo INEI y Zonas de Cobertura Poligonales (PostGIS)
CREATE TABLE ubigeo (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_inei VARCHAR(6) UNIQUE NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    distrito VARCHAR(50) NOT NULL
);

CREATE TABLE zonas_cobertura (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    nombre VARCHAR(100) NOT NULL,
    geometria GEOMETRY(Polygon, 4326) NOT NULL,
    activa BOOLEAN DEFAULT true NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
