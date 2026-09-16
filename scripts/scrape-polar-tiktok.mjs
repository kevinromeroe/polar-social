#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "fs";
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
const TOKEN = env.APIFY_API_TOKEN;
if (!TOKEN) { console.error("Missing APIFY_API_TOKEN"); process.exit(1); }

const OUT = resolve(__dirname, "..", "data", "scraped", "polar");
mkdirSync(OUT, { recursive: true });

const TT_ACCOUNTS = [
  { username: "harinapancolombia", brand: "P.A.N.", type: "own" },
  { username: "elbambinodoria", brand: "Doria", type: "comp-pasta" },
  { username: "pastaslamuneca", brand: "La Muñeca", type: "comp-pasta" },
  { username: "atunvancampsco", brand: "Van Camp's", type: "comp-atun" },
  { username: "zenuoficial", brand: "Zenú", type: "comp-atun" },
  { username: "lasoberanacol", brand: "La Soberana", type: "comp-atun" },
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
  console.log(`\n🚀 Scraping TikTok Polar — ${new Date().toISOString().split("T")[0]}`);

  // ── Perfiles + videos en una sola corrida (20 posts por cuenta) ──
  console.log("═══ Perfiles y videos TikTok (20 por cuenta) ═══");
  const allVideos = [];

  for (const account of TT_ACCOUNTS) {
    try {
      const videos = await runActor("clockworks~free-tiktok-scraper", {
        profiles: [account.username],
        resultsPerPage: 20,
        shouldDownloadCovers: false,
        shouldDownloadVideos: false,
      }, `${account.brand} (@${account.username})`);

      const enriched = videos.map(v => ({
        ...v,
        _brand: account.brand,
        _type: account.type,
      }));
      allVideos.push(...enriched);
    } catch (err) {
      console.log(`   ⚠️ Error en ${account.brand}: ${err.message}`);
    }
  }

  writeFileSync(resolve(OUT, "tt-videos.json"), JSON.stringify(allVideos, null, 2));
  console.log(`\n   Guardado: data/scraped/polar/tt-videos.json (${allVideos.length} videos)`);

  const byBrand = {};
  for (const v of allVideos) {
    const b = v._brand || "?";
    byBrand[b] = (byBrand[b] || 0) + 1;
  }
  console.log("\n   Videos por marca:");
  for (const [brand, count] of Object.entries(byBrand)) {
    console.log(`   ${brand.padEnd(20)} ${count} videos`);
  }

  console.log(`\n💰 Costo total TikTok: $${totalCost.toFixed(4)}`);
  console.log("✅ Scraping TikTok completado\n");
}

main().catch(err => {
  console.error("Error fatal:", err);
  console.log(`💰 Costo acumulado antes del error: $${totalCost.toFixed(4)}`);
  process.exit(1);
});
