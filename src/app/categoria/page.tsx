"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatNumber } from "@/lib/mock-data";
import type { MentionData } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";

const sentimentLabels: Record<string, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

const pieColors = ["#1DA1F2", "#000000", "#1877F2", "#FF4500", "#E4405F", "#0A66C2", "#34A853"];

function MentionCard({ mention }: { mention: MentionData }) {
  const sentColor =
    mention.sentiment === "positive"
      ? "text-emerald-600 bg-emerald-50"
      : mention.sentiment === "negative"
        ? "text-red-600 bg-red-50"
        : "text-amber-600 bg-amber-50";

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">
            {mention.network}
          </span>
          <span className="text-xs text-gray-400">{mention.author}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sentColor}`}>
          {sentimentLabels[mention.sentiment]}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{mention.text}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">{mention.date}</span>
        <span className="text-xs text-gray-400">
          {mention.likes > 0 && `${formatNumber(mention.likes)} likes`}
        </span>
      </div>
    </div>
  );
}

export default function EscuchaActivaPage() {
  const { sovData, sentimentByBrand, mentionsByNetwork, mentions, ownBrands } = useClientData();

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const allBrandNames = sovData.map((s) => s.brand);

  const sovChartData = sovData.map((s) => ({
    ...s,
    fill: ownBrands.some((b) => b.brand === s.brand) ? "#0d9488" : "#94a3b8",
  }));

  const networkPieData = mentionsByNetwork.map((m, i) => ({
    ...m,
    color: pieColors[i % pieColors.length],
  }));

  const filteredMentions = mentions.filter((m) => {
    if (brandFilter !== "all" && m.brand !== brandFilter) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    return true;
  });

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escucha Activa</h2>
        <p className="text-gray-500 text-sm mt-1">
          Qué dicen sobre las marcas y la categoría en redes sociales, foros y
          reseñas
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Share of Voice — Categoría completa
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Quién domina la conversación en redes sociales
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={sovChartData}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
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
              width={95}
              tick={{ fontSize: 12, fill: "#334155" }}
            />
            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(1) + "%",
                "SOV",
              ]}
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
        <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
          Cálculo: total de menciones públicas de cada marca en X, TikTok, Facebook, Instagram, LinkedIn, Reddit y Google Maps durante el período, dividido por el total de menciones de la categoría. Fuente: escucha activa por keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Sentimiento por marca
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Distribución positivo / neutral / negativo
          </p>
          <div className="space-y-3">
            {sentimentByBrand.slice(0, 8).map((s) => (
              <div key={s.brand}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {s.brand}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    +{s.positive}% / {s.neutral}% / -{s.negative}%
                  </span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="bg-emerald-500"
                    style={{ width: s.positive + "%" }}
                  />
                  <div
                    className="bg-amber-400"
                    style={{ width: s.neutral + "%" }}
                  />
                  <div
                    className="bg-red-400"
                    style={{ width: s.negative + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Positivo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Neutral
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Negativo
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Volumen de menciones por plataforma
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Dónde ocurren las conversaciones sobre la categoría
          </p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={networkPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="mentions"
                >
                  {networkPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    "Menciones",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {networkPieData.map((n) => (
                <div
                  key={n.network}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: n.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {n.network}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {n.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Menciones destacadas
            </h3>
            <p className="text-xs text-gray-400">
              Conversaciones relevantes encontradas por keywords
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">Todas las marcas</option>
              {allBrandNames.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">Todo sentimiento</option>
              <option value="positive">Positivo</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negativo</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMentions.map((m) => (
            <MentionCard key={m.id} mention={m} />
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
