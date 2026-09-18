#!/usr/bin/env node
/**
 * Batch 2: Facebook posts+comments, TikTok comments, Reddit
 * Uso: node scripts/scrape-batch-2.mjs [--only facebook|tiktok-comments|reddit]
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
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

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
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
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
  if (!res.ok) throw new Error(`Apify start ${actorId}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const { data } = await res.json();
  const runId = data.id;

  let status = data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 5000));
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    status = (await check.json()).data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);
  if (status !== "SUCCEEDED") throw new Error(`Run ${status}`);

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`);
  return { items: await dataRes.json(), runId };
}

// ══════════════════════════════════════════
// FACEBOOK — posts + comments con nuevo actor
// ══════════════════════════════════════════
async function scrapeFacebook() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  FACEBOOK — Posts + Comentarios (thedoor~facebook-page-scraper)`);
  console.log(`${"═".repeat(60)}`);

  const accounts = await sbGet("accounts", "network=eq.facebook&is_active=eq.true&order=brand_name");
  const results = [];

  for (const account of accounts) {
    console.log(`\n   ▸ ${account.brand_name} — @${account.username}`);
    try {
      const { items } = await runApify("thedoor~facebook-page-scraper", {
        pageUrls: [`https://www.facebook.com/${account.username}`],
        postsToScrape: 50,
        postsNewerThan: "2026-06-01",
      });
      console.log(`      Items: ${items.length}`);

      let postsSaved = 0, commentsSaved = 0;

      // Snapshot del perfil (del primer post que tenga info de página)
      if (items.length > 0 && items[0].page) {
        try {
          await sbUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            followers: 0,
            following: 0,
            total_posts: items.length,
            raw_data: { page: items[0].page },
          });
        } catch (e) { /* dup snapshot */ }
      }

      for (const item of items) {
        const post = item.post || {};
        const engagement = item.engagement || {};
        const created = item.created || {};
        const pid = post.id || post.feedback_id || `fb_${Date.now()}_${Math.random()}`;

        try {
          const [savedPost] = await sbUpsert("posts", {
            account_id: account.id,
            network: "facebook",
            post_id_native: pid,
            post_url: post.url || "",
            post_type: post.type || "unknown",
            caption: post.text || "",
            likes: engagement.reactions || 0,
            comments: engagement.comments || 0,
            shares: engagement.shares || 0,
            views: engagement.views || 0,
            published_at: created.time || null,
            raw_data: {
              media: item.media,
              reaction_breakdown: engagement.reaction_breakdown,
              page: item.page,
            },
          });
          postsSaved++;

          // Comentarios top del post
          const topComments = item.comments?.top_comments || [];
          for (const c of topComments) {
            const cid = c.id || c.comment_id || `fbc2_${pid}_${Date.now()}_${Math.random()}`;
            try {
              await sbUpsert("comments", {
                post_id: savedPost.id,
                account_id: account.id,
                network: "facebook",
                comment_id_native: cid,
                author_username: c.author_url || c.profile_url || "",
                author_name: c.author_name || c.name || "",
                text: c.text || c.message || c.body || "",
                likes: c.likes || c.reactions || c.reaction_count || 0,
                published_at: c.created_time || c.timestamp || null,
                raw_data: c,
              });
              commentsSaved++;
            } catch (e) { /* dup */ }
          }
        } catch (e) { /* dup post */ }
      }

      results.push(`${account.brand_name} | posts:${postsSaved} comments:${commentsSaved}`);
      console.log(`      ✅ Posts: ${postsSaved}, Comentarios: ${commentsSaved}`);
    } catch (err) {
      results.push(`${account.brand_name} | ERROR: ${err.message.slice(0, 80)}`);
      console.log(`      ❌ ${err.message.slice(0, 150)}`);
    }
  }
  return results;
}

