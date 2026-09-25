import { supabase } from "./supabase";
import type { MentionData, TopPostData, TopComment, Network } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
const sb = supabase as any;

const POSITIVE_WORDS = /delicioso|deliciosa|rico|rica|excelente|perfecto|perfecta|increíble|divino|divina|bueno|buena|genial|maravill|espectacular|mejor|favorit|encanta|amo|hermoso|hermosa|buen/i;
const NEGATIVE_WORDS = /malo|mala|horrible|terrible|asco|pésimo|pésima|feo|fea|peor|odio|decepcion|basura|fraude/i;
const POSITIVE_EMOJI = /😍|🤤|😋|❤️|💛|💙|🔥|👏|✨|🥰|💯|👌|😊|🙌|💪|😎|🫶/;
const NEGATIVE_EMOJI = /😡|👎|💔|😤|🤮|😠|😞|😢|💩/;

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

type AccountRow = { id: string; brand_name: string; account_type: string; product_line: string | null };

async function getAccountMap(): Promise<Record<string, AccountRow>> {
  const { data } = await sb.from("accounts").select("id, brand_name, account_type, product_line");
  const map: Record<string, AccountRow> = {};
  if (data) for (const a of data) map[a.id] = a as AccountRow;
  return map;
}

export async function fetchRealMentions(): Promise<MentionData[]> {
  const [accountMap, comments] = await Promise.all([
    getAccountMap(),
    fetchAll("comments", "id, text, author_username, likes, published_at, network, account_id"),
  ]);

  if (!comments || comments.length === 0) return [];

  type CommentItem = { acc: AccountRow | null; text: string; net: string; raw: any };
  const mapped: CommentItem[] = comments
    .filter((c: any) => c.text && c.text.length > 3)
    .map((c: any): CommentItem => {
      const acc = c.account_id ? accountMap[c.account_id] : null;
      return { acc, text: cleanText(c.text!), net: c.network || "instagram", raw: c };
    });

  return mapped
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
}

