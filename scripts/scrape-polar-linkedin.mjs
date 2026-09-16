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

const LI_COMPANIES = [
  { slug: "alimentos-polar-colombia", brand: "P.A.N.", type: "own" },
  { slug: "nutresa", brand: "Grupo Nutresa", type: "parent-comp" },
  { slug: "productos-alimenticios-doria-s-a-s-", brand: "Doria", type: "comp-pasta" },
  { slug: "harinera-del-valle-s-a-", brand: "Harinera del Valle", type: "parent-comp" },
  { slug: "industria-de-alimentos-zenu-s.a.", brand: "Zenú", type: "comp-atun" },
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
  console.log(`\n🚀 Scraping LinkedIn Polar — ${new Date().toISOString().split("T")[0]}`);

  // ── Company profiles ──
  console.log("═══ Páginas de empresa LinkedIn ═══");
  const startUrls = LI_COMPANIES.map(c => ({ url: `https://www.linkedin.com/company/${c.slug}/` }));

  const urls = LI_COMPANIES.map(c => `https://www.linkedin.com/company/${c.slug}/`);
  const profiles = await runActor("harvestapi~linkedin-company", {
    urls,
  }, `${LI_COMPANIES.length} empresas LinkedIn`);

  const enriched = profiles.map(p => {
    const url = (p.url || p.linkedInUrl || "").toLowerCase();
    const match = LI_COMPANIES.find(c => url.includes(c.slug.toLowerCase()));
    return { ...p, _brand: match?.brand || null, _type: match?.type || null };
  });

  writeFileSync(resolve(OUT, "li-companies.json"), JSON.stringify(enriched, null, 2));
  console.log(`\n   Guardado: data/scraped/polar/li-companies.json`);

  console.log("\n   Resumen de empresas:");
  for (const p of enriched) {
    const followers = p.followerCount || p.followersCount || 0;
    const employees = p.staffCount || p.employeesOnLinkedIn || 0;
    console.log(`   ${(p._brand || "?").padEnd(20)} ${followers.toLocaleString().padStart(10)} seg | ${employees.toLocaleString().padStart(6)} empleados | ${p.name || "?"}`);
  }

  console.log(`\n💰 Costo total LinkedIn: $${totalCost.toFixed(4)}`);
  console.log("✅ Scraping LinkedIn completado\n");
}

main().catch(err => {
  console.error("Error fatal:", err);
  console.log(`💰 Costo acumulado antes del error: $${totalCost.toFixed(4)}`);
  process.exit(1);
});
