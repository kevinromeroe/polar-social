#!/usr/bin/env node
/**
 * Scraping completo — todas las cuentas de un cliente, todas las redes
 *
 * Uso:
 *   node scripts/scrape-all.mjs              # Scrapea todos los clientes
 *   node scripts/scrape-all.mjs --client polar    # Solo Polar
 *   node scripts/scrape-all.mjs --client havoline # Solo Havoline
 *   node scripts/scrape-all.mjs --network instagram # Solo Instagram
 *
 * Requiere en .env.local:
 *   APIFY_API_TOKEN
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { getEnv } from "./load-env.mjs";

const APIFY_TOKEN = getEnv("APIFY_API_TOKEN");
const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!APIFY_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Faltan variables de entorno (APIFY_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

// ── Args ──
const args = process.argv.slice(2);
const clientFilter = args.includes("--client") ? args[args.indexOf("--client") + 1] : null;
const networkFilter = args.includes("--network") ? args[args.indexOf("--network") + 1] : null;

// ── Apify actors por red ──
const ACTORS = {
  instagram: "apify~instagram-profile-scraper",
  facebook: "apify~facebook-pages-scraper",
  tiktok: "clockworks~free-tiktok-scraper",
  x: "apidojo~tweet-scraper",
  linkedin: "anchor~linkedin-company-scraper",
};

// ── Supabase helpers ──
async function supabaseGet(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`GET ${table}: ${res.status}`);
  return res.json();
}

async function supabasePost(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseUpsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`UPSERT ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Apify runner ──
async function runApifyActor(actorId, input) {
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify ${actorId}: ${res.status} ${await res.text()}`);

  const run = await res.json();
  const runId = run.data.id;

  let status = run.data.status;
  let attempts = 0;
  while (status === "RUNNING" || status === "READY") {
    if (++attempts > 120) throw new Error("Timeout (10 min)");
    await new Promise((r) => setTimeout(r, 5000));
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    status = (await check.json()).data.status;
  }

  if (status !== "SUCCEEDED") throw new Error(`Run ${runId}: ${status}`);

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`);
  return { items: await dataRes.json(), runId };
}

// ── Procesadores por red ──
function processInstagram(profile) {
  return {
    followers: profile.followersCount || 0,
    following: profile.followsCount || 0,
    total_posts: profile.postsCount || 0,
    raw_data: {
      fullName: profile.fullName,
      biography: profile.biography,
      verified: profile.verified,
      isBusinessAccount: profile.isBusinessAccount,
      businessCategory: profile.businessCategoryName,
      profilePicUrl: profile.profilePicUrl,
    },
  };
}

function processFacebook(page) {
  return {
    followers: page.likes || page.followersCount || 0,
    following: 0,
    total_posts: page.postsCount || 0,
    raw_data: {
      name: page.name,
      categories: page.categories,
      address: page.address,
      phone: page.phone,
      website: page.website,
      rating: page.overallStarRating,
    },
  };
}

function processTikTok(user) {
  return {
    followers: user.authorMeta?.fans || user.followersCount || 0,
    following: user.authorMeta?.following || 0,
    total_posts: user.authorMeta?.video || user.postsCount || 0,
    raw_data: {
      nickname: user.authorMeta?.nickName || user.nickname,
      verified: user.authorMeta?.verified,
      hearts: user.authorMeta?.heart,
      digg: user.authorMeta?.digg,
    },
  };
}

function processX(data) {
  return {
    followers: data.user?.followers_count || data.followersCount || 0,
    following: data.user?.friends_count || data.followingCount || 0,
    total_posts: data.user?.statuses_count || 0,
    raw_data: {
      name: data.user?.name,
      verified: data.user?.verified,
      description: data.user?.description,
    },
  };
}

function processLinkedIn(company) {
  return {
    followers: company.followersCount || 0,
    following: 0,
    total_posts: 0,
    raw_data: {
      name: company.name,
      industry: company.industry,
      size: company.companySize,
      headquarters: company.headquarters,
      website: company.website,
    },
  };
}

const PROCESSORS = { instagram: processInstagram, facebook: processFacebook, tiktok: processTikTok, x: processX, linkedin: processLinkedIn };

// ── Input builders por red ──
function buildInput(network, usernames) {
  switch (network) {
    case "instagram":
      return { usernames, resultsLimit: 1 };
    case "facebook":
      return { startUrls: usernames.map((u) => ({ url: `https://www.facebook.com/${u}` })), maxPages: usernames.length };
    case "tiktok":
      return { profiles: usernames.map((u) => `https://www.tiktok.com/@${u}`), resultsPerPage: 0, shouldDownloadVideos: false };
    case "x":
      return { startUrls: usernames.map((u) => ({ url: `https://x.com/${u}` })), maxTweets: 0, mode: "profile" };
    case "linkedin":
      return { startUrls: usernames.map((u) => ({ url: `https://www.linkedin.com/company/${u}` })), maxPages: usernames.length };
    default:
      return {};
  }
}

// ── Main ──
async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n🚀 Scraping completo — ${today}`);
  if (clientFilter) console.log(`   Cliente: ${clientFilter}`);
  if (networkFilter) console.log(`   Red: ${networkFilter}`);

  // Obtener cuentas
  let query = "is_active=eq.true&select=id,brand_name,network,account_type,username";
  if (networkFilter) query += `&network=eq.${networkFilter}`;
  const accounts = await supabaseGet("accounts", query);

  // Filtrar por cliente si aplica
  let filteredAccounts = accounts;
  if (clientFilter) {
    try {
      const clients = await supabaseGet("clients", `slug=eq.${clientFilter}&select=id`);
      if (clients.length === 0) {
        console.error(`❌ Cliente "${clientFilter}" no encontrado`);
        process.exit(1);
      }
      const clientId = clients[0].id;
      filteredAccounts = accounts.filter((a) => a.client_id === clientId);
    } catch {
      // La tabla clients no existe — usar todas las cuentas
      console.log(`   ⚠️  Tabla "clients" no disponible, usando todas las cuentas`);
      filteredAccounts = accounts;
    }
  }

  console.log(`   Cuentas a scrapear: ${filteredAccounts.length}\n`);

  // Agrupar por red
  const byNetwork = {};
  for (const acc of filteredAccounts) {
    if (!byNetwork[acc.network]) byNetwork[acc.network] = [];
    byNetwork[acc.network].push(acc);
  }

  let totalProcessed = 0;
  let totalErrors = 0;

  for (const [network, netAccounts] of Object.entries(byNetwork)) {
    const actorId = ACTORS[network];
    if (!actorId) {
      console.log(`⏭️  ${network}: sin actor configurado`);
      continue;
    }

    console.log(`\n📡 ${network.toUpperCase()} — ${netAccounts.length} cuentas`);

    // Registrar run
    const [run] = await supabasePost("scrape_runs", {
      run_type: "scheduled",
      network,
      status: "running",
      metadata: { client: clientFilter || "all", date: today },
    });

    try {
      const usernames = netAccounts.map((a) => a.username);
      const input = buildInput(network, usernames);
      const { items, runId } = await runApifyActor(actorId, input);

      console.log(`   Resultados: ${items.length}`);
      const processor = PROCESSORS[network];

      for (const item of items) {
        try {
          const snapshot = processor(item);
          const username =
            item.username ||
            item.authorMeta?.name ||
            item.user?.screen_name ||
            item.handle ||
            "";
          const account = netAccounts.find(
            (a) => a.username.toLowerCase() === username.toLowerCase()
          );

          if (!account) {
            console.log(`   ⚠️  No se encontró cuenta para @${username}`);
            continue;
          }

          await supabaseUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            ...snapshot,
          });

          console.log(`   ✅ ${account.brand_name} (@${account.username}): ${(snapshot.followers || 0).toLocaleString()} seguidores`);
          totalProcessed++;
        } catch (err) {
          console.log(`   ❌ Error procesando item: ${err.message}`);
          totalErrors++;
        }
      }

      await supabaseUpsert("scrape_runs", {
        id: run.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        accounts_processed: items.length,
        apify_run_id: runId,
      });
    } catch (err) {
      console.error(`   ❌ Error en ${network}: ${err.message}`);
      totalErrors++;

      await supabaseUpsert("scrape_runs", {
        id: run.id,
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err.message,
      });
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Procesadas: ${totalProcessed}`);
  console.log(`   Errores: ${totalErrors}`);
  console.log(`   Fecha snapshot: ${today}`);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
