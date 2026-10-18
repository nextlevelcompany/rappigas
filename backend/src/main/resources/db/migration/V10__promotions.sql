-- V10: Cupones y Promociones
CREATE TABLE cupones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT REFERENCES empresas(id),
    codigo VARCHAR(30) NOT NULL,
    tipo_descuento VARCHAR(20) NOT NULL CHECK (tipo_descuento IN ('PORCENTAJE', 'MONTO_FIJO')),
    valor_descuento NUMERIC(10,2) NOT NULL CHECK (valor_descuento > 0),
    pedido_minimo NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    usos_maximos INTEGER,
    usos_actuales INTEGER DEFAULT 0 NOT NULL,
    valido_desde TIMESTAMPTZ NOT NULL,
    valido_hasta TIMESTAMPTZ NOT NULL,
    activo BOOLEAN DEFAULT true NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
