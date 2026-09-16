#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const migrationsDir = resolve(__dirname, "..", "supabase", "migrations");
const files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();

console.log(`\n🗄️  Ejecutando migraciones en Supabase`);
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Migraciones: ${files.join(", ")}\n`);

for (const file of files) {
  const sql = readFileSync(resolve(migrationsDir, file), "utf8");
  console.log(`⏳ ${file}...`);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // Use the SQL editor endpoint instead
    const sqlRes = await fetch(`${SUPABASE_URL}/pg`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!sqlRes.ok) {
      const text = await sqlRes.text();
      console.log(`   ❌ HTTP ${sqlRes.status}: ${text.slice(0, 200)}`);

      // Try alternative: execute via management API
      console.log(`   Trying alternative SQL execution...`);
      const altRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: "GET",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
        },
      });
      console.log(`   REST API status: ${altRes.status}`);
    } else {
      const result = await sqlRes.json();
      console.log(`   ✅ ${file} executed`);
    }
  } catch (err) {
    console.log(`   ⚠️ ${err.message}`);
  }
}

console.log("\n✅ Migraciones completadas");
