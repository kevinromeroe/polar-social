-- ============================================================
-- Polar Social Intelligence — Setup completo
-- Script idempotente: limpia todo y recrea desde cero
-- Seguro de ejecutar múltiples veces
-- ============================================================

-- ============================================================
-- PASO 1: Limpiar todo lo que pueda existir
-- ============================================================

-- Tablas primero (CASCADE elimina triggers, indexes, policies)
DROP TABLE IF EXISTS category_keywords CASCADE;
DROP TABLE IF EXISTS scrape_runs CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS account_snapshots CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Función y tipos después
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP TYPE IF EXISTS social_network CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS product_line CASCADE;

-- ============================================================
-- PASO 2: Crear ENUMs
-- ============================================================
CREATE TYPE social_network AS ENUM (
  'instagram', 'facebook', 'tiktok', 'linkedin', 'x'
);

CREATE TYPE account_type AS ENUM (
  'own',
  'competitor'
);

CREATE TYPE product_line AS ENUM (
  'pasta',
  'pasta_atun'
);

-- ============================================================
-- PASO 3: Crear tablas
-- ============================================================
CREATE TABLE accounts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name    TEXT NOT NULL,
  network       social_network NOT NULL,
  account_type  account_type NOT NULL,
  product_line  product_line,
  username      TEXT NOT NULL,
  profile_url   TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(network, username)
);

CREATE TABLE account_snapshots (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  followers     INTEGER,
  following     INTEGER,
  total_posts   INTEGER,
  snapshot_date DATE NOT NULL,
  raw_data      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date)
);

CREATE TABLE posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  network         social_network NOT NULL,
  post_id_native  TEXT NOT NULL,
  post_url        TEXT,
  post_type       TEXT,
  caption         TEXT,
  hashtags        TEXT[],
  mentions        TEXT[],
  likes           INTEGER DEFAULT 0,
  comments        INTEGER DEFAULT 0,
  shares          INTEGER DEFAULT 0,
  views           INTEGER DEFAULT 0,
  saves           INTEGER DEFAULT 0,
  engagement_total INTEGER GENERATED ALWAYS AS (likes + comments + shares) STORED,
  published_at    TIMESTAMPTZ,
  scraped_at      TIMESTAMPTZ DEFAULT NOW(),
  raw_data        JSONB,
  UNIQUE(network, post_id_native)
);

CREATE TABLE scrape_runs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type      TEXT NOT NULL,
  network       social_network,
  status        TEXT DEFAULT 'pending',
  accounts_processed INTEGER DEFAULT 0,
  posts_scraped INTEGER DEFAULT 0,
  apify_run_id  TEXT,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  error_message TEXT,
  metadata      JSONB
);

