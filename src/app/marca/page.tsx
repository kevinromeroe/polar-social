"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { supabase } from "@/lib/supabase";
import type { Account, AccountSnapshot, Post } from "@/types/database";

const networkLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

const networkColors: Record<string, string> = {
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
  tiktok: "bg-gray-900",
  linkedin: "bg-blue-700",
  x: "bg-gray-800",
};

interface BrandData {
  brand: string;
  accounts: Account[];
  snapshots: Map<string, AccountSnapshot[]>;
  topPosts: Post[];
}

export default function MarcaPage() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: accounts } = await supabase
          .from("accounts")
          .select("*")
          .eq("account_type", "own")
          .eq("is_active", true);

        if (!accounts) return;

        const brandNames = [...new Set(accounts.map((a: Account) => a.brand_name))];
        const allBrands: BrandData[] = [];

        for (const name of brandNames) {
          const brandAccounts = accounts.filter((a: Account) => a.brand_name === name);
          const accountIds = brandAccounts.map((a: Account) => a.id);

          const { data: snapshots } = await supabase
            .from("account_snapshots")
            .select("*")
            .in("account_id", accountIds)
            .order("snapshot_date", { ascending: false })
            .limit(100);

          const snapshotMap = new Map<string, AccountSnapshot[]>();
          snapshots?.forEach((s: AccountSnapshot) => {
            const existing = snapshotMap.get(s.account_id) ?? [];
            existing.push(s);
            snapshotMap.set(s.account_id, existing);
          });

          const { data: topPosts } = await supabase
            .from("posts")
            .select("*")
            .in("account_id", accountIds)
            .order("engagement_total", { ascending: false })
            .limit(10);

          allBrands.push({
            brand: name,
            accounts: brandAccounts,
            snapshots: snapshotMap,
            topPosts: topPosts ?? [],
          });
        }

        setBrands(allBrands);
        if (brandNames.length > 0) setSelectedBrand(brandNames[0]);
      } catch (err) {
        console.error("Error loading brands:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentBrand = brands.find((b) => b.brand === selectedBrand);

  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Nuestras Marcas</h2>
        <p className="text-gray-500 mt-1">
          Desempeño en redes sociales — Buena Mesa y Pasta P.A.N.
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        {brands.map((b) => (
          <button
            key={b.brand}
            onClick={() => setSelectedBrand(b.brand)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              selectedBrand === b.brand
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {b.brand}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : currentBrand ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBrand.accounts.map((account) => {
              const snaps = currentBrand.snapshots.get(account.id) ?? [];
              const latest = snaps[0];

              return (
                <div
                  key={account.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${
                        networkColors[account.network]
                      } flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {account.network === "x"
                        ? "X"
                        : account.network.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {networkLabels[account.network]}
                      </p>
                      <p className="text-sm text-gray-500">@{account.username}</p>
                    </div>
                  </div>

                  {latest ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Seguidores</p>
                        <p className="text-lg font-bold text-gray-900">
                          {(latest.followers ?? 0).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posts</p>
                        <p className="text-lg font-bold text-gray-900">
                          {(latest.total_posts ?? 0).toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Sin datos aún</p>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top publicaciones por engagement
            </h3>
            {currentBrand.topPosts.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Red
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Tipo
                      </th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">
                        Caption
                      </th>
                      <th className="text-right px-6 py-3 text-gray-500 font-medium">
                        Likes
                      </th>
                      <th className="text-right px-6 py-3 text-gray-500 font-medium">
                        Comments
                      </th>
                      <th className="text-right px-6 py-3 text-gray-500 font-medium">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentBrand.topPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-900">
                          {networkLabels[post.network] ?? post.network}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {post.post_type ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                          {post.caption?.slice(0, 80) ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-900">
                          {post.likes.toLocaleString("es-CO")}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-900">
                          {post.comments.toLocaleString("es-CO")}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-gray-900">
                          {post.engagement_total.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Sin publicaciones aún. Ejecuta el primer scraping para ver datos.
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Sin marcas configuradas.</p>
      )}
    </ProtectedLayout>
  );
}
