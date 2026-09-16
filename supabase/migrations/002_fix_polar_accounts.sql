-- ============================================================
-- Migración 002: Corregir cuentas Polar con datos reales
-- Reemplaza seed data ficticio con usernames reales del scraping
-- ============================================================

-- Paso 1: Eliminar cuentas Polar ficticias
DELETE FROM accounts WHERE client_id = (SELECT id FROM clients WHERE slug = 'polar');

-- Paso 2: Actualizar descripción del cliente
UPDATE clients SET description = 'P.A.N. (Pasta y Atún)', auth_email = 'admin@polar.com'
WHERE slug = 'polar';

-- Paso 3: Insertar marca propia P.A.N. con datos reales
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('P.A.N.', 'instagram', 'own', NULL, 'harinapancolombia', (SELECT id FROM clients WHERE slug = 'polar')),
  ('P.A.N.', 'facebook',  'own', NULL, 'HarinaPANColombia', (SELECT id FROM clients WHERE slug = 'polar')),
  ('P.A.N.', 'tiktok',    'own', NULL, 'harinapancolombia', (SELECT id FROM clients WHERE slug = 'polar'))
ON CONFLICT (network, username) DO NOTHING;

-- Paso 4: Insertar competidores pasta con datos reales
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('Doria', 'instagram',  'competitor', 'pasta', 'alimentosdoria', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Doria', 'facebook',   'competitor', 'pasta', 'alimentosdoria', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Doria', 'tiktok',     'competitor', 'pasta', 'elbambinodoria', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Doria', 'x',          'competitor', 'pasta', 'AlimentosDoria', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Muñeca', 'instagram',  'competitor', 'pasta', 'pastaslamuneca', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Muñeca', 'facebook',   'competitor', 'pasta', 'PastasLamunecaOficial', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Muñeca', 'tiktok',     'competitor', 'pasta', 'pastaslamuneca', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Comarrico', 'instagram',  'competitor', 'pasta', 'productoscomarrico', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Comarrico', 'facebook',   'competitor', 'pasta', 'productoscomarrico', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Pugliese', 'instagram',  'competitor', 'pasta', 'pugliesepastas', (SELECT id FROM clients WHERE slug = 'polar'))
ON CONFLICT (network, username) DO NOTHING;

-- Paso 5: Insertar competidores atún con datos reales
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('Van Camp''s', 'instagram',  'competitor', 'pasta_atun', 'atunvancamps', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Van Camp''s', 'facebook',   'competitor', 'pasta_atun', 'AtunVanCamps', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Van Camp''s', 'tiktok',     'competitor', 'pasta_atun', 'atunvancampsco', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Van Camp''s', 'x',          'competitor', 'pasta_atun', 'atunvancamps', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Zenú', 'instagram',  'competitor', 'pasta_atun', 'zenuoficial', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Zenú', 'facebook',   'competitor', 'pasta_atun', 'AlimentosZenu', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Zenú', 'tiktok',     'competitor', 'pasta_atun', 'zenuoficial', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Zenú', 'x',          'competitor', 'pasta_atun', 'AlimentosZenu', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Soberana', 'instagram',  'competitor', 'pasta_atun', 'lasoberanacol', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Soberana', 'facebook',   'competitor', 'pasta_atun', 'lasoberanacol', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Soberana', 'tiktok',     'competitor', 'pasta_atun', 'lasoberanacol', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Isabel', 'instagram',  'competitor', 'pasta_atun', 'atunisabelcol', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Isabel', 'facebook',   'competitor', 'pasta_atun', 'atunisabelcolombia', (SELECT id FROM clients WHERE slug = 'polar')),
  ('Isabel', 'x',          'competitor', 'pasta_atun', 'AtunIsabelCol', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Española', 'instagram',  'competitor', 'pasta_atun', 'laespanolaoficial', (SELECT id FROM clients WHERE slug = 'polar')),
  ('La Española', 'facebook',   'competitor', 'pasta_atun', 'conservaslaespanola', (SELECT id FROM clients WHERE slug = 'polar'))
ON CONFLICT (network, username) DO NOTHING;

-- Verificación
DO $$
DECLARE
  polar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO polar_count FROM accounts
  WHERE client_id = (SELECT id FROM clients WHERE slug = 'polar');
  RAISE NOTICE '=== MIGRACIÓN 002 COMPLETA ===';
  RAISE NOTICE 'Cuentas Polar: %', polar_count;
END $$;
