#!/usr/bin/env node
/**
 * Scrape BATCH: todas las cuentas + Reddit
 * Uso: node scripts/scrape-batch.mjs [--posts 50] [--only instagram] [--only reddit]
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

const args = process.argv.slice(2);
const postsLimit = args.includes("--posts") ? parseInt(args[args.indexOf("--posts") + 1]) : 50;
const onlyNetwork = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const ACTORS = {
  instagram: "apify~instagram-scraper",
  facebook: "apify~facebook-pages-scraper",
  tiktok: "clockworks~free-tiktok-scraper",
  x: "apidojo~tweet-scraper",
};

const REDDIT_ACTOR = "trudax~reddit-scraper";
const REDDIT_SEARCHES = [
  { query: "harina PAN arepa", subreddits: ["Colombia", "vzla", "cooking", "LatinFood"] },
  { query: "Doria pasta Colombia", subreddits: ["Colombia"] },
  { query: "atún Van Camps Isabel Colombia", subreddits: ["Colombia"] },
  { query: "Zenú alimentos Colombia", subreddits: ["Colombia"] },
];

// ── Helpers ──
async function sbGet(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`GET ${table}: ${res.status}`);
  return res.json();
}

async function sbUpsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPSERT ${table}: ${res.status} ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function runApify(actorId, input) {
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify start ${actorId}: ${res.status} ${errText.slice(0, 200)}`);
  }
  const { data } = await res.json();
  const runId = data.id;

  let status = data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 5000));
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const checkData = await check.json();
    status = checkData.data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);

  if (status !== "SUCCEEDED") throw new Error(`Actor run ${status}`);

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`);
  return { items: await dataRes.json(), runId };
}

// ── Input builders ──
function buildInput(net, username) {
  switch (net) {
    case "instagram":
      return { directUrls: [`https://www.instagram.com/${username}/`], resultsType: "posts", resultsLimit: postsLimit };
    case "facebook":
      return { startUrls: [{ url: `https://www.facebook.com/${username}` }], maxPosts: postsLimit, maxComments: 50 };
    case "tiktok":
      return { profiles: [`https://www.tiktok.com/@${username}`], resultsPerPage: postsLimit, shouldDownloadVideos: false };
    case "x":
      return { startUrls: [{ url: `https://x.com/${username}` }], maxTweets: postsLimit, mode: "profile" };
    default:
      return {};
  }
}

// ── Processors ──
async function processInstagram(items, account, today) {
  let postsSaved = 0;
  const postCodes = [];

  for (const item of items) {
    const sc = item.shortCode || item.id;
    if (!sc) continue;
    try {
      await sbUpsert("posts", {
        account_id: account.id, network: "instagram", post_id_native: sc,
        post_url: item.url || `https://www.instagram.com/p/${sc}/`,
        post_type: item.type || item.productType || "unknown", caption: item.caption || "",
        likes: item.likesCount || 0, comments: item.commentsCount || 0,
        shares: 0, views: item.videoViewCount || 0,
        published_at: item.timestamp ? new Date(item.timestamp).toISOString() : null,
        raw_data: { ownerUsername: item.ownerUsername, displayUrl: item.displayUrl, isVideo: item.isVideo },
      });
      postsSaved++;
      if ((item.commentsCount || 0) > 0) postCodes.push(sc);
    } catch (err) { /* dup */ }
  }
  return { profileSaved: false, postsSaved, postCodes };
}

