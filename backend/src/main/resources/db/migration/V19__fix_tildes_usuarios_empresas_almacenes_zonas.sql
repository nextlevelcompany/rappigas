-- V19: Corrección integral de tildes y caracteres especiales UTF-8 en usuarios, empresas, almacenes y zonas de cobertura

SET client_encoding = 'UTF8';

-- ============================================================================
-- 1. CORRECCIÓN DE NOMBRES Y APELLIDOS EN USUARIOS
-- ============================================================================
UPDATE usuarios SET nombres = 'Walter', apellidos = 'Huamán' WHERE email = 'admin.independencia@megagaslima.pe';
UPDATE usuarios SET nombres = 'Álvaro', apellidos = 'De la Cuba' WHERE email = 'admin.sanisidro@sanisidrogas.pe';
UPDATE usuarios SET nombres = 'César', apellidos = 'Alarcón' WHERE email = 'admin.ate@ategas.pe';
UPDATE usuarios SET nombres = 'Raúl', apellidos = 'Navarro' WHERE email = 'admin.chorrillos@chorrillosgas.pe';
UPDATE usuarios SET nombres = 'Óscar', apellidos = 'Villegas' WHERE email = 'admin.ves@villagas.pe';
UPDATE usuarios SET nombres = 'Víctor', apellidos = 'Zambrano' WHERE email = 'admin.callao@callaogas.pe';
UPDATE usuarios SET nombres = 'Luis', apellidos = 'Cárdenas' WHERE email = 'admin.bellavista@bellavistagas.pe';
UPDATE usuarios SET nombres = 'Néstor', apellidos = 'Cerrón' WHERE email = 'admin.huancayo@huancayogas.pe';
UPDATE usuarios SET nombres = 'Gustavo', apellidos = 'Falconí' WHERE email = 'admin.ica@icagas.pe';

-- ============================================================================
-- 2. CORRECCIÓN DE EMPRESAS (Razón Social, Nombre Comercial, Dirección Fiscal)
-- ============================================================================
UPDATE empresas 
SET nombre_comercial = 'Zeta Gas Condevilla & Palao',
    razon_social = 'Distribuidora Zeta Gas San Martín S.A.C.',
    direccion_fiscal = 'Av. Perú 2840, San Martín de Porres, Lima'
WHERE ruc = '20512345001';

UPDATE empresas 
SET nombre_comercial = 'Gas Comas Express',
    razon_social = 'Comas Gas del Norte E.I.R.L.',
    direccion_fiscal = 'Av. Túpac Amaru 3420, Comas, Lima'
WHERE ruc = '20512345002';

UPDATE empresas 
SET nombre_comercial = 'Carabayllo Gas & Llama',
    razon_social = 'Distribuidora Carabayllo Gas S.A.C.',
    direccion_fiscal = 'Av. Túpac Amaru Km 22, Carabayllo, Lima'
WHERE ruc = '20512345003';

UPDATE empresas 
SET nombre_comercial = 'MegaGas Tahuantinsuyo',
    razon_social = 'MegaGas Lima Norte S.A.C.',
    direccion_fiscal = 'Av. Carlos Izaguirre 120, Independencia, Lima'
WHERE ruc = '20512345004';

UPDATE empresas 
SET nombre_comercial = 'Miraflores Premium Gas',
    razon_social = 'Servicios y Distribución Miraflores S.A.C.',
    direccion_fiscal = 'Av. José Larco 880, Miraflores, Lima'
WHERE ruc = '20512345005';

UPDATE empresas 
SET nombre_comercial = 'San Isidro Gas Dasso & Corpac',
    razon_social = 'Gas Corpac San Isidro S.A.C.',
    direccion_fiscal = 'Av. Camino Real 450, San Isidro, Lima'
WHERE ruc = '20512345006';

UPDATE empresas 
SET nombre_comercial = 'Surco Gas Express Chacarilla',
    razon_social = 'Distribuidora Surco Gas S.R.L.',
    direccion_fiscal = 'Av. Primavera 1020, Santiago de Surco, Lima'