CREATE TABLE category_keywords (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword     TEXT NOT NULL UNIQUE,
  category    TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PASO 4: Indexes
-- ============================================================
CREATE INDEX idx_posts_account_id ON posts(account_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_network ON posts(network);
CREATE INDEX idx_posts_engagement ON posts(engagement_total DESC);
CREATE INDEX idx_snapshots_account_date ON account_snapshots(account_id, snapshot_date);
CREATE INDEX idx_snapshots_date ON account_snapshots(snapshot_date);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_network ON accounts(network);

-- ============================================================
-- PASO 5: RLS + Policies
-- ============================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read_accounts" ON accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_snapshots" ON account_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_posts" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_scrape_runs" ON scrape_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_keywords" ON category_keywords FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_all_accounts" ON accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_snapshots" ON account_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_posts" ON posts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_scrape_runs" ON scrape_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_keywords" ON category_keywords FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- PASO 6: Trigger updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PASO 7: Seed data — Marcas propias
-- ============================================================
INSERT INTO accounts (brand_name, network, account_type, username) VALUES
  ('Buena Mesa', 'instagram', 'own', 'buenamesa_oficial'),
  ('Buena Mesa', 'facebook',  'own', 'BuenaMesaOficial'),
  ('Buena Mesa', 'tiktok',    'own', 'buenamesa_oficial'),
  ('Buena Mesa', 'linkedin',  'own', 'buena-mesa'),
  ('Buena Mesa', 'x',         'own', 'BuenaMesa_CO'),
  ('Pasta P.A.N.', 'instagram', 'own', 'pastapan_oficial'),
  ('Pasta P.A.N.', 'facebook',  'own', 'PastaPANOficial'),
  ('Pasta P.A.N.', 'tiktok',    'own', 'pastapan_oficial'),
  ('Pasta P.A.N.', 'linkedin',  'own', 'pasta-pan'),
  ('Pasta P.A.N.', 'x',         'own', 'PastaPAN_CO');

-- ============================================================
-- PASO 8: Seed data — Competencia Pasta
-- ============================================================
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Doria', 'instagram',  'competitor', 'pasta', 'doriacolombia'),
  ('Doria', 'facebook',   'competitor', 'pasta', 'DoriaColombia'),
  ('Doria', 'tiktok',     'competitor', 'pasta', 'doriacolombia'),
  ('Doria', 'x',          'competitor', 'pasta', 'DoriaColombia'),
  ('La Muñeca', 'instagram',  'competitor', 'pasta', 'lamuneca_pastas'),
  ('La Muñeca', 'facebook',   'competitor', 'pasta', 'LaMunecaPastas'),
  ('La Muñeca', 'tiktok',     'competitor', 'pasta', 'lamuneca_pastas'),
  ('La Muñeca', 'x',          'competitor', 'pasta', 'LaMunecaPastas'),
  ('Comarico', 'instagram',  'competitor', 'pasta', 'comarico_oficial'),
  ('Comarico', 'facebook',   'competitor', 'pasta', 'ComaricoOficial'),
  ('Comarico', 'tiktok',     'competitor', 'pasta', 'comarico_oficial'),
  ('Comarico', 'x',          'competitor', 'pasta', 'Comarico_CO'),
  ('San Remo', 'instagram',  'competitor', 'pasta', 'sanremo_co'),
  ('San Remo', 'facebook',   'competitor', 'pasta', 'SanRemoColombia'),
  ('San Remo', 'tiktok',     'competitor', 'pasta', 'sanremo_co'),
  ('San Remo', 'x',          'competitor', 'pasta', 'SanRemo_CO'),
  ('Pugliese', 'instagram',  'competitor', 'pasta', 'pugliese_pastas'),
  ('Pugliese', 'facebook',   'competitor', 'pasta', 'PugliesePastas'),
  ('Pugliese', 'tiktok',     'competitor', 'pasta', 'pugliese_pastas'),
  ('Pugliese', 'x',          'competitor', 'pasta', 'Pugliese_CO');

-- ============================================================
-- PASO 9: Seed data — Competencia Pasta Atún
-- ============================================================
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Van Camps', 'instagram',    'competitor', 'pasta_atun', 'vancamps_co'),
  ('Van Camps', 'facebook',     'competitor', 'pasta_atun', 'VanCampsColombia'),
  ('Van Camps', 'tiktok',       'competitor', 'pasta_atun', 'vancamps_co'),
  ('Van Camps', 'x',            'competitor', 'pasta_atun', 'VanCamps_CO'),
  ('La Soberana', 'instagram',  'competitor', 'pasta_atun', 'lasoberana_co'),
  ('La Soberana', 'facebook',   'competitor', 'pasta_atun', 'LaSoberanaCO'),
  ('La Soberana', 'tiktok',     'competitor', 'pasta_atun', 'lasoberana_co'),
  ('La Soberana', 'x',          'competitor', 'pasta_atun', 'LaSoberana_CO'),
  ('Bari', 'instagram',  'competitor', 'pasta_atun', 'bari_colombia'),
  ('Bari', 'facebook',   'competitor', 'pasta_atun', 'BariColombia'),
  ('Bari', 'tiktok',     'competitor', 'pasta_atun', 'bari_colombia'),
  ('Bari', 'x',          'competitor', 'pasta_atun', 'Bari_CO'),
  ('Zenú', 'instagram',  'competitor', 'pasta_atun', 'zenu_oficial'),
  ('Zenú', 'facebook',   'competitor', 'pasta_atun', 'ZenuOficial'),
  ('Zenú', 'tiktok',     'competitor', 'pasta_atun', 'zenu_oficial'),
  ('Zenú', 'x',          'competitor', 'pasta_atun', 'Zenu_CO'),
  ('Isabell', 'instagram',  'competitor', 'pasta_atun', 'isabell_co'),
  ('Isabell', 'facebook',   'competitor', 'pasta_atun', 'IsabellColombia'),
  ('Isabell', 'tiktok',     'competitor', 'pasta_atun', 'isabell_co'),
  ('Isabell', 'x',          'competitor', 'pasta_atun', 'Isabell_CO'),
  ('La Española', 'instagram',  'competitor', 'pasta_atun', 'laespanola_co'),
  ('La Española', 'facebook',   'competitor', 'pasta_atun', 'LaEspanolaCO'),
  ('La Española', 'tiktok',     'competitor', 'pasta_atun', 'laespanola_co'),
  ('La Española', 'x',          'competitor', 'pasta_atun', 'LaEspanola_CO');

-- ============================================================
-- PASO 10: Keywords de categoría
-- ============================================================
INSERT INTO category_keywords (keyword, category) VALUES
  ('pasta', 'producto'),
  ('pastas', 'producto'),
  ('spaghetti', 'producto'),
  ('espagueti', 'producto'),
  ('macarrones', 'producto'),
  ('fettuccine', 'producto'),
  ('penne', 'producto'),
  ('lasaña', 'producto'),
  ('lasagna', 'producto'),
  ('fusilli', 'producto'),
  ('ravioli', 'producto'),
  ('pasta de atún', 'producto'),
  ('atún en pasta', 'producto'),
  ('receta pasta', 'recetas'),
  ('receta fácil pasta', 'recetas'),
  ('pasta rápida', 'recetas'),
  ('pasta colombiana', 'tendencias'),
  ('almuerzo rápido', 'tendencias'),
  ('comida rápida casa', 'tendencias'),
  ('meal prep', 'tendencias'),
  ('pasta saludable', 'tendencias'),
  ('pasta integral', 'tendencias'),
  ('pasta sin gluten', 'tendencias');

-- ============================================================
-- Verificación final
-- ============================================================
DO $$
DECLARE
  account_count INTEGER;
  keyword_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO account_count FROM accounts;
  SELECT COUNT(*) INTO keyword_count FROM category_keywords;
  RAISE NOTICE '=== SETUP COMPLETO ===';
  RAISE NOTICE 'Cuentas creadas: %', account_count;
  RAISE NOTICE 'Keywords creadas: %', keyword_count;
  RAISE NOTICE '5 tablas, 8 indexes, 10 policies, 1 trigger';
END $$;
