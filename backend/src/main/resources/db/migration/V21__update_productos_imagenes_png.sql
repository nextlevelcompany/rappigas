-- V21: Actualizar rutas de imágenes de balones a renders PNG oficiales desde backend/uploads
SET client_encoding = 'UTF8';

UPDATE productos SET imagen_url = '/products/balon-10kg-premium.png' WHERE tipo_gas = 'GLP_10KG' AND (tipo_valvula = 'PREMIUM' OR tipo_valvula IS NULL);
UPDATE productos SET imagen_url = '/products/balon-10kg-rosca.png' WHERE tipo_gas = 'GLP_10KG' AND tipo_valvula = 'ROSCA';
UPDATE productos SET imagen_url = '/products/balon-15kg-premium.png' WHERE tipo_gas = 'GLP_15KG';
UPDATE productos SET imagen_url = '/products/balon-45kg-industrial.png' WHERE tipo_gas = 'GLP_45KG';
