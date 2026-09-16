#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getEnv } from "./load-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = getEnv("APIFY_API_TOKEN");
if (!TOKEN) { console.error("Missing APIFY_API_TOKEN"); process.exit(1); }

const OUT = resolve(__dirname, "..", "data", "scraped", "polar");
mkdirSync(OUT, { recursive: true });

const IG_ACCOUNTS = [
  { username: "harinapancolombia", brand: "P.A.N.", type: "own" },
  { username: "alimentospolarcolombia", brand: "Alimentos Polar", type: "own" },
  { username: "alimentosdoria", brand: "Doria", type: "comp-pasta" },
  { username: "pastaslamuneca", brand: "La Muñeca", type: "comp-pasta" },
  { username: "productoscomarrico", brand: "Comarrico", type: "comp-pasta" },
  { username: "pugliesepastas", brand: "Pugliese", type: "comp-pasta" },
  { username: "atunvancamps", brand: "Van Camp's", type: "comp-atun" },
  { username: "zenuoficial", brand: "Zenú", type: "comp-atun" },
  { username: "lasoberanacol", brand: "La Soberana", type: "comp-atun" },
  { username: "atunisabelcol", brand: "Isabel", type: "comp-atun" },
  { username: "la_espanola_comoninguna", brand: "La Española", type: "comp-atun" },
];

let totalCost = 0;

async function runActor(actorId, input, label) {
  console.log(`\n⏳ ${label}...`);
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Start failed: ${res.status} ${await res.text()}`);
  const run = await res.json();
  const runId = run.data.id;
  console.log(`   Run ID: ${runId}`);

  let status = run.data.status;
  let elapsed = 0;
  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 5000));
    elapsed += 5;
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`);
    const d = await check.json();
    status = d.data.status;
    const cost = d.data.usageTotalUsd || 0;
    process.stdout.write(`   ${status} | ${elapsed}s | $${cost.toFixed(4)}\r`);
  }

  const runInfo = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`);
  const runData = await runInfo.json();
  const cost = runData.data.usageTotalUsd || 0;
  totalCost += cost;

  if (status !== "SUCCEEDED") {
    console.log(`   ❌ ${status} | $${cost.toFixed(4)}          `);
    return [];
  }

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${TOKEN}`);
  const items = await dataRes.json();
  console.log(`   ✅ ${items.length} items | $${cost.toFixed(4)}          `);
  return items;
}

async function main() {
  const step = process.argv[2] || "all";
  console.log(`\n🚀 Scraping Polar — ${new Date().toISOString().split("T")[0]}`);
  console.log(`   Paso: ${step}\n`);

  // ── STEP 1: Instagram Profiles ──
  if (step === "all" || step === "profiles") {
    console.log("═══ PASO 1: Perfiles de Instagram ═══");
    const usernames = IG_ACCOUNTS.map(a => a.username);
    const profiles = await runActor("apify~instagram-profile-scraper", {
      usernames,
    }, `${usernames.length} perfiles IG`);

    const enriched = profiles.map(p => {
      const match = IG_ACCOUNTS.find(a =>
        a.username.toLowerCase() === (p.username || "").toLowerCase()
      );
      return { ...p, _brand: match?.brand, _type: match?.type };
    });

    writeFileSync(resolve(OUT, "ig-profiles.json"), JSON.stringify(enriched, null, 2));
    console.log(`\n   Guardado: data/scraped/polar/ig-profiles.json`);

    console.log("\n   Resumen de perfiles:");
    for (const p of enriched) {
      console.log(`   ${(p._brand || p.username).padEnd(20)} @${(p.username || "?").padEnd(28)} ${(p.followersCount || 0).toLocaleString().padStart(8)} seg | ${(p.postsCount || 0).toLocaleString().padStart(5)} posts`);
    }
  }

  // ── STEP 2: Instagram Posts ──
  if (step === "all" || step === "posts") {
    console.log("\n═══ PASO 2: Posts de Instagram (últimos 20 por cuenta) ═══");
    const allPosts = [];

    for (const account of IG_ACCOUNTS) {
      try {
        const posts = await runActor("apify~instagram-post-scraper", {
          username: [account.username],
          resultsLimit: 20,
        }, `${account.brand} (@${account.username})`);

        const enriched = posts.map(p => ({
          ...p,
          _brand: account.brand,
          _type: account.type,
        }));
        allPosts.push(...enriched);
      } catch (err) {
        console.log(`   ⚠️ Error en ${account.brand}: ${err.message}`);
      }
    }

    writeFileSync(resolve(OUT, "ig-posts.json"), JSON.stringify(allPosts, null, 2));
    console.log(`\n   Guardado: data/scraped/polar/ig-posts.json (${allPosts.length} posts)`);

    const byBrand = {};
    for (const p of allPosts) {
      const b = p._brand || "?";
      byBrand[b] = (byBrand[b] || 0) + 1;
    }
    console.log("\n   Posts por marca:");
    for (const [brand, count] of Object.entries(byBrand)) {
      console.log(`   ${brand.padEnd(20)} ${count} posts`);
    }
  }

  console.log(`\n💰 Costo total acumulado: $${totalCost.toFixed(4)}`);
  console.log("✅ Scraping completado\n");
}

main().catch(err => {
  console.error("Error fatal:", err);
  console.log(`💰 Costo acumulado antes del error: $${totalCost.toFixed(4)}`);
  process.exit(1);
});
