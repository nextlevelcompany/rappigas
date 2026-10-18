-- V18: Corrección de tildes UTF-8 y asignación de imágenes oficiales para el catálogo de balones de gas

SET client_encoding = 'UTF8';

-- 1. Actualizar nombres con tildes correctas
UPDATE productos 
SET nombre = 'Balón de Gas 10kg Premium (Click-On)',
    imagen_url = '/products/balon-10kg-premium.svg'
WHERE sku = 'BALON-10KG-PREM';

UPDATE productos 
SET nombre = 'Balón de Gas 10kg Tradicional (Rosca)',
    imagen_url = '/products/balon-10kg-rosca.svg'
WHERE sku = 'BALON-10KG-ROSC';

UPDATE productos 
SET nombre = 'Balón de Gas 15kg Comercial/Familiar',
    imagen_url = '/products/balon-15kg-premium.svg'
WHERE sku = 'BALON-15KG-PREM';

UPDATE productos 
SET nombre = 'Balón de Gas 45kg Industrial',
    imagen_url = '/products/balon-45kg-industrial.svg'
WHERE sku = 'BALON-45KG-IND';

UPDATE productos 
SET nombre = 'Regulador Premium con Manómetro Antifugas',
    imagen_url = '/products/regulador-manometro.svg'
WHERE sku = 'VALVULA-REG-01';

-- 2. Actualizar descripciones con tildes correctas
UPDATE productos
SET descripcion = 'Gas GLP doméstico 10kg con válvula de conexión rápida Click-On y precinto de seguridad sellado.'
WHERE sku = 'BALON-10KG-PREM';

UPDATE productos
SET descripcion = 'Gas GLP doméstico 10kg estándar con válvula tradicional de rosca certificada.'
WHERE sku = 'BALON-10KG-ROSC';

UPDATE productos
SET descripcion = 'Gas GLP 15kg de alto rendimiento para familias numerosas, restaurantes y negocios gastronómicos.'
WHERE sku = 'BALON-15KG-PREM';

UPDATE productos
SET descripcion = 'Cilindro de GLP industrial 45kg de alta demanda para panaderías, pollerías y hoteles.'
WHERE sku = 'BALON-45KG-IND';

UPDATE productos
SET descripcion = 'Regulador certificado por Osinergmin con medidor de presión y corte automático de emergencia ante fugas.'
WHERE sku = 'VALVULA-REG-01';

-- 3. Asignar imágenes también a productos iniciales si tienen imagen_url NULL
UPDATE productos SET imagen_url = '/products/balon-10kg-premium.svg' WHERE tipo_gas = 'GLP_10KG' AND tipo_valvula = 'PREMIUM' AND imagen_url IS NULL;
UPDATE productos SET imagen_url = '/products/balon-10kg-rosca.svg' WHERE tipo_gas = 'GLP_10KG' AND tipo_valvula = 'ROSCA' AND imagen_url IS NULL;
UPDATE productos SET imagen_url = '/products/balon-15kg-premium.svg' WHERE tipo_gas = 'GLP_15KG' AND imagen_url IS NULL;
UPDATE productos SET imagen_url = '/products/balon-45kg-industrial.svg' WHERE tipo_gas = 'GLP_45KG' AND imagen_url IS NULL;
UPDATE productos SET imagen_url = '/products/regulador-manometro.svg' WHERE tipo_gas = 'VALVULA_ACCESORIO' AND imagen_url IS NULL;
