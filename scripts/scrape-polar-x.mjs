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

const X_ACCOUNTS = [
  { handle: "AlimentosDoria", brand: "Doria", type: "comp-pasta" },
  { handle: "atunvancamps", brand: "Van Camp's", type: "comp-atun" },
  { handle: "AlimentosZenu", brand: "Zenú", type: "comp-atun" },
  { handle: "AtunIsabelCol", brand: "Isabel", type: "comp-atun" },
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
  console.log(`\n🚀 Scraping X/Twitter tweets — ${new Date().toISOString().split("T")[0]}`);

  const allTweets = [];

  for (const account of X_ACCOUNTS) {
    try {
      const tweets = await runActor("apidojo~twitter-scraper-lite", {
        handles: [account.handle],
        tweetsDesired: 15,
        proxyConfig: { useApifyProxy: true },
      }, `${account.brand} (@${account.handle})`);

      // Show first result fields for debugging
      if (tweets.length > 0) {
        const keys = Object.keys(tweets[0]).filter(k => !k.startsWith('_')).slice(0, 10);
        console.log(`   Fields: ${keys.join(', ')}`);
      }

      const enriched = tweets.map(t => ({
        ...t,
        _brand: account.brand,
        _type: account.type,
      }));
      allTweets.push(...enriched);
    } catch (err) {
      console.log(`   ⚠️ Error en ${account.brand}: ${err.message}`);
    }
  }

  writeFileSync(resolve(OUT, "x-tweets.json"), JSON.stringify(allTweets, null, 2));
  console.log(`\n   Guardado: data/scraped/polar/x-tweets.json (${allTweets.length} tweets)`);

  const byBrand = {};
  for (const t of allTweets) {
    const b = t._brand || "?";
    byBrand[b] = (byBrand[b] || 0) + 1;
  }
  console.log("\n   Tweets por marca:");
  for (const [brand, count] of Object.entries(byBrand)) {
    console.log(`   ${brand.padEnd(20)} ${count} tweets`);
  }

  console.log(`\n💰 Costo total X: $${totalCost.toFixed(4)}`);
  console.log("✅ Scraping X completado\n");
}

main().catch(err => {
  console.error("Error fatal:", err);
  console.log(`💰 Costo acumulado antes del error: $${totalCost.toFixed(4)}`);
  process.exit(1);
});