export async function fetchRealTopPosts(): Promise<TopPostData[]> {
  const [accountMap, allPosts] = await Promise.all([
    getAccountMap(),
    fetchAll("posts", "id, caption, likes, comments, shares, views, published_at, network, post_url, account_id, raw_data"),
  ]);

  const posts = allPosts
    .filter((p: any) => p.caption && p.caption.length > 0)
    .map((p: any) => ({ ...p, caption: cleanText(p.caption) }))
    .filter((p: any) => {
      if (p.network === "reddit" || p.network === "x") return RELEVANCE_KEYWORDS.test(p.caption);
      return true;
    });
  if (posts.length === 0) return [];

  const grouped: Record<string, { best: any; worst: any }> = {};
  for (const p of posts) {
    const acc = p.account_id ? accountMap[p.account_id] : null;
    const brand = acc?.brand_name || "Desconocido";
    const net = p.network || "instagram";
    const key = `${brand}|${net}`;
    const eng = (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
    const entry = { ...p, _brand: brand, _eng: eng };

    if (!grouped[key]) {
      grouped[key] = { best: entry, worst: entry };
    } else {
      if (eng > grouped[key].best._eng) grouped[key].best = entry;
      if (eng < grouped[key].worst._eng) grouped[key].worst = entry;
    }
  }

  const selectedPosts: any[] = [];
  for (const { best, worst } of Object.values(grouped)) {
    selectedPosts.push(best);
    if (best.id !== worst.id) selectedPosts.push(worst);
  }

  const postIds = selectedPosts.map((p: any) => p.id);
  const { data: topComments } = await sb
    .from("comments")
    .select("post_id, author_username, text, likes")
    .in("post_id", postIds)
    .not("text", "is", null)
    .not("text", "eq", "")
    .order("likes", { ascending: false });

  const commentsByPost: Record<string, TopComment> = {};
  if (topComments) {
    for (const c of topComments) {
      const pid = c.post_id;
      if (pid && !commentsByPost[pid]) {
        commentsByPost[pid] = {
          author: `@${c.author_username || "usuario"}`,
          text: cleanText(c.text || ""),
          likes: c.likes || 0,
        };
      }
    }
  }

  const result: TopPostData[] = [];
  for (const { best, worst } of Object.values(grouped)) {
    const mapPost = (p: any, ranking: "best" | "worst") => {
      const acc = p.account_id ? accountMap[p.account_id] : null;
      return {
        brand: acc?.brand_name || "Desconocido",
        network: (p.network || "instagram") as Network,
        caption: (p.caption || "").slice(0, 200),
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        views: p.views || 0,
        date: p.published_at?.split("T")[0] || "2026-09-01",
        url: p.post_url || undefined,
        imageUrl: p.raw_data?.displayUrl || extractFbImage(p.raw_data) || undefined,
        topComment: commentsByPost[p.id] || undefined,
        ranking,
      };
    };
    result.push(mapPost(best, "best"));
    if (best.id !== worst.id) result.push(mapPost(worst, "worst"));
  }

  return result;
}

export async function fetchMentionsByNetwork(): Promise<{ network: string; mentions: number; percentage: number }[]> {
  const data = await fetchAll("comments", "network");
  if (data.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const c of data) {
    const net = c.network || "unknown";
    counts[net] = (counts[net] || 0) + 1;
  }

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return Object.entries(counts)
    .map(([network, mentions]) => ({
      network,
      mentions,
      percentage: total > 0 ? Number(((mentions / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);
}

export async function fetchSentimentByBrand(): Promise<{ brand: string; positive: number; neutral: number; negative: number }[]> {
  const [accountMap, data] = await Promise.all([
    getAccountMap(),
    fetchAll("comments", "text, account_id"),
  ]);

  const filtered = data.filter((c: any) => c.text && c.text.length > 0);
  if (filtered.length === 0) return [];

  const sentiments: Record<string, { positive: number; neutral: number; negative: number }> = {};
  for (const c of filtered) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    if (!sentiments[brand]) sentiments[brand] = { positive: 0, neutral: 0, negative: 0 };
    sentiments[brand][classifySentiment(cleanText(c.text || ""))]++;
  }

  return Object.entries(sentiments)
    .map(([brand, s]) => {
      const total = s.positive + s.neutral + s.negative;
      return {
        brand,
        positive: total > 0 ? Math.round((s.positive / total) * 100) : 0,
        neutral: total > 0 ? Math.round((s.neutral / total) * 100) : 0,
        negative: total > 0 ? Math.round((s.negative / total) * 100) : 0,
      };
    })
    .sort((a, b) => (b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative));
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

export type CommentTrendPoint = { month: string; total: number; positive: number; neutral: number; negative: number };

export async function fetchCommentTrend(): Promise<CommentTrendPoint[]> {
  const data = await fetchAll("comments", "published_at, text");
  const filtered = data.filter((c: any) => c.published_at && c.text && c.text.length > 0);
  if (filtered.length === 0) return [];

  const buckets: Record<string, { total: number; positive: number; neutral: number; negative: number }> = {};
  for (const c of filtered) {
    const date = c.published_at?.slice(0, 7);
    if (!date) continue;
    if (!buckets[date]) buckets[date] = { total: 0, positive: 0, neutral: 0, negative: 0 };
    buckets[date].total++;
    const sent = classifySentiment(cleanText(c.text || ""));
    buckets[date][sent]++;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      month: MONTH_LABELS[key.slice(5, 7)] + " " + key.slice(0, 4),
      ...val,
    }));
}

export type BrandEngagement = {
  brand: string;
  accountType: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  totalEngagement: number;
};

export async function fetchBrandEngagement(): Promise<BrandEngagement[]> {
  const [accountMap, posts] = await Promise.all([
    getAccountMap(),
    fetchAll("posts", "account_id, likes, comments, shares, views"),
  ]);

  if (posts.length === 0) return [];

  const brands: Record<string, BrandEngagement> = {};
  for (const p of posts) {
    const acc = p.account_id ? accountMap[p.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    if (!brands[brand]) {
      brands[brand] = { brand, accountType: acc?.account_type || "competitor", posts: 0, likes: 0, comments: 0, shares: 0, views: 0, totalEngagement: 0 };
    }
    const b = brands[brand];
    b.posts++;
    b.likes += p.likes || 0;
    b.comments += p.comments || 0;
    b.shares += p.shares || 0;
    b.views += p.views || 0;
    b.totalEngagement += (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
  }

  return Object.values(brands).sort((a, b) => b.totalEngagement - a.totalEngagement);
}

export type AccountSnapshot = {
  brand: string;
  network: string;
  username: string;
  followers: number;
  following: number;
  totalPosts: number;
  snapshotDate: string;
  accountType: string;
};

export async function fetchAccountSnapshots(): Promise<AccountSnapshot[]> {
  const { data } = await sb
    .from("account_snapshots")
    .select("account_id, followers, following, total_posts, snapshot_date")
    .order("snapshot_date", { ascending: false });

  if (!data || data.length === 0) return [];

  const [accountMap] = await Promise.all([getAccountMap()]);

  const { data: accounts } = await sb.from("accounts").select("id, brand_name, network, username, account_type");
  const acctDetails: Record<string, { brand: string; network: string; username: string; accountType: string }> = {};
  if (accounts) {
    for (const a of accounts) {
      acctDetails[a.id] = { brand: a.brand_name, network: a.network, username: a.username, accountType: a.account_type };
    }
  }

  const seen = new Set<string>();
  const results: AccountSnapshot[] = [];
  for (const s of data) {
    const key = s.account_id;
    if (seen.has(key)) continue;
    seen.add(key);
    const acc = acctDetails[s.account_id];
    if (!acc) continue;
    if (acc.brand === "P.A.N." && acc.network === "tiktok") continue;
    results.push({
      brand: acc.brand,
      network: acc.network,
      username: acc.username,
      followers: s.followers || 0,
      following: s.following || 0,
      totalPosts: s.total_posts || 0,
      snapshotDate: s.snapshot_date,
      accountType: acc.accountType,
    });
  }
  return results;
}

export async function fetchSOVData(): Promise<{ brand: string; mentions: number; percentage: number }[]> {
  const [accountMap, data] = await Promise.all([
    getAccountMap(),
    fetchAll("comments", "account_id"),
  ]);

  if (!data || data.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const c of data) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    counts[brand] = (counts[brand] || 0) + 1;
  }

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  return Object.entries(counts)
    .map(([brand, mentions]) => ({
      brand,
      mentions,
      percentage: total > 0 ? Number(((mentions / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.mentions - a.mentions);
}

export type SOVByNetworkEntry = { brand: string; network: string; comments: number; percentage: number };

export async function fetchSOVByNetwork(): Promise<Record<string, SOVByNetworkEntry[]>> {
  const [accountMap, data] = await Promise.all([
    getAccountMap(),
    fetchAll("comments", "account_id, network"),
  ]);

  if (!data || data.length === 0) return {};

  const counts: Record<string, Record<string, number>> = {};
  for (const c of data) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    const net = c.network || "unknown";
    if (!counts[net]) counts[net] = {};
    counts[net][brand] = (counts[net][brand] || 0) + 1;
  }

  const result: Record<string, SOVByNetworkEntry[]> = {};
  for (const [net, brands] of Object.entries(counts)) {
    const total = Object.values(brands).reduce((s, n) => s + n, 0);
    result[net] = Object.entries(brands)
      .map(([brand, comments]) => ({
        brand,
        network: net,
        comments,
        percentage: total > 0 ? Number(((comments / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.comments - a.comments);
  }
  return result;
}
