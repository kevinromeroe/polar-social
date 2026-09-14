-- ============================================================
-- Seed: Cuentas a monitorear
-- Marcas propias + Competidores
-- Los usernames son placeholders — validar contra perfiles reales
-- ============================================================

-- ============================================================
-- MARCAS PROPIAS
-- ============================================================

-- Buena Mesa
INSERT INTO accounts (brand_name, network, account_type, username) VALUES
  ('Buena Mesa', 'instagram',  'own', 'buenamesa_oficial'),
  ('Buena Mesa', 'facebook',   'own', 'BuenaMesaOficial'),
  ('Buena Mesa', 'tiktok',     'own', 'buenamesa_oficial'),
  ('Buena Mesa', 'linkedin',   'own', 'buena-mesa'),
  ('Buena Mesa', 'x',          'own', 'BuenaMesa_CO');

-- Pasta P.A.N.
INSERT INTO accounts (brand_name, network, account_type, username) VALUES
  ('Pasta P.A.N.', 'instagram',  'own', 'pastapan_oficial'),
  ('Pasta P.A.N.', 'facebook',   'own', 'PastaPANOficial'),
  ('Pasta P.A.N.', 'tiktok',     'own', 'pastapan_oficial'),
  ('Pasta P.A.N.', 'linkedin',   'own', 'pasta-pan'),
  ('Pasta P.A.N.', 'x',          'own', 'PastaPAN_CO');

-- ============================================================
-- COMPETENCIA: PASTA
-- ============================================================

-- Doria
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Doria', 'instagram',  'competitor', 'pasta', 'doriacolombia'),
  ('Doria', 'facebook',   'competitor', 'pasta', 'DoriaColombia'),
  ('Doria', 'tiktok',     'competitor', 'pasta', 'doriacolombia'),
  ('Doria', 'x',          'competitor', 'pasta', 'DoriaColombia');

-- La Muñeca
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('La Muñeca', 'instagram',  'competitor', 'pasta', 'lamuneca_pastas'),
  ('La Muñeca', 'facebook',   'competitor', 'pasta', 'LaMunecaPastas'),
  ('La Muñeca', 'tiktok',     'competitor', 'pasta', 'lamuneca_pastas'),
  ('La Muñeca', 'x',          'competitor', 'pasta', 'LaMunecaPastas');

-- Comarico (solo pastas)
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Comarico', 'instagram',  'competitor', 'pasta', 'comarico_oficial'),
  ('Comarico', 'facebook',   'competitor', 'pasta', 'ComaricoOficial'),
  ('Comarico', 'tiktok',     'competitor', 'pasta', 'comarico_oficial'),
  ('Comarico', 'x',          'competitor', 'pasta', 'Comarico_CO');

-- San Remo
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('San Remo', 'instagram',  'competitor', 'pasta', 'sanremo_co'),
  ('San Remo', 'facebook',   'competitor', 'pasta', 'SanRemoColombia'),
  ('San Remo', 'tiktok',     'competitor', 'pasta', 'sanremo_co'),
  ('San Remo', 'x',          'competitor', 'pasta', 'SanRemo_CO');

-- Pugliese
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Pugliese', 'instagram',  'competitor', 'pasta', 'pugliese_pastas'),
  ('Pugliese', 'facebook',   'competitor', 'pasta', 'PugliesePastas'),
  ('Pugliese', 'tiktok',     'competitor', 'pasta', 'pugliese_pastas'),
  ('Pugliese', 'x',          'competitor', 'pasta', 'Pugliese_CO');

-- ============================================================
-- COMPETENCIA: PASTA ATÚN
-- ============================================================

-- Van Camp's
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Van Camps', 'instagram',  'competitor', 'pasta_atun', 'vancamps_co'),
  ('Van Camps', 'facebook',   'competitor', 'pasta_atun', 'VanCampsColombia'),
  ('Van Camps', 'tiktok',     'competitor', 'pasta_atun', 'vancamps_co'),
  ('Van Camps', 'x',          'competitor', 'pasta_atun', 'VanCamps_CO');

-- La Soberana
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('La Soberana', 'instagram',  'competitor', 'pasta_atun', 'lasoberana_co'),
  ('La Soberana', 'facebook',   'competitor', 'pasta_atun', 'LaSoberanaCO'),
  ('La Soberana', 'tiktok',     'competitor', 'pasta_atun', 'lasoberana_co'),
  ('La Soberana', 'x',          'competitor', 'pasta_atun', 'LaSoberana_CO');

-- Bari
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Bari', 'instagram',  'competitor', 'pasta_atun', 'bari_colombia'),
  ('Bari', 'facebook',   'competitor', 'pasta_atun', 'BariColombia'),
  ('Bari', 'tiktok',     'competitor', 'pasta_atun', 'bari_colombia'),
  ('Bari', 'x',          'competitor', 'pasta_atun', 'Bari_CO');

-- Zenú
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Zenú', 'instagram',  'competitor', 'pasta_atun', 'zenu_oficial'),
  ('Zenú', 'facebook',   'competitor', 'pasta_atun', 'ZenuOficial'),
  ('Zenú', 'tiktok',     'competitor', 'pasta_atun', 'zenu_oficial'),
  ('Zenú', 'x',          'competitor', 'pasta_atun', 'Zenu_CO');

-- Isabell
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('Isabell', 'instagram',  'competitor', 'pasta_atun', 'isabell_co'),
  ('Isabell', 'facebook',   'competitor', 'pasta_atun', 'IsabellColombia'),
  ('Isabell', 'tiktok',     'competitor', 'pasta_atun', 'isabell_co'),
  ('Isabell', 'x',          'competitor', 'pasta_atun', 'Isabell_CO');

-- La Española
INSERT INTO accounts (brand_name, network, account_type, product_line, username) VALUES
  ('La Española', 'instagram',  'competitor', 'pasta_atun', 'laespanola_co'),
  ('La Española', 'facebook',   'competitor', 'pasta_atun', 'LaEspanolaCO'),
  ('La Española', 'tiktok',     'competitor', 'pasta_atun', 'laespanola_co'),
  ('La Española', 'x',          'competitor', 'pasta_atun', 'LaEspanola_CO');

-- ============================================================
-- KEYWORDS de categoría
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
