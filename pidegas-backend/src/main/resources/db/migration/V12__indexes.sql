-- V12: Índices Geoespaciales GiST y B-Tree de Alto Rendimiento

-- Índices GiST Geoespaciales
CREATE INDEX idx_zonas_geometria ON zonas_cobertura USING GIST (geometria);
CREATE INDEX idx_pedidos_coordenada ON pedidos USING GIST (coordenada_entrega);
CREATE INDEX idx_repartidores_gps ON repartidores USING GIST (ultima_coordenada);

-- Índices B-Tree para Tenancy y Estados
CREATE INDEX idx_productos_tenant_estado ON productos (tenant_id, estado);
CREATE INDEX idx_pedidos_tenant_estado ON pedidos (tenant_id, estado);
CREATE INDEX idx_pedidos_cliente_created ON pedidos (cliente_id, created_at DESC);
CREATE INDEX idx_pedidos_tenant_created ON pedidos (tenant_id, created_at DESC);
CREATE INDEX idx_movimientos_stock_tenant_created ON movimientos_stock (tenant_id, created_at DESC);
CREATE INDEX idx_cupones_codigo ON cupones (codigo) WHERE activo = true;
CREATE INDEX idx_usuarios_email ON usuarios (email);
CREATE INDEX idx_empresas_ruc ON empresas (ruc);
CREATE INDEX idx_ubigeo_codigo ON ubigeo (codigo_inei);