async function scrapeInstagramComments(postCodes, account) {
  if (postCodes.length === 0) return 0;
  const postUrls = postCodes.map(sc => `https://www.instagram.com/p/${sc}/`);
  console.log(`      Scraping comentarios de ${postUrls.length} posts...`);

  const { items } = await runApify("apify~instagram-comment-scraper", {
    directUrls: postUrls, resultsLimit: 100,
  });

  const postIdMap = {};
  for (const sc of postCodes) {
    const saved = await sbGet("posts", `post_id_native=eq.${sc}&account_id=eq.${account.id}&select=id`);
    if (saved.length > 0) postIdMap[sc] = saved[0].id;
  }

  let commentsSaved = 0;
  for (const c of items) {
    const postCode = c.postShortCode || c.shortCode || c.postUrl?.match(/\/p\/([^/]+)\/?/)?.[1] || "";
    const postId = postIdMap[postCode];
    if (!postId) continue;
    const commentId = c.id || `igc_${postCode}_${Date.now()}_${Math.random()}`;
    const publishedAt = c.timestamp
      ? (typeof c.timestamp === "string" ? c.timestamp : new Date(c.timestamp * 1000).toISOString())
      : null;
    try {
      await sbUpsert("comments", {
        post_id: postId, account_id: account.id, network: "instagram",
        comment_id_native: commentId,
        author_username: c.ownerUsername || "", author_name: c.ownerFullName || "",
        text: c.text || "", likes: c.likesCount || 0,
        replies_count: c.repliesCount || 0, published_at: publishedAt, raw_data: c,
      });
      commentsSaved++;
    } catch (err) { /* dup */ }
  }
  return commentsSaved;
}

async function processFacebook(items, account, today) {
  let profileSaved = false, postsSaved = 0, commentsSaved = 0;

  for (const item of items) {
    if ((item.likes || item.followersCount) && !profileSaved) {
      await sbUpsert("account_snapshots", {
        account_id: account.id, snapshot_date: today,
        followers: item.likes || item.followersCount || 0, following: 0,
        total_posts: item.postsCount || 0,
        raw_data: { name: item.name, categories: item.categories },
      });
      profileSaved = true;
    }

    for (const post of (item.posts || [])) {
      const pid = post.postId || post.id || `fb_${Date.now()}_${Math.random()}`;
      try {
        const [savedPost] = await sbUpsert("posts", {
          account_id: account.id, network: "facebook", post_id_native: pid,
          post_url: post.postUrl || post.url || "", post_type: post.type || "unknown",
          caption: post.text || post.message || "",
          likes: post.likesCount || post.likes || 0,
          comments: post.commentsCount || post.comments || 0,
          shares: post.sharesCount || post.shares || 0,
          views: post.viewsCount || 0,
          published_at: post.time ? new Date(post.time).toISOString() : null,
          raw_data: post,
        });
        postsSaved++;

        for (const c of (post.comments?.items || post.latestComments || [])) {
          const cid = c.id || c.commentId || `fbc_${pid}_${Date.now()}_${Math.random()}`;
          try {
            await sbUpsert("comments", {
              post_id: savedPost.id, account_id: account.id, network: "facebook",
              comment_id_native: cid, author_username: c.profileUrl || "",
              author_name: c.name || c.profileName || "", text: c.text || c.message || "",
              likes: c.likesCount || 0, published_at: c.date ? new Date(c.date).toISOString() : null,
              raw_data: c,
            });
            commentsSaved++;
          } catch (err) { /* dup */ }
        }
      } catch (err) { /* dup */ }
    }
  }
  return { profileSaved, postsSaved, commentsSaved };
}

async function processTikTok(items, account, today) {
  let profileSaved = false, postsSaved = 0, commentsSaved = 0;

  for (const item of items) {
    if (item.authorMeta && !profileSaved) {
      await sbUpsert("account_snapshots", {
        account_id: account.id, snapshot_date: today,
        followers: item.authorMeta.fans || 0, following: item.authorMeta.following || 0,
        total_posts: item.authorMeta.video || 0,
        raw_data: { nickname: item.authorMeta.nickName, verified: item.authorMeta.verified, hearts: item.authorMeta.heart },
      });
      profileSaved = true;
    }

    if (item.id) {
      try {
        const [savedPost] = await sbUpsert("posts", {
          account_id: account.id, network: "tiktok", post_id_native: item.id,
          post_url: item.webVideoUrl || `https://www.tiktok.com/@${account.username}/video/${item.id}`,
          post_type: "video", caption: item.text || "",
          likes: item.diggCount || 0, comments: item.commentCount || 0,
          shares: item.shareCount || 0, views: item.playCount || 0,
          published_at: item.createTimeISO || null,
          raw_data: { musicMeta: item.musicMeta },
        });
        postsSaved++;

        for (const c of (item.comments || [])) {
          const cid = c.cid || `ttc_${item.id}_${Date.now()}_${Math.random()}`;
          try {
            await sbUpsert("comments", {
              post_id: savedPost.id, account_id: account.id, network: "tiktok",
              comment_id_native: cid, author_username: c.uniqueId || "",
              author_name: c.nickName || "", text: c.text || "",
              likes: c.diggCount || 0, replies_count: c.replyCommentTotal || 0,
              published_at: c.createTimeISO || null, raw_data: c,
            });
            commentsSaved++;
          } catch (err) { /* dup */ }
        }
      } catch (err) { /* dup */ }
    }
  }
  return { profileSaved, postsSaved, commentsSaved };
}

