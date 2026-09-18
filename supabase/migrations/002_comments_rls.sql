-- RLS para tabla comments (necesario para que el frontend lea con anon/authenticated)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "service_all_comments" ON comments FOR ALL TO service_role USING (true) WITH CHECK (true);
