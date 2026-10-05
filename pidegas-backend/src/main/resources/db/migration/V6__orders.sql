-- V6: Pedidos, Detalle y Máquina de Estados Unificada
CREATE TABLE pedidos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    cliente_id BIGINT NOT NULL REFERENCES usuarios(id),
    repartidor_id BIGINT REFERENCES usuarios(id),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    descuento NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (descuento >= 0),
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(30) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')),
    metodo_pago VARCHAR(30) DEFAULT 'EFECTIVO' NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'YAPE', 'PLIN', 'TARJETA')),
    estado_pago VARCHAR(20) DEFAULT 'PENDIENTE' NOT NULL CHECK (estado_pago IN ('PENDIENTE', 'PAGADO', 'REEMBOLSADO')),
    direccion_entrega VARCHAR(255) NOT NULL,
    referencia_direccion VARCHAR(255),
    coordenada_entrega GEOMETRY(Point, 4326) NOT NULL,
    notas_cliente TEXT,
    codigo_confirmacion VARCHAR(6),
    fecha_entrega TIMESTAMPTZ,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE detalles_pedido (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);
