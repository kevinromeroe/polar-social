"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { supabase } from "@/lib/supabase";
import type { Account, AccountSnapshot } from "@/types/database";
import {
  Users,
  FileText,
  Heart,
  TrendingUp,
  Building2,
} from "lucide-react";

interface BrandSummary {
  brand: string;
  accounts: Account[];
  latestSnapshots: AccountSnapshot[];
  totalFollowers: number;
  totalPosts: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === "number" ? value.toLocaleString("es-CO") : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function BrandCard({ brand }: { brand: BrandSummary }) {
  const networks = brand.accounts.map((a) => a.network);
  const networkLabels: Record<string, string> = {
    instagram: "IG",
    facebook: "FB",
    tiktok: "TK",
    linkedin: "LI",
    x: "X",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">{brand.brand}</h3>
      <div className="flex gap-2 mt-2">
        {networks.map((n) => (
          <span
            key={n}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium"
          >
            {networkLabels[n] || n}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Seguidores totales</p>
          <p className="text-xl font-bold text-gray-900">
            {brand.totalFollowers.toLocaleString("es-CO")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Posts totales</p>
          <p className="text-xl font-bold text-gray-900">
            {brand.totalPosts.toLocaleString("es-CO")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [competitorCount, setCompetitorCount] = useState(0);
  const [totalEngagement, setTotalEngagement] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: accounts } = await supabase
          .from("accounts")
          .select("*")
          .eq("account_type", "own");

        const { data: competitors } = await supabase
          .from("accounts")
          .select("id")
          .eq("account_type", "competitor");

        setCompetitorCount(competitors?.length ?? 0);

        if (accounts && accounts.length > 0) {
          const brandNames = [...new Set(accounts.map((a: Account) => a.brand_name))];
          const summaries: BrandSummary[] = [];

          for (const name of brandNames) {
            const brandAccounts = accounts.filter((a: Account) => a.brand_name === name);
            const accountIds = brandAccounts.map((a: Account) => a.id);

            const { data: snapshots } = await supabase
              .from("account_snapshots")
              .select("*")
              .in("account_id", accountIds)
              .order("snapshot_date", { ascending: false });

            const latestByAccount = new Map<string, AccountSnapshot>();
            snapshots?.forEach((s: AccountSnapshot) => {
              if (!latestByAccount.has(s.account_id)) {
                latestByAccount.set(s.account_id, s);
              }
            });

            const latestSnapshots = Array.from(latestByAccount.values());
            const totalFollowers = latestSnapshots.reduce(
              (sum, s) => sum + (s.followers ?? 0),
              0
            );
            const totalPosts = latestSnapshots.reduce(
              (sum, s) => sum + (s.total_posts ?? 0),
              0
            );

            summaries.push({
              brand: name,
              accounts: brandAccounts,
              latestSnapshots,
              totalFollowers,
              totalPosts,
            });
          }
          setBrands(summaries);
        }

        const { data: recentPosts } = await supabase
          .from("posts")
          .select("engagement_total")
          .gte(
            "published_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          );

        const eng = recentPosts?.reduce(
          (sum, p: { engagement_total: number }) => sum + (p.engagement_total ?? 0),
          0
        );
        setTotalEngagement(eng ?? 0);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalFollowers = brands.reduce((s, b) => s + b.totalFollowers, 0);

  return (
    <ProtectedLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Resumen general — Alimentos Polar
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Seguidores totales"
              value={totalFollowers}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              label="Marcas propias"
              value={brands.length}
              icon={Building2}
              color="bg-green-500"
            />
            <StatCard
              label="Competidores monitoreados"
              value={competitorCount}
              icon={TrendingUp}
              color="bg-orange-500"
            />
            <StatCard
              label="Engagement (30 días)"
              value={totalEngagement}
              icon={Heart}
              color="bg-pink-500"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuestras Marcas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((b) => (
                <BrandCard key={b.brand} brand={b} />
              ))}
              {brands.length === 0 && (
                <p className="text-gray-400 text-sm col-span-2">
                  Sin datos aún. Conecta Supabase y ejecuta el primer scraping.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </ProtectedLayout>
  );
}

