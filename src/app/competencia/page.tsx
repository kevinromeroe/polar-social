"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { supabase } from "@/lib/supabase";
import type { Account, AccountSnapshot } from "@/types/database";
import type { ProductLine } from "@/types/database";

const lineLabels: Record<ProductLine, string> = {
  pasta: "Pasta",
  pasta_atun: "Pasta Atún",
};

interface CompetitorData {
  account: Account;
  latestSnapshot: AccountSnapshot | null;
  postCount30d: number;
  engagement30d: number;
}

export default function CompetenciaPage() {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [selectedLine, setSelectedLine] = useState<ProductLine | "all">("all");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: accounts } = await supabase
          .from("accounts")
          .select("*")
          .eq("account_type", "competitor")
          .eq("is_active", true);

        if (!accounts) return;

        const results: CompetitorData[] = [];

        for (const account of accounts as Account[]) {
          const { data: snapshots } = await supabase
            .from("account_snapshots")
            .select("*")
            .eq("account_id", account.id)
            .order("snapshot_date", { ascending: false })
            .limit(1);

          const thirtyDaysAgo = new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString();

          const { data: posts, count } = await supabase
            .from("posts")
            .select("engagement_total", { count: "exact" })
            .eq("account_id", account.id)
            .gte("published_at", thirtyDaysAgo);

          const engagement = posts?.reduce(
            (sum, p: { engagement_total: number }) => sum + (p.engagement_total ?? 0),
            0
          ) ?? 0;

          results.push({
            account,
            latestSnapshot: snapshots?.[0] ?? null,
            postCount30d: count ?? 0,
            engagement30d: engagement,
          });
        }

        setCompetitors(results);
      } catch (err) {
        console.error("Error loading competitors:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filtered = competitors.filter((c) => {
    if (selectedLine !== "all" && c.account.product_line !== selectedLine)
      return false;
    if (selectedNetwork !== "all" && c.account.network !== selectedNetwork)
      return false;
    return true;
  });

  const brandGroups = new Map<string, CompetitorData[]>();
  filtered.forEach((c) => {
    const existing = brandGroups.get(c.account.brand_name) ?? [];
    existing.push(c);
    brandGroups.set(c.account.brand_name, existing);
  });

  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Competencia</h2>
        <p className="text-gray-500 mt-1">
          Monitoreo de competidores — Pasta y Pasta Atún
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-2">
          {(["all", "pasta", "pasta_atun"] as const).map((line) => (
            <button
              key={line}
              onClick={() => setSelectedLine(line)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLine === line
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {line === "all" ? "Todas" : lineLabels[line]}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-gray-200 self-center" />
        <div className="flex gap-2">
          {["all", "instagram", "facebook", "tiktok", "linkedin", "x"].map(
            (net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedNetwork === net
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {net === "all"
                  ? "Todas"
                  : net === "x"
                    ? "X"
                    : net.charAt(0).toUpperCase() + net.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Marca
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Red
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Línea
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Seguidores
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Posts (30d)
                </th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">
                  Engagement (30d)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered
                  .sort(
                    (a, b) =>
                      (b.latestSnapshot?.followers ?? 0) -
                      (a.latestSnapshot?.followers ?? 0)
                  )
                  .map((c) => (
                    <tr key={c.account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {c.account.brand_name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {c.account.network === "x"
                          ? "X"
                          : c.account.network.charAt(0).toUpperCase() +
                            c.account.network.slice(1)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {c.account.product_line
                            ? lineLabels[c.account.product_line]
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-900">
                        {c.latestSnapshot?.followers?.toLocaleString("es-CO") ??
                          "—"}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-900">
                        {c.postCount30d}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {c.engagement30d.toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Sin datos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </ProtectedLayout>
  );
}