WHERE ruc = '20512345007';

UPDATE empresas 
SET nombre_comercial = 'San Borja EcoGas',
    razon_social = 'EcoGas Residencial San Borja S.A.C.',
    direccion_fiscal = 'Av. Aviación 2850, San Borja, Lima'
WHERE ruc = '20512345008';

UPDATE empresas 
SET nombre_comercial = 'Jesús María & Lince Gas Express',
    razon_social = 'Distribuidora Central Jesús María S.A.C.',
    direccion_fiscal = 'Av. República de Chile 650, Jesús María, Lima'
WHERE ruc = '20512345009';

UPDATE empresas 
SET nombre_comercial = 'SJL Gas San Hilarión & Canto Grande',
    razon_social = 'Gas Oriente Metropolitano S.A.C.',
    direccion_fiscal = 'Av. Próceres de la Independencia 2150, San Juan de Lurigancho, Lima'
WHERE ruc = '20512345010';

UPDATE empresas 
SET nombre_comercial = 'Ate & Vitarte Gas Express',
    razon_social = 'Distribuidora Ate Vitarte Gas S.A.C.',
    direccion_fiscal = 'Av. Nicolás Ayllón 4200, Ate, Lima'
WHERE ruc = '20512345011';

UPDATE empresas 
SET nombre_comercial = 'Chorrillos Gas del Pacífico',
    razon_social = 'Gas Pacífico Chorrillos S.A.C.',
    direccion_fiscal = 'Av. Defensores del Morro 1450, Chorrillos, Lima'
WHERE ruc = '20512345012';

UPDATE empresas 
SET nombre_comercial = 'Villa El Salvador Gas Industrial & Hogar',
    razon_social = 'Distribuidora Villa Gas del Sur S.R.L.',
    direccion_fiscal = 'Av. El Sol Mz. K Lt. 4, Parque Industrial, Villa El Salvador, Lima'
WHERE ruc = '20512345013';

UPDATE empresas 
SET nombre_comercial = 'Callao Puerto Gas Express',
    razon_social = 'Distribuidora Marina del Callao S.A.C.',
    direccion_fiscal = 'Av. Sáenz Peña 780, Callao'
WHERE ruc = '20512345014';

UPDATE empresas 
SET nombre_comercial = 'Bellavista & Faucett Gas',
    razon_social = 'Bellavista Gas del Perú S.R.L.',
    direccion_fiscal = 'Av. Elmer Faucett 1420, Bellavista, Callao'
WHERE ruc = '20512345015';

UPDATE empresas 
SET nombre_comercial = 'Gas Misti & Yanahuara Express',
    razon_social = 'Distribuidora de Gas Arequipa Misti S.A.C.',
    direccion_fiscal = 'Av. Ejército 620, Yanahuara, Arequipa'
WHERE ruc = '20512345016';

UPDATE empresas 
SET nombre_comercial = 'Trujillo Primavera Gas & Sol',
    razon_social = 'Distribuidora Primavera Gas Trujillo S.A.C.',
    direccion_fiscal = 'Av. España 1850, Trujillo, La Libertad'
WHERE ruc = '20512345017';

UPDATE empresas 
SET nombre_comercial = 'Chiclayo Capital Gas & Amistad',
    razon_social = 'Distribuidora del Norte Chiclayo Gas S.R.L.',
    direccion_fiscal = 'Av. José Balta 1120, Chiclayo, Lambayeque'
WHERE ruc = '20512345018';

UPDATE empresas 
SET nombre_comercial = 'Piura Sol & Castilla Gas',
    razon_social = 'Distribuidora Piura Gas del Norte S.A.C.',
    direccion_fiscal = 'Av. Sánchez Cerro 1540, Piura'
WHERE ruc = '20512345019';

