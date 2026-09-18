-- Tabla de comentarios para Escucha Activa
CREATE TABLE IF NOT EXISTS comments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id         UUID REFERENCES posts(id) ON DELETE CASCADE,
  account_id      UUID REFERENCES accounts(id) ON DELETE CASCADE,
  network         TEXT NOT NULL,
  comment_id_native TEXT,
  author_username TEXT,
  author_name     TEXT,
  text            TEXT,
  likes           INTEGER DEFAULT 0,
  replies_count   INTEGER DEFAULT 0,
  published_at    TIMESTAMPTZ,
  scraped_at      TIMESTAMPTZ DEFAULT NOW(),
  raw_data        JSONB,
  UNIQUE(network, comment_id_native)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_account ON comments(account_id);
