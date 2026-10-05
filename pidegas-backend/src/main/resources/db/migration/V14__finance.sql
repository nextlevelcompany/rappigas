-- V14: Finanzas, Pagos, Comisiones y Liquidaciones
CREATE TABLE pagos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id),
    cliente_id BIGINT NOT NULL REFERENCES usuarios(id),
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(30) NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'YAPE', 'PLIN', 'TARJETA')),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO')),
    referencia_transaccion VARCHAR(100),
    codigo_autorizacion VARCHAR(50),
    metadata_pasarela TEXT,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE comisiones_plataforma (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id),
    pago_id BIGINT REFERENCES pagos(id),
    monto_pedido NUMERIC(10,2) NOT NULL CHECK (monto_pedido > 0),
    porcentaje_comision NUMERIC(5,2) DEFAULT 5.00 NOT NULL CHECK (porcentaje_comision >= 0),
    monto_comision NUMERIC(10,2) NOT NULL CHECK (monto_comision >= 0),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado IN ('PENDIENTE', 'LIQUIDADA')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE liquidaciones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    periodo_inicio TIMESTAMPTZ NOT NULL,
    periodo_fin TIMESTAMPTZ NOT NULL,
    total_ventas NUMERIC(10,2) NOT NULL CHECK (total_ventas >= 0),
    total_comisiones NUMERIC(10,2) NOT NULL CHECK (total_comisiones >= 0),
    total_a_liquidar NUMERIC(10,2) NOT NULL CHECK (total_a_liquidar >= 0),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado IN ('PENDIENTE', 'PAGADA')),
    referencia_bancaria VARCHAR(100),
    fecha_pago TIMESTAMPTZ,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_pagos_tenant ON pagos(tenant_id, created_at DESC);
CREATE INDEX idx_pagos_pedido ON pagos(pedido_id);
CREATE INDEX idx_comisiones_tenant_estado ON comisiones_plataforma(tenant_id, estado);
CREATE INDEX idx_liquidaciones_tenant ON liquidaciones(tenant_id, created_at DESC);