// ══════════════════════════════════════════
// TIKTOK COMMENTS — para posts ya guardados
// ══════════════════════════════════════════
async function scrapeTikTokComments() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  TIKTOK COMMENTS (clockworks~tiktok-comments-scraper)`);
  console.log(`${"═".repeat(60)}`);

  const accounts = await sbGet("accounts", "network=eq.tiktok&is_active=eq.true&order=brand_name");
  const results = [];

  for (const account of accounts) {
    // Obtener posts con comentarios > 0
    const posts = await sbGet("posts",
      `account_id=eq.${account.id}&network=eq.tiktok&comments=gt.0&select=id,post_url,post_id_native,comments&order=comments.desc&limit=20`);

    if (posts.length === 0) {
      console.log(`\n   ▸ ${account.brand_name} — sin posts con comentarios`);
      results.push(`${account.brand_name} | sin posts con comentarios`);
      continue;
    }

    console.log(`\n   ▸ ${account.brand_name} — ${posts.length} posts con comentarios`);
    const videoUrls = posts.map(p => p.post_url).filter(u => u && u.includes("/video/"));

    if (videoUrls.length === 0) {
      results.push(`${account.brand_name} | sin URLs de video válidas`);
      continue;
    }

    try {
      const { items } = await runApify("clockworks~tiktok-comments-scraper", {
        postURLs: videoUrls,
        commentsPerPost: 50,
        maxRepliesPerComment: 0,
      });
      console.log(`      Comentarios recibidos: ${items.length}`);

      const postIdMap = {};
      for (const p of posts) {
        postIdMap[p.post_url] = p.id;
        const videoId = p.post_url.match(/\/video\/(\d+)/)?.[1];
        if (videoId) postIdMap[videoId] = p.id;
      }

      let saved = 0;
      for (const c of items) {
        const videoUrl = c.videoWebUrl || c.submittedVideoUrl || c.input || "";
        const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1] || "";
        const postId = postIdMap[videoUrl] || postIdMap[videoId];
        if (!postId) continue;

        const cid = c.cid || `ttc2_${videoId}_${Date.now()}_${Math.random()}`;
        try {
          await sbUpsert("comments", {
            post_id: postId,
            account_id: account.id,
            network: "tiktok",
            comment_id_native: cid,
            author_username: c.uniqueId || "",
            author_name: "",
            text: c.text || "",
            likes: c.diggCount || 0,
            replies_count: c.replyCommentTotal || 0,
            published_at: c.createTimeISO || null,
            raw_data: c,
          });
          saved++;
        } catch (e) { /* dup */ }
      }

      results.push(`${account.brand_name} | comments:${saved}`);
      console.log(`      ✅ Comentarios guardados: ${saved}`);
    } catch (err) {
      results.push(`${account.brand_name} | ERROR: ${err.message.slice(0, 80)}`);
      console.log(`      ❌ ${err.message.slice(0, 150)}`);
    }
  }
  return results;
}

// ══════════════════════════════════════════
// REDDIT — búsqueda de menciones
// ══════════════════════════════════════════
async function scrapeReddit() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  REDDIT (trudax~reddit-scraper-lite)`);
  console.log(`${"═".repeat(60)}`);

  const searches = [
    { query: "harina PAN arepa", brand: "P.A.N." },
    { query: "Doria pasta Colombia", brand: "Doria" },
    { query: "atún Van Camps Colombia", brand: "Van Camp's" },
    { query: "Zenú alimentos", brand: "Zenú" },
    { query: "arepa colombiana", brand: "P.A.N." },
  ];

  const results = [];
  let totalPosts = 0, totalComments = 0;

  for (const search of searches) {
    console.log(`\n   🔍 "${search.query}" (${search.brand})`);
    try {
      const { items } = await runApify("trudax~reddit-scraper-lite", {
        startUrls: [{ url: `https://www.reddit.com/search/?q=${encodeURIComponent(search.query)}&sort=new` }],
        maxItems: 20,
        sort: "new",
      });
      console.log(`      Items: ${items.length}`);

      // Buscar/crear cuenta Reddit para la marca
      let redditAccounts = await sbGet("accounts",
        `brand_name=eq.${encodeURIComponent(search.brand)}&network=eq.reddit&select=id`);

      let accountId;
      if (redditAccounts.length > 0) {
        accountId = redditAccounts[0].id;
      } else {
        const [newAcc] = await sbUpsert("accounts", {
          brand_name: search.brand,
          network: "reddit",
          username: `search:${search.query}`,
          account_type: "own",
          is_active: true,
        });
        accountId = newAcc.id;
        console.log(`      Cuenta Reddit creada para ${search.brand}`);
      }

      let posts = 0, comments = 0;
      for (const item of items) {
        if (!item.id) continue;
        const pid = `reddit_${item.parsedId || item.id}`;
        const isComment = item.dataType === "comment";

        if (isComment) {
          // Es un comentario de Reddit, guardarlo como comment
          try {
            // Buscar si hay un post padre
            const parentUrl = item.url?.split("?")[0] || "";
            const parentPosts = await sbGet("posts",
              `post_url=eq.${encodeURIComponent(parentUrl)}&account_id=eq.${accountId}&select=id&limit=1`);

            await sbUpsert("comments", {
              post_id: parentPosts.length > 0 ? parentPosts[0].id : null,
              account_id: accountId,
              network: "reddit",
              comment_id_native: pid,
              author_username: item.username || "",
              author_name: "",
              text: item.body || item.title || "",
              likes: item.numberOfUpvotes || 0,
              published_at: item.createdAt || null,
              raw_data: { subreddit: item.communityName, url: item.url, dataType: item.dataType },
            });
            comments++;
          } catch (e) { /* dup */ }
        } else {
          // Es un post
          try {
            await sbUpsert("posts", {
              account_id: accountId,
              network: "reddit",
              post_id_native: pid,
              post_url: item.url || "",
              post_type: "post",
              caption: `${item.title || ""}\n\n${item.body || ""}`.trim(),
              likes: item.numberOfUpvotes || 0,
              comments: item.numberOfComments || 0,
              shares: 0, views: 0,
              published_at: item.createdAt || null,
              raw_data: { subreddit: item.communityName, author: item.username },
            });
            posts++;
          } catch (e) { /* dup */ }
        }
      }

      totalPosts += posts;
      totalComments += comments;
      results.push(`"${search.query}" | posts:${posts} comments:${comments}`);
      console.log(`      ✅ Posts: ${posts}, Comments: ${comments}`);
    } catch (err) {
      results.push(`"${search.query}" | ERROR: ${err.message.slice(0, 80)}`);
      console.log(`      ❌ ${err.message.slice(0, 150)}`);
    }
  }

  console.log(`\n   📊 Reddit total — Posts: ${totalPosts}, Comments: ${totalComments}`);
  return results;
}

// ══════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  const allResults = [];

  if (!only || only === "facebook") {
    const fb = await scrapeFacebook();
    allResults.push("FACEBOOK:", ...fb);
  }

  if (!only || only === "tiktok-comments") {
    const tt = await scrapeTikTokComments();
    allResults.push("TIKTOK COMMENTS:", ...tt);
  }

  if (!only || only === "reddit") {
    const rd = await scrapeReddit();
    allResults.push("REDDIT:", ...rd);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  RESUMEN BATCH 2 (${elapsed} min)`);
  console.log(`${"═".repeat(60)}`);
  for (const line of allResults) console.log(`  ${line}`);
  console.log(`${"═".repeat(60)}\n`);
}

main().catch(err => {
  console.error(`\n💀 Error fatal: ${err.message}`);
  process.exit(1);
});
