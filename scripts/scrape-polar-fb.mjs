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

const FB_ACCOUNTS = [
  { slug: "HarinaPANColombia", brand: "P.A.N.", type: "own" },
  { slug: "AlimentosPolarColombia", brand: "Alimentos Polar", type: "own" },
  { slug: "alimentosdoria", brand: "Doria", type: "comp-pasta" },
  { slug: "PastasLamunecaOficial", brand: "La Muñeca", type: "comp-pasta" },
  { slug: "productoscomarrico", brand: "Comarrico", type: "comp-pasta" },
  { slug: "AtunVanCamps", brand: "Van Camp's", type: "comp-atun" },
  { slug: "AlimentosZenu", brand: "Zenú", type: "comp-atun" },
  { slug: "lasoberanacol", brand: "La Soberana", type: "comp-atun" },
  { slug: "atunisabelcolombia", brand: "Isabel", type: "comp-atun" },
  { slug: "atunlaespanola", brand: "La Española", type: "comp-atun" },
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
  console.log(`\n🚀 Scraping Facebook Polar — ${new Date().toISOString().split("T")[0]}`);
  console.log(`   Paso: ${step}\n`);

  // ── STEP 1: Facebook Pages ──
  if (step === "all" || step === "pages") {
    console.log("═══ PASO 1: Páginas de Facebook ═══");
    const startUrls = FB_ACCOUNTS.map(a => ({ url: `https://www.facebook.com/${a.slug}/` }));
    const pages = await runActor("apify~facebook-pages-scraper", {
      startUrls,
    }, `${startUrls.length} páginas FB`);

    const enriched = pages.map(p => {
      const pageUrl = (p.url || p.facebookUrl || "").toLowerCase();
      const match = FB_ACCOUNTS.find(a =>
        pageUrl.includes(a.slug.toLowerCase())
      );
      return { ...p, _brand: match?.brand || null, _type: match?.type || null };
    });

    writeFileSync(resolve(OUT, "fb-pages.json"), JSON.stringify(enriched, null, 2));
    console.log(`\n   Guardado: data/scraped/polar/fb-pages.json`);

    console.log("\n   Resumen de páginas:");
    for (const p of enriched) {
      const likes = p.likes || p.likesCount || 0;
      const followers = p.followers || p.followersCount || 0;
      console.log(`   ${(p._brand || "?").padEnd(20)} ${followers.toLocaleString().padStart(10)} seg | ${likes.toLocaleString().padStart(10)} likes | ${p.title || p.name || "?"}`);
    }
  }

  // ── STEP 2: Facebook Posts ──
  if (step === "all" || step === "posts") {
    console.log("\n═══ PASO 2: Posts de Facebook (últimos 20 por página) ═══");
    const allPosts = [];

    for (const account of FB_ACCOUNTS) {
      try {
        const posts = await runActor("apify~facebook-posts-scraper", {
          startUrls: [{ url: `https://www.facebook.com/${account.slug}/` }],
          resultsLimit: 20,
        }, `${account.brand} (fb/${account.slug})`);

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

    writeFileSync(resolve(OUT, "fb-posts.json"), JSON.stringify(allPosts, null, 2));
    console.log(`\n   Guardado: data/scraped/polar/fb-posts.json (${allPosts.length} posts)`);

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

  console.log(`\n💰 Costo total FB: $${totalCost.toFixed(4)}`);
  console.log("✅ Scraping Facebook completado\n");
}

main().catch(err => {
  console.error("Error fatal:", err);
  console.log(`💰 Costo acumulado antes del error: $${totalCost.toFixed(4)}`);
  process.exit(1);
});