async function processX(items, account, today) {
  let profileSaved = false, postsSaved = 0;

  for (const item of items) {
    if (item.user && !profileSaved) {
      await sbUpsert("account_snapshots", {
        account_id: account.id, snapshot_date: today,
        followers: item.user.followers_count || 0, following: item.user.friends_count || 0,
        total_posts: item.user.statuses_count || 0,
        raw_data: { name: item.user.name, verified: item.user.verified },
      });
      profileSaved = true;
    }

    const tid = item.id_str || item.id || `x_${Date.now()}_${Math.random()}`;
    try {
      await sbUpsert("posts", {
        account_id: account.id, network: "x", post_id_native: String(tid),
        post_url: `https://x.com/${account.username}/status/${tid}`,
        post_type: item.quoted_status ? "quote" : item.in_reply_to_status_id ? "reply" : "tweet",
        caption: item.full_text || item.text || "",
        likes: item.favorite_count || 0, comments: item.reply_count || 0,
        shares: item.retweet_count || 0, views: item.views_count || 0,
        published_at: item.created_at ? new Date(item.created_at).toISOString() : null,
        raw_data: item,
      });
      postsSaved++;
    } catch (err) { /* dup */ }
  }
  return { profileSaved, postsSaved, commentsSaved: 0 };
}

// ── Reddit ──
async function processReddit(today) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔴 REDDIT — Buscando menciones de marcas`);
  console.log(`${"=".repeat(60)}`);

  let totalPosts = 0, totalComments = 0;

  for (const search of REDDIT_SEARCHES) {
    console.log(`\n   🔍 "${search.query}" en r/${search.subreddits.join(", r/")}`);
    try {
      const { items } = await runApify(REDDIT_ACTOR, {
        searches: [{ term: search.query, sort: "new" }],
        maxItems: 30,
        proxy: { useApifyProxy: true },
      });
      console.log(`      Items: ${items.length}`);

      for (const item of items) {
        if (!item.id) continue;
        const postIdNative = `reddit_${item.id}`;
        const brandGuess = search.query.split(" ")[0];

        // Buscar o crear una cuenta Reddit genérica para la marca
        let accounts = await sbGet("accounts",
          `brand_name=ilike.*${encodeURIComponent(brandGuess)}*&network=eq.reddit&select=id`);

        let accountId;
        if (accounts.length > 0) {
          accountId = accounts[0].id;
        } else {
          // Buscar cualquier cuenta de esa marca para saber el client_id
          const anyAccount = await sbGet("accounts",
            `brand_name=ilike.*${encodeURIComponent(brandGuess)}*&select=client_id,brand_name&limit=1`);
          if (anyAccount.length === 0) continue;

          const [newAccount] = await sbUpsert("accounts", {
            client_id: anyAccount[0].client_id,
            brand_name: anyAccount[0].brand_name,
            network: "reddit",
            username: `search:${search.query}`,
            account_type: "listening",
            is_active: true,
          });
          accountId = newAccount.id;
        }

        try {
          const [savedPost] = await sbUpsert("posts", {
            account_id: accountId, network: "reddit", post_id_native: postIdNative,
            post_url: item.url || `https://reddit.com${item.permalink}`,
            post_type: "post",
            caption: `${item.title || ""}\n\n${item.body || item.selftext || ""}`.trim(),
            likes: item.score || item.ups || 0,
            comments: item.numberOfComments || item.num_comments || 0,
            shares: 0, views: 0,
            published_at: item.createdAt || item.created_utc ? new Date(item.created_utc * 1000).toISOString() : null,
            raw_data: { subreddit: item.subreddit, author: item.author, flair: item.flair },
          });
          totalPosts++;

          // Reddit comments si vienen
          for (const c of (item.comments || [])) {
            const cid = c.id || `rc_${item.id}_${Date.now()}_${Math.random()}`;
            try {
              await sbUpsert("comments", {
                post_id: savedPost.id, account_id: accountId, network: "reddit",
                comment_id_native: `reddit_${cid}`,
                author_username: c.author || "", author_name: "",
                text: c.body || c.text || "", likes: c.score || c.ups || 0,
                replies_count: c.replies?.length || 0,
                published_at: c.createdAt || (c.created_utc ? new Date(c.created_utc * 1000).toISOString() : null),
                raw_data: c,
              });
              totalComments++;
            } catch (err) { /* dup */ }
          }
        } catch (err) { /* dup */ }
      }
    } catch (err) {
      console.log(`      ⚠️ Error Reddit: ${err.message.slice(0, 150)}`);
    }
  }

  console.log(`\n   📊 Reddit total — Posts: ${totalPosts}, Comentarios: ${totalComments}`);
  return { totalPosts, totalComments };
}

