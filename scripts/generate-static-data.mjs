#!/usr/bin/env node
/**
 * Genera datos estáticos desde Supabase para precarga en build time.
 * Se ejecuta durante CI (GitHub Actions) ANTES de `next build`.
 * El resultado se guarda en public/data/real-data.json.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  try {
    const envContent = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of envContent.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const k = m[1].trim(), v = m[2].trim();
        if (k === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = v;
        if (k === "NEXT_PUBLIC_SUPABASE_ANON_KEY") SUPABASE_ANON_KEY = v;
      }
    }
  } catch { /* .env.local not found — use env vars */ }
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY requeridos");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

async function fetchAll(table, columns) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) { console.warn(`fetchAll ${table}:`, error.message); break; }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

const HTML_ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'", "&#x27;": "'", "&#x2F;": "/" };
function cleanText(raw) {
  let t = raw;
  t = t.replace(/&#32;/g, " ");
  t = t.replace(/&#x200B;/g, "");
  t = t.replace(/&(amp|lt|gt|quot|#39|#x27|#x2F);/g, (m) => HTML_ENTITIES[m] || m);
  t = t.replace(/&#\d+;/g, (m) => { const code = parseInt(m.slice(2, -1)); return code > 0 && code < 65536 ? String.fromCharCode(code) : ""; });
  t = t.replace(/\s*submitted by\s+\/u\/\S+/gi, "");
  t = t.replace(/\s*\[link\]/gi, "");
  t = t.replace(/\s*\[comments?\]/gi, "");
  t = t.replace(/https?:\/\/\S+/g, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

const RELEVANCE_KEYWORDS = /harina|arepa|pan\b|maíz|maiz|atún|atun|pasta|polar|p\.a\.n|comida|cocina|receta|desayuno|almuerzo|cena|alimento|colombia|bogot|medell|cali\b|barranquilla|empanada|buñuelo|mascotas|perro|gato|donkan|mirringo|chunky|cat chow|dog chow|purina|ringo/i;

const EXCLUDE_VENEZUELA = /venezuel|vzla|caracas|maracaibo|maracay|en venezuela|desde venezuela/i;

function extractFbImage(raw) {
  if (!raw?.media || !Array.isArray(raw.media)) return undefined;
  for (const m of raw.media) {
    if (m.image?.uri) return m.image.uri;
    if (m.thumbnail) return m.thumbnail;
  }
  return undefined;
}

const MONTH_LABELS = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

console.log("Generando datos estáticos desde Supabase...\n");
const t0 = Date.now();

const accountsRaw = await sb.from("accounts").select("id, brand_name, account_type, product_line, network, username");
const accountMap = {};
if (accountsRaw.data) for (const a of accountsRaw.data) accountMap[a.id] = a;
console.log(`Cuentas: ${accountsRaw.data?.length || 0}`);

const lightComments = await fetchAll("comments", "account_id, network, published_at, sentiment");
console.log(`Comentarios (ligero): ${lightComments.length}`);

const allAccounts = Object.values(accountMap);
const mascotasIds = allAccounts.filter(a => a.product_line === "mascotas").map(a => a.id);
const alimentosIds = allAccounts.filter(a => a.product_line !== "mascotas").map(a => a.id);

const feedQueries = [];
for (const ids of [alimentosIds, mascotasIds]) {
  for (const sent of ["positive", "negative", "neutral"]) {
    feedQueries.push(
      sb.from("comments").select("id, text, author_username, likes, published_at, network, account_id, sentiment")
        .eq("sentiment", sent).in("account_id", ids).order("likes", { ascending: false }).limit(50)
    );
  }
}
const feedResults = await Promise.all(feedQueries);
const feedComments = feedResults.flatMap(r => r.data || []);
console.log(`Feed comments: ${feedComments.length} (alimentos + mascotas separados)`);

const [allPosts, snapshotsRaw] = await Promise.all([
  fetchAll("posts", "id, caption, likes, comments, shares, views, published_at, network, post_url, account_id"),
  sb.from("account_snapshots").select("account_id, followers, following, total_posts, snapshot_date").order("snapshot_date", { ascending: false }),
]);
console.log(`Posts: ${allPosts.length}`);
console.log(`Snapshots: ${snapshotsRaw.data?.length || 0}`);

// --- MENTIONS (feed) ---
const mentions = feedComments
  .filter(c => {
    if (!c.text || c.text.length < 4) return false;
    if (EXCLUDE_VENEZUELA.test(c.text)) return false;
    if (c.network === "reddit" || c.network === "x") return RELEVANCE_KEYWORDS.test(c.text);
    return true;
  })
  .map((c, i) => {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    return {
      id: i + 1,
      brand: acc?.brand_name || "Desconocido",
      network: c.network || "instagram",
      author: `@${c.author_username || "usuario"}`,
      text: cleanText(c.text),
      sentiment: c.sentiment || "neutral",
      date: c.published_at?.split("T")[0] || "2026-09-01",
      likes: c.likes || 0,
      productLine: acc?.product_line || undefined,
    };
  });

// --- AGGREGATES ---
const netCounts = {};
for (const c of lightComments) {
  const net = c.network || "unknown";
  netCounts[net] = (netCounts[net] || 0) + 1;
}
const netTotal = Object.values(netCounts).reduce((s, n) => s + n, 0);
const mentionsByNetwork = Object.entries(netCounts)
  .map(([network, cnt]) => ({ network, mentions: cnt, percentage: netTotal > 0 ? Number(((cnt / netTotal) * 100).toFixed(1)) : 0 }))
  .sort((a, b) => b.mentions - a.mentions);

const sentiments = {};
for (const c of lightComments) {
  const acc = c.account_id ? accountMap[c.account_id] : null;
  const brand = acc?.brand_name || "Otro";
  if (!sentiments[brand]) sentiments[brand] = { positive: 0, neutral: 0, negative: 0 };
  const s = c.sentiment || "neutral";
  if (s === "positive") sentiments[brand].positive++;
  else if (s === "negative") sentiments[brand].negative++;
  else sentiments[brand].neutral++;
}
const sentimentByBrand = Object.entries(sentiments)
  .map(([brand, s]) => {
    const total = s.positive + s.neutral + s.negative;
    return { brand, positive: total > 0 ? Math.round((s.positive / total) * 100) : 0, neutral: total > 0 ? Math.round((s.neutral / total) * 100) : 0, negative: total > 0 ? Math.round((s.negative / total) * 100) : 0 };
  })
  .sort((a, b) => (b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative));

const sovCounts = {};
for (const c of lightComments) {
  const acc = c.account_id ? accountMap[c.account_id] : null;
  const brand = acc?.brand_name || "Otro";
  sovCounts[brand] = (sovCounts[brand] || 0) + 1;
}
const sovTotal = Object.values(sovCounts).reduce((s, n) => s + n, 0);
const sovData = Object.entries(sovCounts)
  .map(([brand, cnt]) => ({ brand, mentions: cnt, percentage: sovTotal > 0 ? Number(((cnt / sovTotal) * 100).toFixed(1)) : 0 }))
  .sort((a, b) => b.mentions - a.mentions);

const sovNetCounts = {};
for (const c of lightComments) {
  const acc = c.account_id ? accountMap[c.account_id] : null;
  const brand = acc?.brand_name || "Otro";
  const net = c.network || "unknown";
  if (!sovNetCounts[net]) sovNetCounts[net] = {};
  sovNetCounts[net][brand] = (sovNetCounts[net][brand] || 0) + 1;
}
const sovByNetwork = {};
for (const [net, brands] of Object.entries(sovNetCounts)) {
  const total = Object.values(brands).reduce((s, n) => s + n, 0);
  sovByNetwork[net] = Object.entries(brands)
    .map(([brand, comments]) => ({ brand, network: net, comments, percentage: total > 0 ? Number(((comments / total) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.comments - a.comments);
}

const buckets = {};
for (const c of lightComments) {
  const date = c.published_at?.slice(0, 7);
  if (!date) continue;
  if (!buckets[date]) buckets[date] = { total: 0, positive: 0, neutral: 0, negative: 0 };
  buckets[date].total++;
  const s = c.sentiment || "neutral";
  if (s === "positive") buckets[date].positive++;
  else if (s === "negative") buckets[date].negative++;
  else buckets[date].neutral++;
}
const commentTrend = Object.entries(buckets)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, val]) => ({ month: MONTH_LABELS[key.slice(5, 7)] + " " + key.slice(0, 4), ...val }));

// --- TOP POSTS ---
const posts = allPosts
  .filter(p => p.caption && p.caption.length > 0)
  .map(p => ({ ...p, caption: cleanText(p.caption) }))
  .filter(p => {
    if (p.network === "reddit" || p.network === "x") return RELEVANCE_KEYWORDS.test(p.caption);
    return true;
  });

let topPosts = [];
if (posts.length > 0) {
  const grouped = {};
  for (const p of posts) {
    const acc = p.account_id ? accountMap[p.account_id] : null;
    const brand = acc?.brand_name || "Desconocido";
    const net = p.network || "instagram";
    const key = `${brand}|${net}`;
    const eng = (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
    const entry = { ...p, _brand: brand, _eng: eng };
    if (!grouped[key]) { grouped[key] = { best: entry, worst: entry }; }
    else {
      if (eng > grouped[key].best._eng) grouped[key].best = entry;
      if (eng < grouped[key].worst._eng) grouped[key].worst = entry;
    }
  }

  const selectedPostIds = [];
  for (const { best, worst } of Object.values(grouped)) {
    selectedPostIds.push(best.id);
    if (best.id !== worst.id) selectedPostIds.push(worst.id);
  }

  const rawDataMap = {};
  if (selectedPostIds.length > 0) {
    const { data: rawRows } = await sb.from("posts").select("id, raw_data").in("id", selectedPostIds);
    if (rawRows) for (const r of rawRows) rawDataMap[r.id] = r.raw_data;
  }

  for (const { best, worst } of Object.values(grouped)) {
    const mapPost = (p, ranking) => {
      const acc = p.account_id ? accountMap[p.account_id] : null;
      const rd = rawDataMap[p.id];
      return {
        brand: acc?.brand_name || "Desconocido",
        network: p.network || "instagram",
        caption: (p.caption || "").slice(0, 200),
        likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0, views: p.views || 0,
        date: p.published_at?.split("T")[0] || "2026-09-01",
        url: p.post_url || undefined,
        imageUrl: rd?.displayUrl || extractFbImage(rd) || undefined,
        topComment: undefined,
        ranking,
      };
    };
    topPosts.push(mapPost(best, "best"));
    if (best.id !== worst.id) topPosts.push(mapPost(worst, "worst"));
  }
}

// --- BRAND ENGAGEMENT ---
const engBrands = {};
for (const p of allPosts) {
  const acc = p.account_id ? accountMap[p.account_id] : null;
  const brand = acc?.brand_name || "Otro";
  if (!engBrands[brand]) { engBrands[brand] = { brand, accountType: acc?.account_type || "competitor", posts: 0, likes: 0, comments: 0, shares: 0, views: 0, totalEngagement: 0 }; }
  const b = engBrands[brand];
  b.posts++;
  b.likes += p.likes || 0;
  b.comments += p.comments || 0;
  b.shares += p.shares || 0;
  b.views += p.views || 0;
  b.totalEngagement += (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
}
const brandEngagement = Object.values(engBrands).sort((a, b) => b.totalEngagement - a.totalEngagement);

// --- ACCOUNT SNAPSHOTS ---
const accountSnapshots = [];
if (snapshotsRaw.data) {
  const seen = new Set();
  for (const s of snapshotsRaw.data) {
    if (seen.has(s.account_id)) continue;
    seen.add(s.account_id);
    const acc = accountMap[s.account_id];
    if (!acc) continue;
    if (acc.brand_name === "P.A.N." && acc.network === "tiktok") continue;
    accountSnapshots.push({
      brand: acc.brand_name, network: acc.network || "", username: acc.username || "",
      followers: s.followers || 0, following: s.following || 0, totalPosts: s.total_posts || 0,
      snapshotDate: s.snapshot_date, accountType: acc.account_type,
    });
  }
}

// --- WRITE OUTPUT ---
const result = { mentions, topPosts, mentionsByNetwork, sentimentByBrand, sovData, commentTrend, brandEngagement, accountSnapshots, sovByNetwork };

const outDir = join(ROOT, "public", "data");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "real-data.json");
writeFileSync(outPath, JSON.stringify(result));

const elapsed = Date.now() - t0;
const sizeKB = Math.round(JSON.stringify(result).length / 1024);
console.log(`\nGenerado: ${outPath} (${sizeKB} KB) en ${elapsed}ms`);
console.log(`  mentions: ${mentions.length}, topPosts: ${topPosts.length}`);
console.log(`  sovData: ${sovData.length}, sentimentByBrand: ${sentimentByBrand.length}`);
console.log(`  commentTrend: ${commentTrend.length}, brandEngagement: ${brandEngagement.length}`);
console.log(`  accountSnapshots: ${accountSnapshots.length}, sovByNetwork: ${Object.keys(sovByNetwork).length} redes`);
process.exit(0);
