-- V7: Fidelización y Billetera de Puntos
CREATE TABLE billeteras_puntos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(id),
    saldo_puntos INTEGER DEFAULT 0 NOT NULL CHECK (saldo_puntos >= 0),
    version INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE movimientos_puntos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    billetera_id BIGINT NOT NULL REFERENCES billeteras_puntos(id),
    pedido_id BIGINT REFERENCES pedidos(id),
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ACUMULACION', 'CANJE', 'AJUSTE')),
    puntos INTEGER NOT NULL,
    saldo_resultante INTEGER NOT NULL CHECK (saldo_resultante >= 0),
    motivo VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