UPDATE empresas 
SET nombre_comercial = 'Cusco Imperial Gas Wanchaq',
    razon_social = 'Distribuidora Imperial Gas del Cusco S.A.C.',
    direccion_fiscal = 'Av. de la Cultura 2400, Wanchaq, Cusco'
WHERE ruc = '20512345020';

UPDATE empresas 
SET nombre_comercial = 'Huancayo Valle del Mantaro Gas',
    razon_social = 'Distribuidora Huancayo Valle Gas S.A.C.',
    direccion_fiscal = 'Av. Ferrocarril 850, El Tambo, Huancayo, Junín'
WHERE ruc = '20512345021';

UPDATE empresas 
SET nombre_comercial = 'Ica Oasis Gas San Isidro',
    razon_social = 'Distribuidora Oasis Gas de Ica S.R.L.',
    direccion_fiscal = 'Av. Cutervo 430, Ica'
WHERE ruc = '20512345022';

UPDATE empresas 
SET nombre_comercial = 'Chimbote & Nuevo Chimbote Gas',
    razon_social = 'Distribuidora Bahía Gas Chimbote S.A.C.',
    direccion_fiscal = 'Av. José Pardo 1600, Chimbote, Áncash'
WHERE ruc = '20512345023';

-- ============================================================================
-- 3. CORRECCIÓN DE ALMACENES (Nombre y Dirección)
-- ============================================================================
UPDATE almacenes SET nombre = 'Almacén SMP Central', direccion = 'Av. Perú 2840, San Martín de Porres' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345001');
UPDATE almacenes SET nombre = 'Almacén Comas Tupac Amaru', direccion = 'Av. Túpac Amaru 3420, Comas' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345002');
UPDATE almacenes SET nombre = 'Almacén Carabayllo San Pedro', direccion = 'Av. Túpac Amaru Km 22, Carabayllo' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345003');
UPDATE almacenes SET nombre = 'Almacén Independencia Tahuantinsuyo', direccion = 'Av. Carlos Izaguirre 120, Independencia' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345004');
UPDATE almacenes SET nombre = 'Almacén Miraflores Larco', direccion = 'Av. José Larco 880, Miraflores' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345005');
UPDATE almacenes SET nombre = 'Almacén San Isidro Camino Real', direccion = 'Av. Camino Real 450, San Isidro' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345006');
UPDATE almacenes SET nombre = 'Almacén Surco Primavera', direccion = 'Av. Primavera 1020, Santiago de Surco' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345007');
UPDATE almacenes SET nombre = 'Almacén San Borja Aviación', direccion = 'Av. Aviación 2850, San Borja' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345008');
UPDATE almacenes SET nombre = 'Almacén Jesús María Central', direccion = 'Av. República de Chile 650, Jesús María' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345009');
UPDATE almacenes SET nombre = 'Almacén SJL Próceres', direccion = 'Av. Próceres de la Independencia 2150, San Juan de Lurigancho' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345010');
UPDATE almacenes SET nombre = 'Almacén Ate Central', direccion = 'Av. Nicolás Ayllón 4200, Ate' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345011');
UPDATE almacenes SET nombre = 'Almacén Chorrillos Huaylas', direccion = 'Av. Defensores del Morro 1450, Chorrillos' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345012');
UPDATE almacenes SET nombre = 'Almacén VES Parque Industrial', direccion = 'Av. El Sol Mz. K Lt. 4, Villa El Salvador' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345013');
UPDATE almacenes SET nombre = 'Almacén Callao Sáenz Peña', direccion = 'Av. Sáenz Peña 780, Callao' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345014');
UPDATE almacenes SET nombre = 'Almacén Bellavista Faucett', direccion = 'Av. Elmer Faucett 1420, Bellavista' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345015');
UPDATE almacenes SET nombre = 'Almacén Arequipa Yanahuara', direccion = 'Av. Ejército 620, Yanahuara' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345016');
UPDATE almacenes SET nombre = 'Almacén Trujillo España', direccion = 'Av. España 1850, Trujillo' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345017');
UPDATE almacenes SET nombre = 'Almacén Chiclayo Balta', direccion = 'Av. José Balta 1120, Chiclayo' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345018');
UPDATE almacenes SET nombre = 'Almacén Piura Sánchez Cerro', direccion = 'Av. Sánchez Cerro 1540, Piura' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345019');
UPDATE almacenes SET nombre = 'Almacén Cusco Wanchaq', direccion = 'Av. de la Cultura 2400, Wanchaq' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345020');
UPDATE almacenes SET nombre = 'Almacén Huancayo El Tambo', direccion = 'Av. Ferrocarril 850, El Tambo, Huancayo' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345021');
UPDATE almacenes SET nombre = 'Almacén Ica Cutervo', direccion = 'Av. Cutervo 430, Ica' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345022');
UPDATE almacenes SET nombre = 'Almacén Chimbote Pardo', direccion = 'Av. José Pardo 1600, Chimbote' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345023');

