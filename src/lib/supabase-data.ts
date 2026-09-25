import { supabase } from "./supabase";
import type { MentionData, TopPostData, TopComment, Network } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
const sb = supabase as any;

const POSITIVE_WORDS = /delicioso|deliciosa|rico|rica|excelente|perfecto|perfecta|increíble|divino|divina|bueno|buena|genial|maravill|espectacular|mejor|favorit|encanta|amo|hermoso|hermosa|buen|sabroso|sabrosa|riquísim|exquisit|fantástic|recomiendo|recomendad|me gusta|me encanta|lo máximo|de calidad|súper|super bien|nutritiv|salud|practico|práctico|fácil|rendidor/i;
const NEGATIVE_WORDS = /malo|mala|horrible|terrible|asco|pésimo|pésima|feo|fea|peor|odio|decepcion|basura|fraude|caro|cara\b|costoso|costosa|no me gust|no sirv|no rind|no vale|no encuentr|no hay\b|agotad|mediocre|regular\b|desagradabl|grumo|seco\b|seca\b|duro\b|dura\b|vencid|caducad|dañad|porquería|mugr|sucio|sucia|engaño|estafa|queja|reclam|decepcionan|lástima|lastima|enferm|intoxica|dolor de|mal sabor|mal olor|no compren|no compr[eé]|subió|aumentó|inflación|escas|desabastecer|no recomien|perjudic|tóxico|tóxic|nocivo|insípid|desabrid|químic|artificial|aburrido|aburrida|desperdicio|botaron|tirar a la basura|echó a perder/i;
const POSITIVE_EMOJI = /😍|🤤|😋|❤️|💛|💙|🔥|👏|✨|🥰|💯|👌|😊|🙌|💪|😎|🫶|😻|🐾❤|♥️|💕|💖|🎉|👍/;
const NEGATIVE_EMOJI = /😡|👎|💔|😤|🤮|😠|😞|😢|💩|🙄|😒|😖|😣|😩|😫|🤢|🚫|⚠️|❌/;

