#!/usr/bin/env node
/**
 * Scrape UNA cuenta: perfil + posts + comentarios
 * Uso: node scripts/scrape-single.mjs --brand "P.A.N." --network instagram
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
const brandName = args.includes("--brand") ? args[args.indexOf("--brand") + 1] : null;
const network = args.includes("--network") ? args[args.indexOf("--network") + 1] : null;
const postsLimit = args.includes("--posts") ? parseInt(args[args.indexOf("--posts") + 1]) : 20;

if (!brandName || !network) {
  console.error("Uso: node scripts/scrape-single.mjs --brand 'P.A.N.' --network instagram [--posts 20]");
  process.exit(1);
}

const ACTORS = {
  instagram: "apify~instagram-profile-scraper",
  facebook: "apify~facebook-pages-scraper",
  tiktok: "clockworks~free-tiktok-scraper",
  x: "apidojo~tweet-scraper",
};

// ── Supabase helpers ──
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

// ── Apify runner ──
async function runApify(actorId, input) {
  console.log(`   Ejecutando actor ${actorId}...`);
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify start: ${res.status} ${await res.text()}`);
  const { data } = await res.json();
  const runId = data.id;
  console.log(`   Run ID: ${runId}`);

  // Poll hasta completar
  let status = data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 5000));
    const check = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const checkData = await check.json();
    status = checkData.data.status;
    process.stdout.write(".");
  }
  console.log(` ${status}`);

  if (status !== "SUCCEEDED") throw new Error(`Apify run ${status}`);

  // Obtener usage
  const runInfo = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  const runData = await runInfo.json();
  const usage = runData.data?.usage;
  if (usage) {
    console.log(`   Usage — compute: $${(usage.ACTOR_COMPUTE_UNITS * 0.25).toFixed(4)}, dataset reads: ${usage.DATASET_READS || 0}`);
  }

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`);
  const items = await dataRes.json();
  return { items, runId };
}

// ── Input builders ──
function buildInput(net, username) {
  switch (net) {
    case "instagram":
      return {
        usernames: [username],
        resultsLimit: postsLimit,
        addParentData: true,
      };
    case "facebook":
      return {
        startUrls: [{ url: `https://www.facebook.com/${username}` }],
        maxPosts: postsLimit,
        maxComments: 50,
      };
    case "tiktok":
      return {
        profiles: [`https://www.tiktok.com/@${username}`],
        resultsPerPage: postsLimit,
        shouldDownloadVideos: false,
      };
    case "x":
      return {
        startUrls: [{ url: `https://x.com/${username}` }],
        maxTweets: postsLimit,
        mode: "profile",
      };
    default:
      return {};
  }
}

// ── Main ──
async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n🎯 Scrape individual — ${brandName} / ${network}`);
  console.log(`   Posts a traer: ${postsLimit}`);
  console.log(`   Fecha: ${today}\n`);

  // Buscar cuenta en Supabase
  const accounts = await sbGet("accounts", `brand_name=eq.${encodeURIComponent(brandName)}&network=eq.${network}&is_active=eq.true`);
  if (accounts.length === 0) {
    console.error(`❌ No se encontró cuenta activa para ${brandName} en ${network}`);
    process.exit(1);
  }
  const account = accounts[0];
  console.log(`   Cuenta: @${account.username} (${account.account_type})\n`);

  const actorId = ACTORS[network];
  if (!actorId) {
    console.error(`❌ Sin actor configurado para ${network}`);
    process.exit(1);
  }

  // Registrar run
  const [run] = await sbUpsert("scrape_runs", {
    run_type: "manual",
    network,
    status: "running",
    metadata: { brand: brandName, single: true, date: today },
  });

  try {
    const input = buildInput(network, account.username);
    console.log(`📡 Llamando a Apify...`);
    const { items, runId } = await runApify(actorId, input);
    console.log(`   Items recibidos: ${items.length}\n`);

    // Procesar según red
    let profileSaved = false;
    let postsSaved = 0;
    let commentsSaved = 0;

    if (network === "instagram") {
      for (const item of items) {
        // Si es perfil (tiene followersCount), guardar snapshot
        if (item.followersCount && !profileSaved) {
          await sbUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            followers: item.followersCount || 0,
            following: item.followsCount || 0,
            total_posts: item.postsCount || 0,
            raw_data: {
              fullName: item.fullName,
              biography: item.biography,
              verified: item.verified,
              isBusinessAccount: item.isBusinessAccount,
              businessCategory: item.businessCategoryName,
              profilePicUrl: item.profilePicUrl,
            },
          });
          console.log(`   ✅ Snapshot: ${(item.followersCount || 0).toLocaleString()} seguidores`);
          profileSaved = true;
        }

        // Procesar posts del perfil
        const posts = item.latestPosts || [];
        for (const post of posts) {
          const postIdNative = post.shortCode || post.id || `ig_${Date.now()}_${Math.random()}`;
          try {
            const [savedPost] = await sbUpsert("posts", {
              account_id: account.id,
              network: "instagram",
              post_id_native: postIdNative,
              post_url: post.url || `https://www.instagram.com/p/${postIdNative}/`,
              post_type: post.type || "unknown",
              caption: post.caption || "",
              likes: post.likesCount || 0,
              comments: post.commentsCount || 0,
              shares: 0,
              views: post.videoViewCount || 0,
              published_at: post.timestamp ? new Date(post.timestamp).toISOString() : null,
              raw_data: {
                ownerUsername: post.ownerUsername,
                dimensions: post.dimensions,
                displayUrl: post.displayUrl,
                isVideo: post.isVideo,
              },
            });
            postsSaved++;

            // Guardar comentarios del post
            const comments = post.latestComments || [];
            for (const c of comments) {
              const commentId = c.id || `igc_${postIdNative}_${Date.now()}_${Math.random()}`;
              try {
                await sbUpsert("comments", {
                  post_id: savedPost.id,
                  account_id: account.id,
                  network: "instagram",
                  comment_id_native: commentId,
                  author_username: c.ownerUsername || c.owner?.username || "",
                  author_name: c.ownerFullName || "",
                  text: c.text || "",
                  likes: c.likesCount || 0,
                  published_at: c.timestamp ? new Date(c.timestamp).toISOString() : null,
                  raw_data: c,
                });
                commentsSaved++;
              } catch (err) {
                // Duplicado, ignorar
              }
            }
          } catch (err) {
            console.log(`   ⚠️ Error en post ${postIdNative}: ${err.message.slice(0, 100)}`);
          }
        }
      }

      // Paso 2: Scraping de comentarios con actor dedicado
      if (postsSaved > 0) {
        const postUrls = [];
        const postIdMap = {};
        for (const item of items) {
          for (const post of (item.latestPosts || [])) {
            const sc = post.shortCode || post.id;
            if (sc && (post.commentsCount || 0) > 0) {
              const url = `https://www.instagram.com/p/${sc}/`;
              postUrls.push(url);
              // Buscar post_id en Supabase para linkear comentarios
              const saved = await sbGet("posts", `post_id_native=eq.${sc}&account_id=eq.${account.id}&select=id`);
              if (saved.length > 0) postIdMap[sc] = saved[0].id;
            }
          }
        }

        if (postUrls.length > 0) {
          console.log(`\n📡 Paso 2: Scraping comentarios de ${postUrls.length} posts con comentarios...`);
          const commentInput = {
            directUrls: postUrls,
            resultsLimit: 50,
          };
          const { items: commentItems } = await runApify("apify~instagram-comment-scraper", commentInput);
          console.log(`   Comentarios recibidos: ${commentItems.length}`);

          for (const c of commentItems) {
            const postCode = c.postShortCode || c.shortCode || "";
            const postId = postIdMap[postCode];
            if (!postId) continue;
            const commentId = c.id || `igc_${postCode}_${Date.now()}_${Math.random()}`;
            try {
              await sbUpsert("comments", {
                post_id: postId,
                account_id: account.id,
                network: "instagram",
                comment_id_native: commentId,
                author_username: c.ownerUsername || "",
                author_name: c.ownerFullName || c.ownerProfilePicUrl ? "" : "",
                text: c.text || "",
                likes: c.likesCount || c.likeCount || 0,
                replies_count: c.repliesCount || 0,
                published_at: c.timestamp ? new Date(c.timestamp).toISOString() : null,
                raw_data: c,
              });
              commentsSaved++;
            } catch (err) {
              // Duplicado, ignorar
            }
          }
          console.log(`   ✅ Comentarios guardados: ${commentsSaved}`);
        } else {
          console.log(`\n   ℹ️ Ningún post tiene comentarios para scrape`);
        }
      }
    } else if (network === "facebook") {
      for (const item of items) {
        // Snapshot del perfil
        if ((item.likes || item.followersCount) && !profileSaved) {
          await sbUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            followers: item.likes || item.followersCount || 0,
            following: 0,
            total_posts: item.postsCount || 0,
            raw_data: {
              name: item.name,
              categories: item.categories,
              rating: item.overallStarRating,
            },
          });
          console.log(`   ✅ Snapshot: ${(item.likes || item.followersCount || 0).toLocaleString()} seguidores`);
          profileSaved = true;
        }

        // Posts
        const posts = item.posts || [];
        for (const post of posts) {
          const postIdNative = post.postId || post.id || `fb_${Date.now()}_${Math.random()}`;
          try {
            const [savedPost] = await sbUpsert("posts", {
              account_id: account.id,
              network: "facebook",
              post_id_native: postIdNative,
              post_url: post.postUrl || post.url || "",
              post_type: post.type || "unknown",
              caption: post.text || post.message || "",
              likes: post.likesCount || post.likes || 0,
              comments: post.commentsCount || post.comments || 0,
              shares: post.sharesCount || post.shares || 0,
              views: post.viewsCount || 0,
              published_at: post.time ? new Date(post.time).toISOString() : null,
              raw_data: post,
            });
            postsSaved++;

            const comments = post.comments?.items || post.latestComments || [];
            for (const c of comments) {
              const commentId = c.id || c.commentId || `fbc_${postIdNative}_${Date.now()}_${Math.random()}`;
              try {
                await sbUpsert("comments", {
                  post_id: savedPost.id,
                  account_id: account.id,
                  network: "facebook",
                  comment_id_native: commentId,
                  author_username: c.profileUrl || "",
                  author_name: c.name || c.profileName || "",
                  text: c.text || c.message || "",
                  likes: c.likesCount || 0,
                  published_at: c.date ? new Date(c.date).toISOString() : null,
                  raw_data: c,
                });
                commentsSaved++;
              } catch (err) { /* duplicado */ }
            }
          } catch (err) {
            console.log(`   ⚠️ Error en post FB: ${err.message.slice(0, 100)}`);
          }
        }
      }
    } else if (network === "tiktok") {
      for (const item of items) {
        if (item.authorMeta && !profileSaved) {
          await sbUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            followers: item.authorMeta.fans || 0,
            following: item.authorMeta.following || 0,
            total_posts: item.authorMeta.video || 0,
            raw_data: { nickname: item.authorMeta.nickName, verified: item.authorMeta.verified, hearts: item.authorMeta.heart },
          });
          console.log(`   ✅ Snapshot: ${(item.authorMeta.fans || 0).toLocaleString()} seguidores`);
          profileSaved = true;
        }

        // Cada item ES un video/post en TikTok
        if (item.id) {
          const postIdNative = item.id;
          try {
            const [savedPost] = await sbUpsert("posts", {
              account_id: account.id,
              network: "tiktok",
              post_id_native: postIdNative,
              post_url: item.webVideoUrl || `https://www.tiktok.com/@${account.username}/video/${postIdNative}`,
              post_type: "video",
              caption: item.text || "",
              likes: item.diggCount || 0,
              comments: item.commentCount || 0,
              shares: item.shareCount || 0,
              views: item.playCount || 0,
              published_at: item.createTimeISO || null,
              raw_data: { musicMeta: item.musicMeta, covers: item.covers },
            });
            postsSaved++;

            const comments = item.comments || [];
            for (const c of comments) {
              const commentId = c.cid || `ttc_${postIdNative}_${Date.now()}_${Math.random()}`;
              try {
                await sbUpsert("comments", {
                  post_id: savedPost.id,
                  account_id: account.id,
                  network: "tiktok",
                  comment_id_native: commentId,
                  author_username: c.uniqueId || "",
                  author_name: c.nickName || "",
                  text: c.text || "",
                  likes: c.diggCount || 0,
                  replies_count: c.replyCommentTotal || 0,
                  published_at: c.createTimeISO || null,
                  raw_data: c,
                });
                commentsSaved++;
              } catch (err) { /* duplicado */ }
            }
          } catch (err) {
            console.log(`   ⚠️ Error en TikTok post: ${err.message.slice(0, 100)}`);
          }
        }
      }
    } else if (network === "x") {
      for (const item of items) {
        if (item.user && !profileSaved) {
          await sbUpsert("account_snapshots", {
            account_id: account.id,
            snapshot_date: today,
            followers: item.user.followers_count || 0,
            following: item.user.friends_count || 0,
            total_posts: item.user.statuses_count || 0,
            raw_data: { name: item.user.name, verified: item.user.verified, description: item.user.description },
          });
          console.log(`   ✅ Snapshot: ${(item.user.followers_count || 0).toLocaleString()} seguidores`);
          profileSaved = true;
        }

        const postIdNative = item.id_str || item.id || `x_${Date.now()}_${Math.random()}`;
        try {
          const [savedPost] = await sbUpsert("posts", {
            account_id: account.id,
            network: "x",
            post_id_native: postIdNative,
            post_url: `https://x.com/${account.username}/status/${postIdNative}`,
            post_type: item.quoted_status ? "quote" : item.in_reply_to_status_id ? "reply" : "tweet",
            caption: item.full_text || item.text || "",
            likes: item.favorite_count || 0,
            comments: item.reply_count || 0,
            shares: item.retweet_count || 0,
            views: item.views_count || 0,
            published_at: item.created_at ? new Date(item.created_at).toISOString() : null,
            raw_data: item,
          });
          postsSaved++;
        } catch (err) {
          console.log(`   ⚠️ Error en tweet: ${err.message.slice(0, 100)}`);
        }
      }
    }

    // Actualizar run
    await sbUpsert("scrape_runs", {
      id: run.id,
      run_type: "manual",
      network,
      status: "completed",
      completed_at: new Date().toISOString(),
      accounts_processed: 1,
      posts_scraped: postsSaved,
      apify_run_id: runId,
      metadata: { brand: brandName, single: true, date: today, comments: commentsSaved },
    });

    console.log(`\n📊 Resumen ${brandName} / ${network}:`);
    console.log(`   Snapshot: ${profileSaved ? "✅" : "❌"}`);
    console.log(`   Posts guardados: ${postsSaved}`);
    console.log(`   Comentarios guardados: ${commentsSaved}`);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    await sbUpsert("scrape_runs", {
      id: run.id,
      run_type: "manual",
      network,
      status: "failed",
      completed_at: new Date().toISOString(),
      error_message: err.message,
    });
    process.exit(1);
  }
}

main();