-- ============================================================================
-- 4. CORRECCIÓN DE ZONAS DE COBERTURA
-- ============================================================================
UPDATE zonas_cobertura SET nombre = 'Cobertura San Martín de Porres y Límite Callao' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345001');
UPDATE zonas_cobertura SET nombre = 'Cobertura Comas y Túpac Amaru' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345002');
UPDATE zonas_cobertura SET nombre = 'Cobertura Carabayllo y San Pedro' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345003');
UPDATE zonas_cobertura SET nombre = 'Cobertura Independencia y Tahuantinsuyo' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345004');
UPDATE zonas_cobertura SET nombre = 'Cobertura Miraflores y Malecón' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345005');
UPDATE zonas_cobertura SET nombre = 'Cobertura San Isidro y Corpac' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345006');
UPDATE zonas_cobertura SET nombre = 'Cobertura Surco, Chacarilla y Monterrico' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345007');
UPDATE zonas_cobertura SET nombre = 'Cobertura San Borja y San Luis' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345008');
UPDATE zonas_cobertura SET nombre = 'Cobertura Jesús María, Lince y Magdalena' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345009');
UPDATE zonas_cobertura SET nombre = 'Cobertura San Juan de Lurigancho Integral' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345010');
UPDATE zonas_cobertura SET nombre = 'Cobertura Ate Vitarte y Puruchuco' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345011');
UPDATE zonas_cobertura SET nombre = 'Cobertura Chorrillos, Huaylas y Matellini' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345012');
UPDATE zonas_cobertura SET nombre = 'Cobertura Villa El Salvador y Tablada de Lurín' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345013');
UPDATE zonas_cobertura SET nombre = 'Cobertura Callao Cercado y Chucuito' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345014');
UPDATE zonas_cobertura SET nombre = 'Cobertura Bellavista, La Perla y Límite San Miguel' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345015');
UPDATE zonas_cobertura SET nombre = 'Cobertura Arequipa Metropolitana (Yanahuara, Cercado, Cayma)' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345016');
UPDATE zonas_cobertura SET nombre = 'Cobertura Trujillo Metropolitano (Centro, Víctor Larco, California)' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345017');
UPDATE zonas_cobertura SET nombre = 'Cobertura Chiclayo, La Victoria y José Leonardo Ortiz' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345018');
UPDATE zonas_cobertura SET nombre = 'Cobertura Piura Centro, Castilla y Los Ejidos' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345019');
UPDATE zonas_cobertura SET nombre = 'Cobertura Valle de Cusco (Cusco Centro, Wanchaq, San Sebastián)' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345020');
UPDATE zonas_cobertura SET nombre = 'Cobertura Huancayo Metropolitano (El Tambo, Huancayo, Chilca)' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345021');
UPDATE zonas_cobertura SET nombre = 'Cobertura Ica Ciudad, Subtanjalla y Huacachina' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345022');
UPDATE zonas_cobertura SET nombre = 'Cobertura Bahía Chimbote y Nuevo Chimbote' WHERE tenant_id = (SELECT id FROM empresas WHERE ruc = '20512345023');
