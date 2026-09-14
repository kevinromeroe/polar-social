-- ============================================================
-- Migración 001: Soporte multi-cliente
-- Agrega tabla clients, client_id a accounts, cambia product_line a TEXT
-- Agrega datos de Havoline
-- ============================================================

-- PASO 1: Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  auth_email  TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PASO 2: Insertar clientes
INSERT INTO clients (name, slug, description, auth_email) VALUES
  ('Alimentos Polar', 'polar', 'Buena Mesa y Pasta P.A.N.', 'admin@datalitica.com.co'),
  ('Havoline', 'havoline', 'Havoline y Delo', 'havoline@datalitica.com.co')
ON CONFLICT (slug) DO NOTHING;

-- PASO 3: Agregar client_id a accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- PASO 4: Cambiar product_line de ENUM a TEXT
ALTER TABLE accounts ALTER COLUMN product_line TYPE TEXT USING product_line::TEXT;
DROP TYPE IF EXISTS product_line;

-- PASO 5: Asignar client_id a cuentas Polar existentes
UPDATE accounts SET client_id = (SELECT id FROM clients WHERE slug = 'polar')
WHERE client_id IS NULL;

-- PASO 6: Insertar cuentas Havoline — marcas propias
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('Havoline', 'instagram', 'own', 'automotriz', 'havoline_latam', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Havoline', 'facebook',  'own', 'automotriz', 'HavolineLatam', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Havoline', 'tiktok',    'own', 'automotriz', 'havoline_latam', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Havoline', 'linkedin',  'own', 'automotriz', 'havoline', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Havoline', 'x',         'own', 'automotriz', 'Havoline_Latam', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Delo', 'instagram', 'own', 'industrial', 'delo_oficial', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Delo', 'facebook',  'own', 'industrial', 'DeloOficial', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Delo', 'tiktok',    'own', 'industrial', 'delo_oficial', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Delo', 'linkedin',  'own', 'industrial', 'delo-lubricants', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Delo', 'x',         'own', 'industrial', 'Delo_CO', (SELECT id FROM clients WHERE slug = 'havoline'))
ON CONFLICT (network, username) DO NOTHING;

-- PASO 7: Insertar cuentas Havoline — competidores automotriz
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('Mobil 1', 'instagram', 'competitor', 'automotriz', 'mobil1', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Mobil 1', 'facebook',  'competitor', 'automotriz', 'Mobil1', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Mobil 1', 'x',         'competitor', 'automotriz', 'Mobil1', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Castrol', 'instagram', 'competitor', 'automotriz', 'castrol', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Castrol', 'facebook',  'competitor', 'automotriz', 'Castrol', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Castrol', 'x',         'competitor', 'automotriz', 'Castrol', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Shell Helix', 'instagram', 'competitor', 'automotriz', 'shell', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Shell Helix', 'facebook',  'competitor', 'automotriz', 'Shell', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Shell Helix', 'x',         'competitor', 'automotriz', 'Shell', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Valvoline', 'instagram', 'competitor', 'automotriz', 'valvoline', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Valvoline', 'facebook',  'competitor', 'automotriz', 'Valvoline', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Valvoline', 'x',         'competitor', 'automotriz', 'Valvoline', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Motul', 'instagram', 'competitor', 'automotriz', 'motul', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Motul', 'facebook',  'competitor', 'automotriz', 'Motul', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Motul', 'x',         'competitor', 'automotriz', 'Motul', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Total Quartz', 'instagram', 'competitor', 'automotriz', 'totalenergies', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Total Quartz', 'facebook',  'competitor', 'automotriz', 'TotalEnergies', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Total Quartz', 'x',         'competitor', 'automotriz', 'TotalEnergies', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Pennzoil', 'instagram', 'competitor', 'automotriz', 'pennzoil', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Pennzoil', 'facebook',  'competitor', 'automotriz', 'Pennzoil', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Pennzoil', 'x',         'competitor', 'automotriz', 'Pennzoil', (SELECT id FROM clients WHERE slug = 'havoline'))
ON CONFLICT (network, username) DO NOTHING;

-- PASO 8: Insertar cuentas Havoline — competidores industrial
INSERT INTO accounts (brand_name, network, account_type, product_line, username, client_id) VALUES
  ('Shell Rimula', 'instagram', 'competitor', 'industrial', 'shell_rimula', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Shell Rimula', 'facebook',  'competitor', 'industrial', 'ShellRimula', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Shell Rimula', 'x',         'competitor', 'industrial', 'ShellRimula', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Mobil Delvac', 'instagram', 'competitor', 'industrial', 'mobil_delvac', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Mobil Delvac', 'facebook',  'competitor', 'industrial', 'MobilDelvac', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Mobil Delvac', 'x',         'competitor', 'industrial', 'MobilDelvac', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Gulf', 'instagram', 'competitor', 'industrial', 'gulfoil', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Gulf', 'facebook',  'competitor', 'industrial', 'GulfOil', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Gulf', 'x',         'competitor', 'industrial', 'GulfOil', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Repsol', 'instagram', 'competitor', 'industrial', 'repsol', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Repsol', 'facebook',  'competitor', 'industrial', 'Repsol', (SELECT id FROM clients WHERE slug = 'havoline')),
  ('Repsol', 'x',         'competitor', 'industrial', 'Repsol', (SELECT id FROM clients WHERE slug = 'havoline'))
ON CONFLICT (network, username) DO NOTHING;

-- PASO 9: RLS para clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_all_clients" ON clients FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PASO 10: Index para client_id en accounts
CREATE INDEX IF NOT EXISTS idx_accounts_client_id ON accounts(client_id);

-- Verificación
DO $$
DECLARE
  client_count INTEGER;
  account_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO client_count FROM clients;
  SELECT COUNT(*) INTO account_count FROM accounts;
  RAISE NOTICE '=== MIGRACIÓN 001 COMPLETA ===';
  RAISE NOTICE 'Clientes: %', client_count;
  RAISE NOTICE 'Cuentas totales: %', account_count;
END $$;
