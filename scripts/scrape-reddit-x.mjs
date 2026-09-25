#!/usr/bin/env node
/**
 * Scrape Reddit y X para P.A.N. (Pasta y Atún)
 * Busca comentarios/menciones sobre harina PAN, arepas, atún PAN
 * Filtra a Colombia / español
 * Guarda en Supabase: posts + comments
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const APIFY_TOKEN = env.APIFY_API_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const today = new Date().toISOString().split("T")[0];

// ── Supabase helpers ──
async function sbGet(table, params = "") {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const part of params.split("&")) {
    const [k, ...rest] = part.split("=");
    if (k) url.searchParams.set(k, rest.join("="));
  }
  const res = await fetch(url.toString(), {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${table}: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function sbInsert(table, data) {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return [];
  // Insert in batches of 100
  const results = [];
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  UPSERT ${table} batch ${i}: ${res.status} ${text.slice(0, 200)}`);
      continue;
    }
    const result = await res.json();
    results.push(...result);
  }
  return results;
}

// ── Apify helpers ──
async function runApify(actorId, input) {
  console.log(`  Iniciando ${actorId}...`);
  const res = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify start ${actorId}: ${res.status} ${errText.slice(0, 300)}`);
  }
  const { data } = await res.json();
  const runId = data.id;

  let status = data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 5000));
    const check = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const checkData = await check.json();
    status = checkData.data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);

  if (status !== "SUCCEEDED") {
    const runInfo = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const info = await runInfo.json();
    console.error("  Run info:", JSON.stringify(info.data?.stats || {}).slice(0, 300));
    throw new Error(`Actor run ${status}`);
  }

  // Get cost
  const costRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  const costData = await costRes.json();
  console.log(`  Costo: $${costData.data?.usageTotalUsd?.toFixed(4) || "?"}`);

  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
  );
  return await dataRes.json();
}

// ── Colombia filter ──
const COLOMBIA_KEYWORDS = /colombia|bogot[áa]|medell[ií]n|cali|barranquilla|cartagena|bucaramanga|cucuta|pereira|manizales|arepa|empanada/i;
const BRAZIL_KEYWORDS = /brasil|brazil|são paulo|rio de janeiro|portuguese|português/i;

function isColombiaRelevant(text) {
  if (!text) return false;
  if (BRAZIL_KEYWORDS.test(text)) return false;
  return true; // Reddit/X con lang:es ya filtra bastante
}

// ── Ensure X account exists ──
async function ensureXAccount() {
  const existing = await sbGet("accounts", "brand_name=eq.P.A.N.&network=eq.x&select=id");
  if (existing.length > 0) {
    console.log("  Cuenta X de P.A.N. ya existe:", existing[0].id);
    return existing[0].id;
  }
  console.log("  Creando cuenta X para P.A.N...");
  const result = await sbInsert("accounts", {
    brand_name: "P.A.N.",
    network: "x",
    username: "search:harina PAN arepa atun",
    account_type: "own",
  });
  console.log("  Cuenta X creada:", result[0]?.id);
  return result[0]?.id;
}

// ── Reddit Scraping ──
async function scrapeReddit(redditAccountId) {
  console.log("\n=== REDDIT ===");

  const items = await runApify("trudax~reddit-scraper-lite", {
    startUrls: [
      { url: "https://www.reddit.com/r/Colombia/search/?q=harina+PAN+arepa" },
      { url: "https://www.reddit.com/r/Colombia/search/?q=at%C3%BAn+enlatado" },
      { url: "https://www.reddit.com/r/Colombia/search/?q=harina+precocida" },
      { url: "https://www.reddit.com/r/Colombia/search/?q=mercado+atun+lata" },
      { url: "https://www.reddit.com/r/asklatinamerica/search/?q=arepa+harina" },
    ],
    maxItems: 200,
  });

  console.log(`  Resultados Reddit: ${items.length}`);

  const posts = [];
  const comments = [];

  for (const item of items) {
    const text = item.title || item.body || item.text || "";
    if (!text || text.length < 5) continue;
    if (!isColombiaRelevant(text + " " + (item.communityName || ""))) continue;

    const isComment = item.dataType === "comment" || !!item.parentId;
    const publishedAt = item.createdAt || item.created_utc
      ? new Date((item.created_utc || 0) * 1000).toISOString()
      : item.createdAt || new Date().toISOString();

    if (isComment) {
      comments.push({
        text: text.slice(0, 2000),
        author_username: (item.author || item.username || "redditor").slice(0, 100),
        likes: item.score || item.ups || 0,
        published_at: publishedAt,
        network: "reddit",
        account_id: redditAccountId,
      });
    } else {
      const postUrl = item.url || (item.permalink ? `https://reddit.com${item.permalink}` : null);
      posts.push({
        caption: (text || "Sin título").slice(0, 2000),
        likes: item.score || item.numberOfVotes || 0,
        comments: item.numberOfComments || 0,
        shares: 0,
        views: 0,
        published_at: publishedAt,
        network: "reddit",
        post_url: postUrl,
        account_id: redditAccountId,
        raw_data: { subreddit: item.communityName, author: item.author },
      });
      comments.push({
        text: (text || "Sin título").slice(0, 2000),
        author_username: (item.author || item.username || "redditor").slice(0, 100),
        likes: item.score || item.numberOfVotes || 0,
        published_at: publishedAt,
        network: "reddit",
        account_id: redditAccountId,
      });
    }
  }

  console.log(`  Posts Reddit filtrados: ${posts.length}`);
  console.log(`  Comentarios Reddit filtrados: ${comments.length}`);

  if (posts.length > 0) {
    await sbInsert("posts", posts);
    console.log(`  ✓ ${posts.length} posts guardados`);
  }
  if (comments.length > 0) {
    await sbInsert("comments", comments);
    console.log(`  ✓ ${comments.length} comentarios guardados`);
  }

  return { posts: posts.length, comments: comments.length };
}

// ── X/Twitter Scraping ──
async function scrapeX(xAccountId) {
  console.log("\n=== X / TWITTER ===");

  const items = await runApify("apidojo~tweet-scraper", {
    searchTerms: [
      '"harina PAN" Colombia lang:es -filter:retweets',
      'arepa "harina precocida" Colombia lang:es -filter:retweets',
      '"atún en lata" Colombia lang:es -filter:retweets',
      '"atún enlatado" Colombia lang:es -filter:retweets',
      '"harina de maíz" Colombia arepa lang:es -filter:retweets',
    ],
    sort: "Top",
    tweetLanguage: "es",
    maxItems: 500,
  });

  console.log(`  Resultados X: ${items.length}`);

  const posts = [];
  const comments = [];

  for (const item of items) {
    const text = item.full_text || item.text || item.tweet_text || "";
    if (!text || text.length < 10) continue;
    if (BRAZIL_KEYWORDS.test(text)) continue;

    const publishedAt = item.created_at
      ? new Date(item.created_at).toISOString()
      : item.timestamp || new Date().toISOString();

    const username = item.user?.screen_name || item.author?.userName || item.screen_name || "usuario_x";
    const likes = item.favorite_count || item.likeCount || item.likes || 0;
    const retweets = item.retweet_count || item.retweetCount || 0;
    const replies = item.reply_count || item.replyCount || 0;
    const views = item.views || item.viewCount || 0;
    const tweetUrl = item.url || (item.id_str ? `https://x.com/${username}/status/${item.id_str}` : null);

    posts.push({
      caption: (text || "Tweet").slice(0, 2000),
      likes,
      comments: replies,
      shares: retweets,
      views,
      published_at: publishedAt,
      network: "x",
      post_url: tweetUrl,
      account_id: xAccountId,
      raw_data: { author: username, lang: item.lang },
    });

    comments.push({
      text: text.slice(0, 2000),
      author_username: username.slice(0, 100),
      likes,
      published_at: publishedAt,
      network: "x",
      account_id: xAccountId,
    });
  }

  console.log(`  Posts X filtrados: ${posts.length}`);
  console.log(`  Comentarios X filtrados: ${comments.length}`);

  if (posts.length > 0) {
    await sbInsert("posts", posts);
    console.log(`  ✓ ${posts.length} posts guardados`);
  }
  if (comments.length > 0) {
    await sbInsert("comments", comments);
    console.log(`  ✓ ${comments.length} comentarios guardados`);
  }

  return { posts: posts.length, comments: comments.length };
}

// ── Main ──
async function main() {
  console.log("=== Scrape Reddit + X para P.A.N. (Pasta & Atún) ===");
  console.log(`Fecha: ${today}`);
  console.log(`Presupuesto: $9 USD\n`);

  // Check Apify balance (only usage-based costs, not subscription)
  const usageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${APIFY_TOKEN}`);
  const usage = await usageRes.json();
  const usageBased = usage.data?.monthlyServiceUsage || {};
  const totalUsed = Object.values(usageBased)
    .reduce((sum, s) => sum + (s.amountAfterVolumeDiscountUsd || 0), 0);
  console.log(`Uso Apify (consumo) este ciclo: $${totalUsed.toFixed(2)}`);
  const startUsage = totalUsed;

  // Get P.A.N. accounts
  const panAccounts = await sbGet(
    "accounts",
    "brand_name=eq.P.A.N.&select=id,network,username"
  );

  const redditAccount = panAccounts.find(a => a.network === "reddit");
  if (!redditAccount) {
    throw new Error("No existe cuenta Reddit para P.A.N. en Supabase");
  }
  console.log(`Reddit account: ${redditAccount.id}`);

  // Ensure X account exists
  const xAccountId = await ensureXAccount();
  if (!xAccountId) throw new Error("No se pudo crear/encontrar cuenta X");

  // Run scrapers
  const maxBudgetIncremental = 9;

  const redditResult = await scrapeReddit(redditAccount.id);

  // Check incremental cost so far
  const midUsageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${APIFY_TOKEN}`);
  const midUsage = await midUsageRes.json();
  const midTotal = Object.values(midUsage.data?.monthlyServiceUsage || {})
    .reduce((sum, s) => sum + (s.amountAfterVolumeDiscountUsd || 0), 0);
  const midIncremental = midTotal - startUsage;
  console.log(`\nCosto incremental hasta ahora: $${midIncremental.toFixed(2)} (presupuesto: $${maxBudgetIncremental})`);

  let xResult = { posts: 0, comments: 0 };
  if (midIncremental > maxBudgetIncremental) {
    console.log("⚠️ Presupuesto excedido, saltando X");
  } else {
    xResult = await scrapeX(xAccountId);
    console.log(`\nResultados X: ${xResult.posts} posts, ${xResult.comments} comentarios`);
  }

  // Final cost check
  const finalUsageRes = await fetch(`https://api.apify.com/v2/users/me/usage/monthly?token=${APIFY_TOKEN}`);
  const finalUsage = await finalUsageRes.json();
  const finalTotal = Object.values(finalUsage.data?.monthlyServiceUsage || {})
    .reduce((sum, s) => sum + (s.amountAfterVolumeDiscountUsd || 0), 0);

  console.log("\n=== RESUMEN ===");
  console.log(`Reddit: ${redditResult.posts} posts, ${redditResult.comments} comentarios`);
  console.log(`X: ${xResult.posts} posts, ${xResult.comments} comentarios`);
  console.log(`Costo incremental total: $${(finalTotal - startUsage).toFixed(2)}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
