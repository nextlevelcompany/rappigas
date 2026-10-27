-- V20__seed_cobertura_solgas_los_olivos.sql
-- Asegura cobertura geográfica para Solgas Los Olivos y distribuidoras en Lima Norte

DO $$
DECLARE
    v_emp_id BIGINT;
BEGIN
    -- 1. Solgas Los Olivos (RUC: 20609876543)
    SELECT id INTO v_emp_id FROM empresas WHERE ruc = '20609876543';
    IF v_emp_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM zonas_cobertura WHERE tenant_id = v_emp_id) THEN
            INSERT INTO zonas_cobertura (tenant_id, nombre, geometria, activa)
            VALUES (
                v_emp_id,
                'Cobertura Los Olivos y Lima Norte',
                ST_GeomFromText('POLYGON((-77.115 -12.035, -77.035 -12.035, -77.035 -11.940, -77.115 -11.940, -77.115 -12.035))', 4326),
                true
            );
        END IF;
    END IF;
END $$;
