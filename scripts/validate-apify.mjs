#!/usr/bin/env node
/**
 * Validación rápida de Apify → Supabase
 * Scrapea el perfil de Instagram de una cuenta y guarda el snapshot en Supabase.
 *
 * Uso:
 *   node scripts/validate-apify.mjs [username]
 *
 * Requiere en .env.local:
 *   APIFY_API_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const APIFY_TOKEN = env.APIFY_API_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!APIFY_TOKEN) {
  console.error("❌ APIFY_API_TOKEN vacío en .env.local");
  console.error("   Agrégalo desde https://console.apify.com/settings/integrations");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

const targetUsername = process.argv[2] || "buenamesa_oficial";

console.log(`\n🔍 Validación Apify → Supabase`);
console.log(`   Cuenta: @${targetUsername} (Instagram)`);
console.log(`   Supabase: ${SUPABASE_URL}`);
console.log("");

// ── Paso 1: Buscar la cuenta en Supabase ──
async function supabaseGet(table, params = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabasePost(table, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase POST ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseUpsert(table, data) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Supabase UPSERT ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Paso 2: Ejecutar scraping en Apify ──
async function runApifyActor(actorId, input) {
  console.log(`⏳ Ejecutando actor ${actorId}...`);

  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify run failed: ${res.status} ${body}`);
  }

  const run = await res.json();
  const runId = run.data.id;
  console.log(`   Run ID: ${runId}`);

  // Esperar a que termine
  let status = run.data.status;
  let attempts = 0;
  while (status === "RUNNING" || status === "READY") {
    attempts++;
    if (attempts > 60) throw new Error("Timeout esperando Apify (5 min)");
    await new Promise((r) => setTimeout(r, 5000));

    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();
    status = statusData.data.status;
    process.stdout.write(`   Status: ${status} (${attempts * 5}s)\r`);
  }
  console.log(`   Status final: ${status}          `);

  if (status !== "SUCCEEDED") {
    throw new Error(`Apify run terminó con status: ${status}`);
  }

  // Obtener resultados del dataset
  const datasetRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
  );
  if (!datasetRes.ok) throw new Error("No se pudo obtener el dataset");
  return datasetRes.json();
}

// ── Paso 3: Procesar y guardar ──
async function main() {
  // 1. Verificar cuenta en Supabase
  console.log("1️⃣  Buscando cuenta en Supabase...");
  const accounts = await supabaseGet(
    "accounts",
    `username=eq.${targetUsername}&network=eq.instagram&select=id,brand_name,username,account_type`
  );

  if (accounts.length === 0) {
    console.error(`   ❌ No se encontró @${targetUsername} en la tabla accounts`);
    console.error("   Ejecuta primero la migración 000_full_setup.sql en Supabase SQL Editor");
    process.exit(1);
  }

  const account = accounts[0];
  console.log(`   ✅ Encontrada: ${account.brand_name} (@${account.username}) [${account.account_type}]`);

  // 2. Registrar el scrape run
  console.log("\n2️⃣  Registrando scrape run...");
  const [scrapeRun] = await supabasePost("scrape_runs", {
    run_type: "profile_validation",
    network: "instagram",
    status: "running",
    metadata: { target: targetUsername, validation: true },
  });
  console.log(`   ✅ Run ID: ${scrapeRun.id}`);

  // 3. Ejecutar Apify
  console.log("\n3️⃣  Scrapeando Instagram con Apify...");
  try {
    const results = await runApifyActor("apify~instagram-profile-scraper", {
      usernames: [targetUsername],
      resultsLimit: 1,
    });

    if (!results || results.length === 0) {
      throw new Error("Apify devolvió 0 resultados");
    }

    const profile = results[0];
    console.log(`   ✅ Perfil obtenido:`);
    console.log(`      Nombre: ${profile.fullName || profile.username}`);
    console.log(`      Seguidores: ${(profile.followersCount || 0).toLocaleString()}`);
    console.log(`      Siguiendo: ${(profile.followsCount || 0).toLocaleString()}`);
    console.log(`      Posts: ${(profile.postsCount || 0).toLocaleString()}`);
    console.log(`      Bio: ${(profile.biography || "").slice(0, 80)}`);
    console.log(`      Verificado: ${profile.verified ? "Sí" : "No"}`);

    // 4. Guardar snapshot en Supabase
    console.log("\n4️⃣  Guardando snapshot en Supabase...");
    const today = new Date().toISOString().split("T")[0];

    const [snapshot] = await supabaseUpsert("account_snapshots", {
      account_id: account.id,
      followers: profile.followersCount || 0,
      following: profile.followsCount || 0,
      total_posts: profile.postsCount || 0,
      snapshot_date: today,
      raw_data: {
        fullName: profile.fullName,
        biography: profile.biography,
        verified: profile.verified,
        profilePicUrl: profile.profilePicUrl,
        externalUrl: profile.externalUrl,
        isBusinessAccount: profile.isBusinessAccount,
        businessCategory: profile.businessCategoryName,
      },
    });
    console.log(`   ✅ Snapshot guardado: ${snapshot.id} (fecha: ${today})`);

    // 5. Actualizar scrape run
    await supabaseUpsert("scrape_runs", {
      id: scrapeRun.id,
      status: "completed",
      completed_at: new Date().toISOString(),
      accounts_processed: 1,
      apify_run_id: "validation",
    });

    // 6. Verificar lectura
    console.log("\n5️⃣  Verificando lectura desde Supabase...");
    const snapshots = await supabaseGet(
      "account_snapshots",
      `account_id=eq.${account.id}&order=snapshot_date.desc&limit=1&select=*`
    );

    if (snapshots.length > 0) {
      const s = snapshots[0];
      console.log(`   ✅ Último snapshot:`);
      console.log(`      Fecha: ${s.snapshot_date}`);
      console.log(`      Seguidores: ${(s.followers || 0).toLocaleString()}`);
      console.log(`      Posts: ${s.total_posts || 0}`);
    }

    console.log("\n✅ VALIDACIÓN EXITOSA");
    console.log("   Apify → Supabase funciona correctamente");
    console.log(`   Cuenta: @${targetUsername}`);
    console.log(`   Seguidores reales: ${(profile.followersCount || 0).toLocaleString()}`);

  } catch (err) {
    console.error(`\n❌ Error en scraping: ${err.message}`);

    await supabaseUpsert("scrape_runs", {
      id: scrapeRun.id,
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: err.message,
    });

    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
