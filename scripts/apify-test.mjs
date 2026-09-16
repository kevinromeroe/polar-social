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

async function runActor(actorId, input) {
  console.log(`Running ${actorId}...`);
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Start failed: ${res.status} ${await res.text()}`);
  const run = await res.json();
  const runId = run.data.id;
  console.log(`  Run ${runId} started`);

  let status = run.data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`);
    const d = await check.json();
    status = d.data.status;
    const cost = d.data.usageTotalUsd || 0;
    process.stdout.write(`  Status: ${status} | Cost: $${cost.toFixed(4)}\r`);
  }
  console.log(`  Final: ${status}                    `);

  if (status !== "SUCCEEDED") throw new Error(`Run ${runId}: ${status}`);

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${TOKEN}`);
  const items = await dataRes.json();

  const runInfo = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`);
  const runData = await runInfo.json();
  const cost = runData.data.usageTotalUsd || 0;
  console.log(`  Items: ${items.length} | Final cost: $${cost.toFixed(4)}`);
  return { items, cost };
}

const outDir = resolve(__dirname, "..", "data", "scraped");
mkdirSync(outDir, { recursive: true });

console.log("\n=== Test: Instagram Profile Scraper ===");
const { items: profiles, cost: c1 } = await runActor("apify~instagram-profile-scraper", {
  usernames: ["havolinecolombia"],
});

if (profiles.length > 0) {
  const p = profiles[0];
  console.log(`\n  @${p.username}`);
  console.log(`  Followers: ${(p.followersCount||0).toLocaleString()}`);
  console.log(`  Posts: ${p.postsCount||0}`);
  console.log(`  Bio: ${(p.biography||"").slice(0,100)}`);
}

writeFileSync(resolve(outDir, "test-profile.json"), JSON.stringify(profiles, null, 2));
console.log(`\nSaved to data/scraped/test-profile.json`);
console.log(`Total cost: $${c1.toFixed(4)}`);
