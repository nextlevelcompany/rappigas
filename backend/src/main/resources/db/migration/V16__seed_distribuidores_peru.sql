-- V16__seed_distribuidores_peru.sql
-- Inserción de 23 distribuidores autorizados en Lima Metropolitana, Callao y principales provincias del Perú

DO $$
DECLARE
    v_user_id BIGINT;
    v_empresa_id BIGINT;
    v_almacen_id BIGINT;
    v_prod_id BIGINT;
    v_pwd VARCHAR := '$2a$10$H5BUjYlO5ceNwlF0xoh0euGDhCqQIgI1SWkMjRCQnLVqT66yAsmRa';
BEGIN
    -- === Zeta Gas Condevilla & Palao (20512345001) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.smp@zetagasnorte.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.smp@zetagasnorte.pe', v_pwd, 'EMPRESA', 'Carlos', 'Silva', '987110001', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345001', 'Zeta Gas Condevilla & Palao', 'Distribuidora Zeta Gas San Martín S.A.C.', '987110001', 'admin.smp@zetagasnorte.pe', 'Av. Perú 2840, San Martín de Porres, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén SMP Central', 'Av. Perú 2840, San Martín de Porres', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura San Martín de Porres y Límite Callao', ST_GeomFromText('POLYGON((-77.100 -12.045, -77.035 -12.045, -77.035 -11.980, -77.100 -11.980, -77.100 -12.045))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Gas Comas Express (20512345002) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.comas@comasgas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.comas@comasgas.pe', v_pwd, 'EMPRESA', 'Marco', 'Quispe', '987110002', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345002', 'Gas Comas Express', 'Comas Gas del Norte E.I.R.L.', '987110002', 'admin.comas@comasgas.pe', 'Av. Túpac Amaru 3420, Comas, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Comas Tupac Amaru', 'Av. Túpac Amaru 3420, Comas', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Comas y Túpac Amaru', ST_GeomFromText('POLYGON((-77.075 -11.965, -77.020 -11.965, -77.020 -11.900, -77.075 -11.900, -77.075 -11.965))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 50.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 75.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 208.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Carabayllo Gas & Llama (20512345003) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.carabayllo@carabayllogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.carabayllo@carabayllogas.pe', v_pwd, 'EMPRESA', 'Jorge', 'Flores', '987110003', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345003', 'Carabayllo Gas & Llama', 'Distribuidora Carabayllo Gas S.A.C.', '987110003', 'admin.carabayllo@carabayllogas.pe', 'Av. Túpac Amaru Km 22, Carabayllo, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Carabayllo San Pedro', 'Av. Túpac Amaru Km 22, Carabayllo', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Carabayllo y San Pedro', ST_GeomFromText('POLYGON((-77.065 -11.925, -76.980 -11.925, -76.980 -11.840, -77.065 -11.840, -77.065 -11.925))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 47.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 74.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 205.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === MegaGas Tahuantinsuyo (20512345004) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.independencia@megagaslima.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.independencia@megagaslima.pe', v_pwd, 'EMPRESA', 'Walter', 'Huamán', '987110004', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345004', 'MegaGas Tahuantinsuyo', 'MegaGas Lima Norte S.A.C.', '987110004', 'admin.independencia@megagaslima.pe', 'Av. Carlos Izaguirre 120, Independencia, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Independencia Tahuantinsuyo', 'Av. Carlos Izaguirre 120, Independencia', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Independencia y Tahuantinsuyo', ST_GeomFromText('POLYGON((-77.065 -12.020, -77.025 -12.020, -77.025 -11.975, -77.065 -11.975, -77.065 -12.020))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 52.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 77.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 212.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Miraflores Premium Gas (20512345005) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.miraflores@mirafloresgas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.miraflores@mirafloresgas.pe', v_pwd, 'EMPRESA', 'Rodrigo', 'Barrenechea', '987110005', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345005', 'Miraflores Premium Gas', 'Servicios y Distribución Miraflores S.A.C.', '987110005', 'admin.miraflores@mirafloresgas.pe', 'Av. José Larco 880, Miraflores, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Miraflores Larco', 'Av. José Larco 880, Miraflores', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Miraflores y Malecón', ST_GeomFromText('POLYGON((-77.055 -12.145, -77.005 -12.145, -77.005 -12.100, -77.055 -12.100, -77.055 -12.145))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 54.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 51.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 80.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 225.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === San Isidro Gas Dasso & Corpac (20512345006) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.sanisidro@sanisidrogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.sanisidro@sanisidrogas.pe', v_pwd, 'EMPRESA', 'Álvaro', 'De la Cuba', '987110006', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345006', 'San Isidro Gas Dasso & Corpac', 'Gas Corpac San Isidro S.A.C.', '987110006', 'admin.sanisidro@sanisidrogas.pe', 'Av. Camino Real 450, San Isidro, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén San Isidro Camino Real', 'Av. Camino Real 450, San Isidro', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura San Isidro y Corpac', ST_GeomFromText('POLYGON((-77.060 -12.115, -77.015 -12.115, -77.015 -12.080, -77.060 -12.080, -77.060 -12.115))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 54.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 51.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 81.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 225.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Surco Gas Express Chacarilla (20512345007) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.surco@surcogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.surco@surcogas.pe', v_pwd, 'EMPRESA', 'Fernando', 'Morales', '987110007', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345007', 'Surco Gas Express Chacarilla', 'Distribuidora Surco Gas S.R.L.', '987110007', 'admin.surco@surcogas.pe', 'Av. Primavera 1020, Santiago de Surco, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Surco Primavera', 'Av. Primavera 1020, Santiago de Surco', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Surco, Chacarilla y Monterrico', ST_GeomFromText('POLYGON((-77.025 -12.175, -76.950 -12.175, -76.950 -12.110, -77.025 -12.110, -77.025 -12.175))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 53.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 50.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 79.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 220.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === San Borja EcoGas (20512345008) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.sanborja@sanborjagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.sanborja@sanborjagas.pe', v_pwd, 'EMPRESA', 'Javier', 'Benavides', '987110008', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345008', 'San Borja EcoGas', 'EcoGas Residencial San Borja S.A.C.', '987110008', 'admin.sanborja@sanborjagas.pe', 'Av. Aviación 2850, San Borja, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén San Borja Aviación', 'Av. Aviación 2850, San Borja', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura San Borja y San Luis', ST_GeomFromText('POLYGON((-77.020 -12.115, -76.975 -12.115, -76.975 -12.075, -77.020 -12.075, -77.020 -12.115))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 53.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 50.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 78.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 218.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Jesús María & Lince Gas Express (20512345009) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.jesusmaria@jesusmariagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.jesusmaria@jesusmariagas.pe', v_pwd, 'EMPRESA', 'Daniel', 'Paredes', '987110009', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345009', 'Jesús María & Lince Gas Express', 'Distribuidora Central Jesús María S.A.C.', '987110009', 'admin.jesusmaria@jesusmariagas.pe', 'Av. República de Chile 650, Jesús María, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Jesús María Central', 'Av. República de Chile 650, Jesús María', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Jesús María, Lince y Magdalena', ST_GeomFromText('POLYGON((-77.062 -12.090, -77.035 -12.090, -77.035 -12.060, -77.062 -12.060, -77.062 -12.090))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 52.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 78.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 215.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === SJL Gas San Hilarión & Canto Grande (20512345010) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.sjl@sanjuanagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.sjl@sanjuanagas.pe', v_pwd, 'EMPRESA', 'Percy', 'Ramos', '987110010', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345010', 'SJL Gas San Hilarión & Canto Grande', 'Gas Oriente Metropolitano S.A.C.', '987110010', 'admin.sjl@sanjuanagas.pe', 'Av. Próceres de la Independencia 2150, San Juan de Lurigancho, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén SJL Próceres', 'Av. Próceres de la Independencia 2150, San Juan de Lurigancho', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura San Juan de Lurigancho Integral', ST_GeomFromText('POLYGON((-77.035 -12.030, -76.940 -12.030, -76.940 -11.920, -77.035 -11.920, -77.035 -12.030))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 47.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 74.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 205.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Ate & Vitarte Gas Express (20512345011) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.ate@ategas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.ate@ategas.pe', v_pwd, 'EMPRESA', 'César', 'Alarcón', '987110011', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345011', 'Ate & Vitarte Gas Express', 'Distribuidora Ate Vitarte Gas S.A.C.', '987110011', 'admin.ate@ategas.pe', 'Av. Nicolás Ayllón 4200, Ate, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Ate Central', 'Av. Nicolás Ayllón 4200, Ate', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Ate Vitarte y Puruchuco', ST_GeomFromText('POLYGON((-76.960 -12.065, -76.870 -12.065, -76.870 -12.000, -76.960 -12.000, -76.960 -12.065))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 50.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 75.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 208.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Chorrillos Gas del Pacífico (20512345012) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.chorrillos@chorrillosgas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.chorrillos@chorrillosgas.pe', v_pwd, 'EMPRESA', 'Raúl', 'Navarro', '987110012', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345012', 'Chorrillos Gas del Pacífico', 'Gas Pacífico Chorrillos S.A.C.', '987110012', 'admin.chorrillos@chorrillosgas.pe', 'Av. Defensores del Morro 1450, Chorrillos, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Chorrillos Huaylas', 'Av. Defensores del Morro 1450, Chorrillos', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Chorrillos, Huaylas y Matellini', ST_GeomFromText('POLYGON((-77.045 -12.215, -76.980 -12.215, -76.980 -12.145, -77.045 -12.145, -77.045 -12.215))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Villa El Salvador Gas Industrial & Hogar (20512345013) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.ves@villagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.ves@villagas.pe', v_pwd, 'EMPRESA', 'Óscar', 'Villegas', '987110013', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345013', 'Villa El Salvador Gas Industrial & Hogar', 'Distribuidora Villa Gas del Sur S.R.L.', '987110013', 'admin.ves@villagas.pe', 'Av. El Sol Mz. K Lt. 4, Parque Industrial, Villa El Salvador, Lima', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén VES Parque Industrial', 'Av. El Sol Mz. K Lt. 4, Villa El Salvador', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Villa El Salvador y Tablada de Lurín', ST_GeomFromText('POLYGON((-76.975 -12.250, -76.905 -12.250, -76.905 -12.175, -76.975 -12.175, -76.975 -12.250))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 49.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 46.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 73.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 204.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Callao Puerto Gas Express (20512345014) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.callao@callaogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.callao@callaogas.pe', v_pwd, 'EMPRESA', 'Víctor', 'Zambrano', '987110014', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345014', 'Callao Puerto Gas Express', 'Distribuidora Marina del Callao S.A.C.', '987110014', 'admin.callao@callaogas.pe', 'Av. Sáenz Peña 780, Callao', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Callao Sáenz Peña', 'Av. Sáenz Peña 780, Callao', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Callao Cercado y Chucuito', ST_GeomFromText('POLYGON((-77.165 -12.080, -77.110 -12.080, -77.110 -12.030, -77.165 -12.030, -77.165 -12.080))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Bellavista & Faucett Gas (20512345015) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.bellavista@bellavistagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.bellavista@bellavistagas.pe', v_pwd, 'EMPRESA', 'Luis', 'Cárdenas', '987110015', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345015', 'Bellavista & Faucett Gas', 'Bellavista Gas del Perú S.R.L.', '987110015', 'admin.bellavista@bellavistagas.pe', 'Av. Elmer Faucett 1420, Bellavista, Callao', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Bellavista Faucett', 'Av. Elmer Faucett 1420, Bellavista', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Bellavista, La Perla y Límite San Miguel', ST_GeomFromText('POLYGON((-77.125 -12.080, -77.080 -12.080, -77.080 -12.045, -77.125 -12.045, -77.125 -12.080))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 52.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 77.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 212.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Gas Misti & Yanahuara Express (20512345016) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.arequipa@aqpgas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.arequipa@aqpgas.pe', v_pwd, 'EMPRESA', 'Gonzalo', 'Bustamante', '959110016', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345016', 'Gas Misti & Yanahuara Express', 'Distribuidora de Gas Arequipa Misti S.A.C.', '959110016', 'admin.arequipa@aqpgas.pe', 'Av. Ejército 620, Yanahuara, Arequipa', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Arequipa Yanahuara', 'Av. Ejército 620, Yanahuara', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Arequipa Metropolitana (Yanahuara, Cercado, Cayma)', ST_GeomFromText('POLYGON((-71.590 -16.440, -71.490 -16.440, -71.490 -16.360, -71.590 -16.360, -71.590 -16.440))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 52.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 77.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 215.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Trujillo Primavera Gas & Sol (20512345017) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.trujillo@trujillogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.trujillo@trujillogas.pe', v_pwd, 'EMPRESA', 'Enrique', 'Pinillos', '944110017', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345017', 'Trujillo Primavera Gas & Sol', 'Distribuidora Primavera Gas Trujillo S.A.C.', '944110017', 'admin.trujillo@trujillogas.pe', 'Av. España 1850, Trujillo, La Libertad', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Trujillo España', 'Av. España 1850, Trujillo', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Trujillo Metropolitano (Centro, Víctor Larco, California)', ST_GeomFromText('POLYGON((-79.080 -8.150, -78.980 -8.150, -78.980 -8.070, -79.080 -8.070, -79.080 -8.150))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 50.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 75.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Chiclayo Capital Gas & Amistad (20512345018) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.chiclayo@chiclayogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.chiclayo@chiclayogas.pe', v_pwd, 'EMPRESA', 'Manuel', 'Coronado', '979110018', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345018', 'Chiclayo Capital Gas & Amistad', 'Distribuidora del Norte Chiclayo Gas S.R.L.', '979110018', 'admin.chiclayo@chiclayogas.pe', 'Av. José Balta 1120, Chiclayo, Lambayeque', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Chiclayo Balta', 'Av. José Balta 1120, Chiclayo', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Chiclayo, La Victoria y José Leonardo Ortiz', ST_GeomFromText('POLYGON((-79.890 -6.810, -79.790 -6.810, -79.790 -6.730, -79.890 -6.730, -79.890 -6.810))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 49.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 47.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 74.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 208.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Piura Sol & Castilla Gas (20512345019) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.piura@piuragas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.piura@piuragas.pe', v_pwd, 'EMPRESA', 'Arturo', 'Seminario', '969110019', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345019', 'Piura Sol & Castilla Gas', 'Distribuidora Piura Gas del Norte S.A.C.', '969110019', 'admin.piura@piuragas.pe', 'Av. Sánchez Cerro 1540, Piura', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Piura Sánchez Cerro', 'Av. Sánchez Cerro 1540, Piura', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Piura Centro, Castilla y Los Ejidos', ST_GeomFromText('POLYGON((-80.680 -5.235, -80.580 -5.235, -80.580 -5.155, -80.680 -5.155, -80.680 -5.235))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Cusco Imperial Gas Wanchaq (20512345020) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.cusco@cuscogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.cusco@cuscogas.pe', v_pwd, 'EMPRESA', 'Inti', 'Tupayachi', '984110020', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345020', 'Cusco Imperial Gas Wanchaq', 'Distribuidora Imperial Gas del Cusco S.A.C.', '984110020', 'admin.cusco@cuscogas.pe', 'Av. de la Cultura 2400, Wanchaq, Cusco', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Cusco Wanchaq', 'Av. de la Cultura 2400, Wanchaq', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Valle de Cusco (Cusco Centro, Wanchaq, San Sebastián)', ST_GeomFromText('POLYGON((-72.015 -13.560, -71.915 -13.560, -71.915 -13.485, -72.015 -13.485, -72.015 -13.560))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 53.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 50.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 78.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 220.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Huancayo Valle del Mantaro Gas (20512345021) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.huancayo@huancayogas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.huancayo@huancayogas.pe', v_pwd, 'EMPRESA', 'Néstor', 'Cerrón', '964110021', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345021', 'Huancayo Valle del Mantaro Gas', 'Distribuidora Huancayo Valle Gas S.A.C.', '964110021', 'admin.huancayo@huancayogas.pe', 'Av. Ferrocarril 850, El Tambo, Huancayo, Junín', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Huancayo El Tambo', 'Av. Ferrocarril 850, El Tambo, Huancayo', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Huancayo Metropolitano (El Tambo, Huancayo, Chilca)', ST_GeomFromText('POLYGON((-75.250 -12.105, -75.160 -12.105, -75.160 -12.025, -75.250 -12.025, -75.250 -12.105))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 49.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 212.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Ica Oasis Gas San Isidro (20512345022) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.ica@icagas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.ica@icagas.pe', v_pwd, 'EMPRESA', 'Gustavo', 'Falconí', '956110022', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345022', 'Ica Oasis Gas San Isidro', 'Distribuidora Oasis Gas de Ica S.R.L.', '956110022', 'admin.ica@icagas.pe', 'Av. Cutervo 430, Ica', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Ica Cutervo', 'Av. Cutervo 430, Ica', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Ica Ciudad, Subtanjalla y Huacachina', ST_GeomFromText('POLYGON((-75.770 -14.105, -75.690 -14.105, -75.690 -14.030, -75.770 -14.030, -75.770 -14.105))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 50.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 47.50, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 75.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 208.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

    -- === Chimbote & Nuevo Chimbote Gas (20512345023) ===
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin.chimbote@chimbotegas.pe') THEN
        INSERT INTO usuarios (email, password_hash, rol, nombres, apellidos, telefono, estado)
        VALUES ('admin.chimbote@chimbotegas.pe', v_pwd, 'EMPRESA', 'Julio', 'Morales', '943110023', 'ACTIVO')
        RETURNING id INTO v_user_id;

        INSERT INTO empresas (usuario_admin_id, ruc, nombre_comercial, razon_social, telefono, email_contacto, direccion_fiscal, estado)
        VALUES (v_user_id, '20512345023', 'Chimbote & Nuevo Chimbote Gas', 'Distribuidora Bahía Gas Chimbote S.A.C.', '943110023', 'admin.chimbote@chimbotegas.pe', 'Av. José Pardo 1600, Chimbote, Áncash', 'APROBADA')
        RETURNING id INTO v_empresa_id;

        INSERT INTO almacenes (tenant_id, nombre, direccion, activo)
        VALUES (v_empresa_id, 'Almacén Chimbote Pardo', 'Av. José Pardo 1600, Chimbote', true)
        RETURNING id INTO v_almacen_id;

        INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
        VALUES (v_empresa_id, 'Cobertura Bahía Chimbote y Nuevo Chimbote', ST_GeomFromText('POLYGON((-78.640 -9.120, -78.540 -9.120, -78.540 -9.030, -78.640 -9.030, -78.640 -9.120))', 4326), true);

        -- Productos y Stock del catálogo
        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-PREM', 'Balón de Gas 10kg Premium (Click-On)', 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad.', 'GLP_10KG', 'PREMIUM', 51.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 60, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-10KG-ROSC', 'Balón de Gas 10kg Tradicional (Rosca)', 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca.', 'GLP_10KG', 'ROSCA', 48.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 50, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-15KG-PREM', 'Balón de Gas 15kg Comercial/Familiar', 'Gas GLP 15kg para familias numerosas, restaurantes y negocios gastronómicos.', 'GLP_15KG', 'PREMIUM', 76.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 25, 0, 5);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'BALON-45KG-IND', 'Balón de Gas 45kg Industrial', 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.', 'GLP_45KG', 'ROSCA', 210.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 15, 0, 3);

        INSERT INTO productos (tenant_id, sku, nombre, descripcion, tipo_gas, tipo_valvula, precio, estado)
        VALUES (v_empresa_id, 'VALVULA-REG-01', 'Regulador Premium con Manómetro Antifugas', 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia.', 'VALVULA_ACCESORIO', 'PREMIUM', 38.00, 'ACTIVO')
        RETURNING id INTO v_prod_id;
        INSERT INTO stock_productos (tenant_id, almacen_id, producto_id, cantidad_disponible, cantidad_reservada, stock_minimo)
        VALUES (v_empresa_id, v_almacen_id, v_prod_id, 30, 0, 5);
    END IF;

END $$;
