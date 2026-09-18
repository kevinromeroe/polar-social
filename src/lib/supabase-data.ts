import { supabase } from "./supabase";
import type { MentionData, TopPostData, TopComment, Network } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
const sb = supabase as any;

const POSITIVE_WORDS = /delicioso|deliciosa|rico|rica|excelente|perfecto|perfecta|increíble|divino|divina|bueno|buena|genial|maravill|espectacular|mejor|favorit|encanta|amo|hermoso|hermosa|buen/i;
const NEGATIVE_WORDS = /malo|mala|horrible|terrible|asco|pésimo|pésima|feo|fea|peor|odio|decepcion|basura|fraude/i;
const POSITIVE_EMOJI = /😍|🤤|😋|❤️|💛|💙|🔥|👏|✨|🥰|💯|👌|😊|🙌|💪|😎|🫶/;
const NEGATIVE_EMOJI = /😡|👎|💔|😤|🤮|😠|😞|😢|💩/;

function classifySentiment(text: string): "positive" | "neutral" | "negative" {
  const hasPositive = POSITIVE_WORDS.test(text) || POSITIVE_EMOJI.test(text);
  const hasNegative = NEGATIVE_WORDS.test(text) || NEGATIVE_EMOJI.test(text);
  if (hasPositive && !hasNegative) return "positive";
  if (hasNegative && !hasPositive) return "negative";
  return "neutral";
}

type AccountRow = { id: string; brand_name: string; account_type: string; product_line: string | null };

async function getAccountMap(): Promise<Record<string, AccountRow>> {
  const { data } = await sb.from("accounts").select("id, brand_name, account_type, product_line");
  const map: Record<string, AccountRow> = {};
  if (data) for (const a of data) map[a.id] = a as AccountRow;
  return map;
}

export async function fetchRealMentions(): Promise<MentionData[]> {
  const [accountMap, { data: comments }] = await Promise.all([
    getAccountMap(),
    sb
      .from("comments")
      .select("id, text, author_username, likes, published_at, network, account_id")
      .not("text", "is", null)
      .not("text", "eq", "")
      .order("published_at", { ascending: false })
      .limit(500),
  ]);

  if (!comments) return [];

  return comments
    .filter((c: any) => c.text && c.text.length > 3)
    .map((c: any, i: number) => {
      const acc = c.account_id ? accountMap[c.account_id] : null;
      const text = c.text!;
      return {
        id: i + 1,
        brand: acc?.brand_name || "Desconocido",
        network: c.network || "instagram",
        author: `@${c.author_username || "usuario"}`,
        text,
        sentiment: classifySentiment(text),
        date: c.published_at?.split("T")[0] || "2026-09-01",
        likes: c.likes || 0,
        productLine: acc?.product_line || undefined,
      };
    });
}

export async function fetchRealTopPosts(): Promise<TopPostData[]> {
  const [accountMap, { data: posts }] = await Promise.all([
    getAccountMap(),
    sb
      .from("posts")
      .select("id, caption, likes, comments, shares, views, published_at, network, post_url, account_id")
      .not("caption", "is", null)
      .not("caption", "eq", "")
      .order("likes", { ascending: false })
      .limit(100),
  ]);

  if (!posts) return [];

  const postIds = posts.map((p: any) => p.id);
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
          text: c.text || "",
          likes: c.likes || 0,
        };
      }
    }
  }

  const mapped = posts.map((p: any) => {
    const acc = p.account_id ? accountMap[p.account_id] : null;
    const eng = (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
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
      topComment: commentsByPost[p.id] || undefined,
      _eng: eng,
    };
  });

  mapped.sort((a: any, b: any) => b._eng - a._eng);
  const bestCut = Math.ceil(mapped.length * 0.3);
  return mapped.map((p: any, i: number) => {
    const { _eng, ...rest } = p;
    return { ...rest, ranking: i < bestCut ? "best" as const : "worst" as const };
  });
}

export async function fetchMentionsByNetwork(): Promise<{ network: string; mentions: number; percentage: number }[]> {
  const { data } = await sb.from("comments").select("network");
  if (!data) return [];

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
  const [accountMap, { data }] = await Promise.all([
    getAccountMap(),
    sb.from("comments").select("text, account_id").not("text", "is", null).not("text", "eq", ""),
  ]);

  if (!data) return [];

  const sentiments: Record<string, { positive: number; neutral: number; negative: number }> = {};
  for (const c of data) {
    const acc = c.account_id ? accountMap[c.account_id] : null;
    const brand = acc?.brand_name || "Otro";
    if (!sentiments[brand]) sentiments[brand] = { positive: 0, neutral: 0, negative: 0 };
    sentiments[brand][classifySentiment(c.text || "")]++;
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
  const { data } = await sb
    .from("comments")
    .select("published_at, text")
    .not("published_at", "is", null)
    .not("text", "is", null)
    .not("text", "eq", "");

  if (!data) return [];

  const buckets: Record<string, { total: number; positive: number; neutral: number; negative: number }> = {};
  for (const c of data) {
    const date = c.published_at?.slice(0, 7);
    if (!date) continue;
    if (!buckets[date]) buckets[date] = { total: 0, positive: 0, neutral: 0, negative: 0 };
    buckets[date].total++;
    const sent = classifySentiment(c.text || "");
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
  const [accountMap, { data: posts }] = await Promise.all([
    getAccountMap(),
    sb.from("posts").select("account_id, likes, comments, shares, views"),
  ]);

  if (!posts) return [];

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
  const [accountMap, { data }] = await Promise.all([
    getAccountMap(),
    sb.from("comments").select("account_id"),
  ]);

  if (!data) return [];

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
