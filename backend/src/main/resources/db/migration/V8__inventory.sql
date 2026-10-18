-- V8: Almacenes, Stock e Inventario Kardex
CREATE TABLE almacenes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    public_id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT true NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE stock_productos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    almacen_id BIGINT NOT NULL REFERENCES almacenes(id),
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    cantidad_disponible INTEGER DEFAULT 0 NOT NULL CHECK (cantidad_disponible >= 0),
    cantidad_reservada INTEGER DEFAULT 0 NOT NULL CHECK (cantidad_reservada >= 0),
    stock_minimo INTEGER DEFAULT 5 NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL,
    UNIQUE (almacen_id, producto_id)
);

CREATE TABLE movimientos_stock (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES empresas(id),
    almacen_id BIGINT NOT NULL REFERENCES almacenes(id),
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    pedido_id BIGINT REFERENCES pedidos(id),
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA_VENTA', 'AJUSTE', 'DEVOLUCION')),
    cantidad INTEGER NOT NULL,
    motivo VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