// ── MAIN ──
async function main() {
  const today = new Date().toISOString().split("T")[0];
  const startTime = Date.now();
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  SCRAPE BATCH — ${today}`);
  console.log(`  Posts por cuenta: ${postsLimit} | Filtro: ${onlyNetwork || "todas"}`);
  console.log(`${"═".repeat(60)}`);

  // Todas las cuentas activas
  const accounts = await sbGet("accounts", "is_active=eq.true&order=network,brand_name");
  const networks = ["instagram", "facebook", "tiktok", "x"];
  const summary = [];

  for (const net of networks) {
    if (onlyNetwork && onlyNetwork !== net && onlyNetwork !== "reddit") continue;
    if (onlyNetwork === "reddit") continue;

    const netAccounts = accounts.filter(a => a.network === net);
    if (netAccounts.length === 0) continue;

    console.log(`\n${"─".repeat(60)}`);
    console.log(`📱 ${net.toUpperCase()} (${netAccounts.length} cuentas)`);
    console.log(`${"─".repeat(60)}`);

    for (const account of netAccounts) {
      console.log(`\n   ▸ ${account.brand_name} — @${account.username}`);
      const actorId = ACTORS[net];
      if (!actorId) continue;

      try {
        const input = buildInput(net, account.username);
        const { items, runId } = await runApify(actorId, input);
        console.log(`      Items: ${items.length}`);

        let result;
        if (net === "instagram") {
          result = await processInstagram(items, account, today);
          if (result.postCodes.length > 0) {
            const cs = await scrapeInstagramComments(result.postCodes, account);
            result.commentsSaved = cs;
          } else {
            result.commentsSaved = 0;
          }
        } else if (net === "facebook") {
          result = await processFacebook(items, account, today);
        } else if (net === "tiktok") {
          result = await processTikTok(items, account, today);
        } else if (net === "x") {
          result = await processX(items, account, today);
        }

        const line = `${net} | ${account.brand_name} | @${account.username} | posts:${result.postsSaved} comments:${result.commentsSaved || 0}`;
        summary.push(line);
        console.log(`      ✅ Posts: ${result.postsSaved}, Comentarios: ${result.commentsSaved || 0}`);
      } catch (err) {
        console.log(`      ❌ ${err.message.slice(0, 150)}`);
        summary.push(`${net} | ${account.brand_name} | ERROR: ${err.message.slice(0, 80)}`);
      }
    }
  }

  // Reddit
  if (!onlyNetwork || onlyNetwork === "reddit") {
    try {
      const reddit = await processReddit(today);
      summary.push(`reddit | TOTAL | posts:${reddit.totalPosts} comments:${reddit.totalComments}`);
    } catch (err) {
      console.log(`\n❌ Reddit error: ${err.message.slice(0, 150)}`);
      summary.push(`reddit | ERROR: ${err.message.slice(0, 80)}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  RESUMEN FINAL (${elapsed} min)`);
  console.log(`${"═".repeat(60)}`);
  for (const line of summary) console.log(`  ${line}`);
  console.log(`${"═".repeat(60)}\n`);
}

main().catch(err => {
  console.error(`\n💀 Error fatal: ${err.message}`);
  process.exit(1);
});