const HTML_ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&#x2F;": "/" };
function cleanText(raw: string): string {
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

const RELEVANCE_KEYWORDS = /harina|arepa|pan\b|maíz|maiz|atún|atun|pasta|polar|p\.a\.n|comida|cocina|receta|desayuno|almuerzo|cena|alimento|colombia|venezuel|bogot|medell|cali\b|barranquilla|empanada|buñuelo|mascotas|perro|gato|donkan|mirringo|chunky|cat chow|dog chow|purina|ringo/i;

function classifySentiment(text: string): "positive" | "neutral" | "negative" {
  const hasPositive = POSITIVE_WORDS.test(text) || POSITIVE_EMOJI.test(text);
  const hasNegative = NEGATIVE_WORDS.test(text) || NEGATIVE_EMOJI.test(text);
  if (hasPositive && !hasNegative) return "positive";
  if (hasNegative && !hasPositive) return "negative";
  return "neutral";
}

function extractFbImage(raw: any): string | undefined {
  if (!raw?.media || !Array.isArray(raw.media)) return undefined;
  for (const m of raw.media) {
    if (m.image?.uri) return m.image.uri;
    if (m.thumbnail) return m.thumbnail;
  }
  return undefined;
}

async function fetchAll(table: string, columns: string): Promise<any[]> {
  const PAGE = 1000;
  let all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) { console.warn(`[Supabase] fetchAll ${table}:`, error.message); break; }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

type AccountRow = { id: string; brand_name: string; account_type: string; product_line: string | null; network?: string; username?: string };

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

export type CommentTrendPoint = { month: string; total: number; positive: number; neutral: number; negative: number };
export type BrandEngagement = { brand: string; accountType: string; posts: number; likes: number; comments: number; shares: number; views: number; totalEngagement: number };
export type AccountSnapshot = { brand: string; network: string; username: string; followers: number; following: number; totalPosts: number; snapshotDate: string; accountType: string };
export type SOVByNetworkEntry = { brand: string; network: string; comments: number; percentage: number };

export interface AllRealData {
  mentions: MentionData[];
  topPosts: TopPostData[];
  mentionsByNetwork: { network: string; mentions: number; percentage: number }[];
  sentimentByBrand: { brand: string; positive: number; neutral: number; negative: number }[];
  sovData: { brand: string; mentions: number; percentage: number }[];
  commentTrend: CommentTrendPoint[];
  brandEngagement: BrandEngagement[];
  accountSnapshots: AccountSnapshot[];
  sovByNetwork: Record<string, SOVByNetworkEntry[]>;
}

export async function fetchAllRealData(): Promise<AllRealData> {
  const [accountsRaw, allComments, allPosts, snapshotsRaw] = await Promise.all([
    sb.from("accounts").select("id, brand_name, account_type, product_line, network, username"),
    fetchAll("comments", "id, text, author_username, likes, published_at, network, account_id, post_id"),
    fetchAll("posts", "id, caption, likes, comments, shares, views, published_at, network, post_url, account_id, raw_data"),
    sb.from("account_snapshots").select("account_id, followers, following, total_posts, snapshot_date").order("snapshot_date", { ascending: false }),
  ]);

  const accountMap: Record<string, AccountRow> = {};
  if (accountsRaw.data) for (const a of accountsRaw.data) accountMap[a.id] = a as AccountRow;

  console.log(`[Supabase] Cargados: ${allComments.length} comentarios, ${allPosts.length} posts, ${Object.keys(accountMap).length} cuentas`);

  const validComments = allComments.filter((c: any) => c.text && c.text.length > 3);

  // --- MENTIONS ---
  type CommentItem = { acc: AccountRow | null; text: string; net: string; raw: any };
  const mapped: CommentItem[] = validComments.map((c: any): CommentItem => {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    return { acc, text: cleanText(c.text!), net: c.network || "instagram", raw: c };
  });

  const mentions: MentionData[] = mapped
    .filter((item) => {
      if (item.text.length < 4) return false;
      if (item.net === "reddit" || item.net === "x") return RELEVANCE_KEYWORDS.test(item.text);
      return true;
    })
    .map((item, i) => ({
      id: i + 1,
      brand: item.acc?.brand_name || "Desconocido",
      network: item.net,
      author: `@${item.raw.author_username || "usuario"}`,
      text: item.text,
      sentiment: classifySentiment(item.text),
      date: item.raw.published_at?.split("T")[0] || "2026-09-01",
      likes: item.raw.likes || 0,
      productLine: item.acc?.product_line || undefined,
    }));

  // --- MENTIONS BY NETWORK ---
  const netCounts: Record<string, number> = {};
  for (const c of allComments) {
    const net = c.network || "unknown";
    netCounts[net] = (netCounts[net] || 0) + 1;
  }
  const netTotal = Object.values(netCounts).reduce((s, n) => s + n, 0);
  const mentionsByNetwork = Object.entries(netCounts)
    .map(([network, cnt]) => ({ network, mentions: cnt, percentage: netTotal > 0 ? Number(((cnt / netTotal) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.mentions - a.mentions);

  // --- SENTIMENT BY BRAND ---
  const sentiments: Record<string, { positive: number; neutral: number; negative: number }> = {};
  for (const c of validComments) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    if (!sentiments[brand]) sentiments[brand] = { positive: 0, neutral: 0, negative: 0 };
    sentiments[brand][classifySentiment(cleanText(c.text || ""))]++;
  }
  const sentimentByBrand = Object.entries(sentiments)
    .map(([brand, s]) => {
      const total = s.positive + s.neutral + s.negative;
      return { brand, positive: total > 0 ? Math.round((s.positive / total) * 100) : 0, neutral: total > 0 ? Math.round((s.neutral / total) * 100) : 0, negative: total > 0 ? Math.round((s.negative / total) * 100) : 0 };
    })
    .sort((a, b) => (b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative));

  // --- SOV ---
  const sovCounts: Record<string, number> = {};
  for (const c of allComments) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    sovCounts[brand] = (sovCounts[brand] || 0) + 1;
  }
  const sovTotal = Object.values(sovCounts).reduce((s, n) => s + n, 0);
  const sovData = Object.entries(sovCounts)
    .map(([brand, cnt]) => ({ brand, mentions: cnt, percentage: sovTotal > 0 ? Number(((cnt / sovTotal) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.mentions - a.mentions);

  // --- SOV BY NETWORK ---
  const sovNetCounts: Record<string, Record<string, number>> = {};
  for (const c of allComments) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    const net = c.network || "unknown";
    if (!sovNetCounts[net]) sovNetCounts[net] = {};
    sovNetCounts[net][brand] = (sovNetCounts[net][brand] || 0) + 1;
  }
  const sovByNetwork: Record<string, SOVByNetworkEntry[]> = {};
  for (const [net, brands] of Object.entries(sovNetCounts)) {
    const total = Object.values(brands).reduce((s, n) => s + n, 0);
    sovByNetwork[net] = Object.entries(brands)
      .map(([brand, comments]) => ({ brand, network: net, comments, percentage: total > 0 ? Number(((comments / total) * 100).toFixed(1)) : 0 }))
      .sort((a, b) => b.comments - a.comments);
  }

  // --- COMMENT TREND ---
  const buckets: Record<string, { total: number; positive: number; neutral: number; negative: number }> = {};
  for (const c of validComments) {
    const date = c.published_at?.slice(0, 7);
    if (!date) continue;
    if (!buckets[date]) buckets[date] = { total: 0, positive: 0, neutral: 0, negative: 0 };
    buckets[date].total++;
    buckets[date][classifySentiment(cleanText(c.text || ""))]++;
  }
  const commentTrend: CommentTrendPoint[] = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({ month: MONTH_LABELS[key.slice(5, 7)] + " " + key.slice(0, 4), ...val }));

  // --- TOP POSTS ---
  const posts = allPosts
    .filter((p: any) => p.caption && p.caption.length > 0)
    .map((p: any) => ({ ...p, caption: cleanText(p.caption) }))
    .filter((p: any) => {
      if (p.network === "reddit" || p.network === "x") return RELEVANCE_KEYWORDS.test(p.caption);
      return true;
    });

  let topPosts: TopPostData[] = [];
  if (posts.length > 0) {
    const grouped: Record<string, { best: any; worst: any }> = {};
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

    const selectedPostIds: string[] = [];
    for (const { best, worst } of Object.values(grouped)) {
      selectedPostIds.push(best.id);
      if (best.id !== worst.id) selectedPostIds.push(worst.id);
    }

    const commentsByPost: Record<string, TopComment> = {};
    for (const c of allComments) {
      if (!c.post_id || !c.text || commentsByPost[c.post_id]) continue;
      if (!selectedPostIds.includes(c.post_id)) continue;
      commentsByPost[c.post_id] = { author: `@${c.author_username || "usuario"}`, text: cleanText(c.text), likes: c.likes || 0 };
    }

    for (const { best, worst } of Object.values(grouped)) {
      const mapPost = (p: any, ranking: "best" | "worst") => {
        const acc = p.account_id ? accountMap[p.account_id] : null;
        return {
          brand: acc?.brand_name || "Desconocido",
          network: (p.network || "instagram") as Network,
          caption: (p.caption || "").slice(0, 200),
          likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0, views: p.views || 0,
          date: p.published_at?.split("T")[0] || "2026-09-01",
          url: p.post_url || undefined,
          imageUrl: p.raw_data?.displayUrl || extractFbImage(p.raw_data) || undefined,
          topComment: commentsByPost[p.id] || undefined,
          ranking,
        };
      };
      topPosts.push(mapPost(best, "best"));
      if (best.id !== worst.id) topPosts.push(mapPost(worst, "worst"));
    }
  }

  // --- BRAND ENGAGEMENT ---
  const engBrands: Record<string, BrandEngagement> = {};
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
  const accountSnapshots: AccountSnapshot[] = [];
  if (snapshotsRaw.data) {
    const seen = new Set<string>();
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

  return { mentions, topPosts, mentionsByNetwork, sentimentByBrand, sovData, commentTrend, brandEngagement, accountSnapshots, sovByNetwork };
}

// Legacy individual exports kept for type compatibility
export { fetchAll };
export type { AccountRow };
