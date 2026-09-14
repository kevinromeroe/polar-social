"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/database";

interface HashtagStat {
  tag: string;
  count: number;
  totalEngagement: number;
}

export default function CategoriaPage() {
  const [topHashtags, setTopHashtags] = useState<HashtagStat[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: posts } = await supabase
          .from("posts")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(500);

        if (posts) {
          setRecentPosts(posts.slice(0, 20) as Post[]);

          const hashtagMap = new Map<string, HashtagStat>();
          (posts as Post[]).forEach((post) => {
            post.hashtags?.forEach((tag) => {
              const lower = tag.toLowerCase().replace(/^#/, "");
              const existing = hashtagMap.get(lower) ?? {
                tag: lower,
                count: 0,
                totalEngagement: 0,
              };
              existing.count++;
              existing.totalEngagement += post.engagement_total ?? 0;
              hashtagMap.set(lower, existing);
            });
          });

          const sorted = Array.from(hashtagMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
          setTopHashtags(sorted);
        }
      } catch (err) {
        console.error("Error loading category data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Análisis de Categoría
        </h2>
        <p className="text-gray-500 mt-1">
          Tendencias, hashtags y conversación en la categoría de pastas
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hashtags más usados
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {topHashtags.length > 0 ? (
                <div className="space-y-3">
                  {topHashtags.map((h, i) => (
                    <div
                      key={h.tag}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-5 text-right">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          #{h.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {h.count} posts
                        </span>
                        <span className="text-xs text-blue-600 font-medium">
                          {h.totalEngagement.toLocaleString("es-CO")} eng
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin datos de hashtags.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Publicaciones recientes en la categoría
            </h3>
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 uppercase">
                        {post.network}
                      </span>
                      <span className="text-xs text-gray-400">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString(
                              "es-CO"
                            )
                          : "—"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {post.caption ?? "Sin caption"}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>{post.likes.toLocaleString("es-CO")} likes</span>
                      <span>
                        {post.comments.toLocaleString("es-CO")} comments
                      </span>
                      <span>{post.shares.toLocaleString("es-CO")} shares</span>
                      {post.views > 0 && (
                        <span>
                          {post.views.toLocaleString("es-CO")} views
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">
                  Sin publicaciones aún. Ejecuta el scraping para poblar datos.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
