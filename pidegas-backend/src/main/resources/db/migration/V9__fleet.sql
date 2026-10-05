-- V9: Vehículos y Repartidores (Flota y Logística)
CREATE TABLE vehiculos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    placa VARCHAR(15) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    tipo_vehiculo VARCHAR(30) DEFAULT 'MOTO_FURGON' NOT NULL,
    capacidad_balones INTEGER DEFAULT 10 NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL CHECK (estado IN ('ACTIVO', 'MANTENIMIENTO', 'INACTIVO')),
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (tenant_id, placa)
);

CREATE TABLE repartidores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    vehiculo_id BIGINT REFERENCES vehiculos(id),
    licencia_conducir VARCHAR(30),
    estado VARCHAR(20) DEFAULT 'DISPONIBLE' NOT NULL CHECK (estado IN ('DISPONIBLE', 'EN_RUTA', 'DESCONECTADO', 'SUSPENDIDO')),
    ultima_coordenada GEOMETRY(Point, 4326),
    ultima_actualizacion_gps TIMESTAMPTZ,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (tenant_id, usuario_id)
);
