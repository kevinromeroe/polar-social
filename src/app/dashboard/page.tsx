"use client";

import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  Users,
  TrendingUp,
  MessageCircle,
  ThumbsUp,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import { getTotalFollowers, getAvgEngagement, formatNumber } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";

function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const severityStyles = {
  info: "border-l-blue-400 bg-blue-50",
  warning: "border-l-amber-400 bg-amber-50",
  critical: "border-l-red-400 bg-red-50",
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: Zap,
};

export default function DashboardPage() {
  const { ownBrands, sovData, growthTrend, alerts, clientDescription } = useClientData();

  const totalFollowersOwn = ownBrands.reduce((s, b) => s + getTotalFollowers(b), 0);
  const avgEngOwn =
    ownBrands.reduce((s, b) => s + getAvgEngagement(b), 0) / ownBrands.length;
  const totalMentions = sovData
    .filter((s) => ownBrands.some((b) => b.brand === s.brand))
    .reduce((s, d) => s + d.mentions, 0);
  const ownSentimentAvg = 70;

  const sovChartData = sovData.slice(0, 8).map((s) => ({
    ...s,
    fill: ownBrands.some((b) => b.brand === s.brand) ? "#0d9488" : "#94a3b8",
  }));

  const ownBrandNames = ownBrands.map((b) => b.brand);
  const lineColors = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444"];

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Resumen</h2>
        <p className="text-gray-500 text-sm mt-1">
          Vista ejecutiva — todas las marcas y redes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Seguidores totales"
          value={formatNumber(totalFollowersOwn)}
          subtitle="Todas las marcas propias"
          icon={Users}
          color="bg-teal-600"
        />
        <KpiCard
          label="Engagement promedio"
          value={avgEngOwn.toFixed(1) + "%"}
          subtitle="Últimos 30 días"
          icon={TrendingUp}
          color="bg-indigo-600"
        />
        <KpiCard
          label="Menciones del período"
          value={formatNumber(totalMentions)}
          subtitle="Escucha activa, 7 redes"
          icon={MessageCircle}
          color="bg-amber-600"
        />
        <KpiCard
          label="Sentimiento neto"
          value={"+" + ownSentimentAvg + "%"}
          subtitle="Positivo predominante"
          icon={ThumbsUp}
          color="bg-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Share of Voice — Categoría
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Porcentaje de menciones por marca (top 8)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sovChartData}
              layout="vertical"
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => v + "%"}
              />
              <YAxis
                dataKey="brand"
                type="category"
                width={90}
                tick={{ fontSize: 12, fill: "#334155" }}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1) + "%", "SOV"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} fill="#94a3b8">
                {sovChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Crecimiento de seguidores
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Marcas propias — total consolidado (últimos 6 meses)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={growthTrend}
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("es-CO"),
                  "",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {ownBrandNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={lineColors[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Alertas y cambios significativos
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = severityIcons[alert.severity];
            return (
              <div
                key={i}
                className={`border-l-4 rounded-r-lg p-4 ${severityStyles[alert.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] font-medium text-gray-400 uppercase">
                        {alert.brand}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {alert.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedLayout>
  );
}
