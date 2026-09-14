-- ============================================================
-- Polar Social Intelligence — Schema inicial
-- Plataforma de monitoreo de redes sociales
-- Marcas: Buena Mesa, Pasta P.A.N.
-- Redes: Instagram, Facebook, TikTok, LinkedIn, X (Twitter)
-- ============================================================

-- Enum para las redes sociales soportadas
CREATE TYPE social_network AS ENUM (
  'instagram', 'facebook', 'tiktok', 'linkedin', 'x'
);

-- Enum para tipo de cuenta
CREATE TYPE account_type AS ENUM (
  'own',        -- Buena Mesa, Pasta P.A.N.
  'competitor'  -- Doria, La Muñeca, etc.
);

-- Enum para línea de producto
CREATE TYPE product_line AS ENUM (
  'pasta',       -- Doria, La Muñeca, San Remo, Pugliese, Comarico
  'pasta_atun'   -- Van Camp's, La Soberana, Bari, Zenú, Isabell, La Española
);

-- ============================================================
-- ACCOUNTS: cuentas de redes sociales monitoreadas
-- ============================================================
CREATE TABLE accounts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name    TEXT NOT NULL,               -- "Buena Mesa", "Doria", etc.
  network       social_network NOT NULL,
  account_type  account_type NOT NULL,
  product_line  product_line,                -- NULL for own brands
  username      TEXT NOT NULL,               -- @handle en la red
  profile_url   TEXT,
  avatar_url    TEXT,
  bio           TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(network, username)
);

-- ============================================================
-- ACCOUNT_SNAPSHOTS: foto periódica de métricas de cuenta
-- Se toma cada 15 días (quincenal) via Apify
-- ============================================================
CREATE TABLE account_snapshots (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  followers     INTEGER,
  following     INTEGER,
  total_posts   INTEGER,
  snapshot_date DATE NOT NULL,
  raw_data      JSONB,                       -- respuesta completa de Apify
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(account_id, snapshot_date)
);

-- ============================================================
-- POSTS: publicaciones individuales con métricas
-- ============================================================
CREATE TABLE posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  network         social_network NOT NULL,
  post_id_native  TEXT NOT NULL,              -- ID nativo de la plataforma
  post_url        TEXT,
  post_type       TEXT,                       -- 'reel', 'image', 'video', 'carousel', 'text', 'story'
  caption         TEXT,
  hashtags        TEXT[],
  mentions        TEXT[],

  -- Métricas de engagement
  likes           INTEGER DEFAULT 0,
  comments        INTEGER DEFAULT 0,
  shares          INTEGER DEFAULT 0,
  views           INTEGER DEFAULT 0,
  saves           INTEGER DEFAULT 0,

  -- Calculado
  engagement_total INTEGER GENERATED ALWAYS AS (likes + comments + shares) STORED,

  published_at    TIMESTAMPTZ,
  scraped_at      TIMESTAMPTZ DEFAULT NOW(),
  raw_data        JSONB,

  UNIQUE(network, post_id_native)
);

-- ============================================================
-- SCRAPE_RUNS: registro de cada corrida de scraping
-- ============================================================
CREATE TABLE scrape_runs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type      TEXT NOT NULL,               -- 'accounts', 'posts', 'full'
  network       social_network,
  status        TEXT DEFAULT 'pending',      -- 'pending', 'running', 'completed', 'failed'
  accounts_processed INTEGER DEFAULT 0,
  posts_scraped INTEGER DEFAULT 0,
  apify_run_id  TEXT,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  error_message TEXT,
  metadata      JSONB
);

-- ============================================================
-- CATEGORY_KEYWORDS: palabras clave para monitoreo de categoría
-- ============================================================
CREATE TABLE category_keywords (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword     TEXT NOT NULL UNIQUE,
  category    TEXT,                           -- 'pasta', 'recetas', 'tendencias', etc.
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES para performance
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
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_keywords ENABLE ROW LEVEL SECURITY;

-- Política: usuarios autenticados pueden leer todo
CREATE POLICY "Authenticated users can read accounts"
  ON accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read snapshots"
  ON account_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read posts"
  ON posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read scrape_runs"
  ON scrape_runs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read keywords"
  ON category_keywords FOR SELECT TO authenticated USING (true);

-- Service role (backend/Apify) puede hacer todo
CREATE POLICY "Service role full access accounts"
  ON accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access snapshots"
  ON account_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access posts"
  ON posts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access scrape_runs"
  ON scrape_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access keywords"
  ON category_keywords FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- FUNCTION: updated_at trigger
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
