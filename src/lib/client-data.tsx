"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import type { BrandData, MentionData, AlertData, TopPostData, SentimentCategorySummary, ChartAnnotation, CategoryTrend, BrandTopicMap, MentionVolume, NetworkIntelligence, CompetitorStrategy } from "./mock-data";

import * as polarData from "./mock-data";
import * as havolineData from "./mock-data-havoline";
import { fetchAllRealData } from "./supabase-data";
import type { CommentTrendPoint, BrandEngagement, AccountSnapshot, SOVByNetworkEntry } from "./supabase-data";
import { supabase } from "./supabase";

export interface ClientDataset {
  brands: BrandData[];
  ownBrands: BrandData[];
  competitors: BrandData[];
  sovData: { brand: string; mentions: number; percentage: number }[];
  sentimentByBrand: { brand: string; positive: number; neutral: number; negative: number }[];
  growthTrend: Record<string, string | number>[];
  mentionsByNetwork: { network: string; mentions: number; percentage: number }[];
  topPosts: TopPostData[];
  mentions: MentionData[];
  alerts: AlertData[];
  googleMapsData: { brand: string; rating: number; totalReviews: number; recentCount: number }[];
  sentimentCategorySummaries: Record<string, SentimentCategorySummary>;
  brandColors: Record<string, string>;
  chartAnnotations: ChartAnnotation[];
  categoryTrends: CategoryTrend[];
  brandTopicMaps: BrandTopicMap[];
  mentionVolumeData: MentionVolume[];
  networkIntelligence: NetworkIntelligence[];
  competitorStrategies: CompetitorStrategy[];
  commentTrend: CommentTrendPoint[];
  brandEngagement: BrandEngagement[];
  accountSnapshots: AccountSnapshot[];
  sovByNetwork: Record<string, SOVByNetworkEntry[]>;
  productLineLabels: Record<string, string>;
  productLineKeys: string[];
  clientName: string;
  clientDescription: string;
}

export interface ProductLineOption {
  key: string;
  brandName: string;
  label: string;
}

export interface ClientContextValue extends ClientDataset {
  selectedProductLine: string;
  setSelectedProductLine: (line: string) => void;
  productLineOptions: ProductLineOption[];
  hasMultipleProductLines: boolean;
}

const polarDataset: ClientDataset = {
  brands: polarData.brands,
  ownBrands: polarData.ownBrands,
  competitors: polarData.competitors,
  sovData: polarData.sovData,
  sentimentByBrand: polarData.sentimentByBrand,
  growthTrend: polarData.growthTrend,
  mentionsByNetwork: polarData.mentionsByNetwork,
  topPosts: polarData.topPosts,
  mentions: polarData.mentions,
  alerts: polarData.alerts,
  googleMapsData: polarData.googleMapsData,
  sentimentCategorySummaries: polarData.sentimentCategorySummaries,
  brandColors: polarData.brandColors,
  chartAnnotations: polarData.chartAnnotations,
  categoryTrends: polarData.categoryTrends,
  brandTopicMaps: polarData.brandTopicMaps,
  mentionVolumeData: polarData.mentionVolumeData,
  networkIntelligence: polarData.networkIntelligence,
  competitorStrategies: polarData.competitorStrategies,
  commentTrend: [],
  brandEngagement: [],
  accountSnapshots: [],
  sovByNetwork: {},
  productLineLabels: polarData.productLineLabels,
  productLineKeys: polarData.productLineKeys,
  clientName: "Alimentos Polar",
  clientDescription: "P.A.N. (Pasta y Atún)",
};

const havolineDataset: ClientDataset = {
  brands: havolineData.brands,
  ownBrands: havolineData.ownBrands,
  competitors: havolineData.competitors,
  sovData: havolineData.sovData,
  sentimentByBrand: havolineData.sentimentByBrand,
  growthTrend: havolineData.growthTrend,
  mentionsByNetwork: havolineData.mentionsByNetwork,
  topPosts: havolineData.topPosts,
  mentions: havolineData.mentions,
  alerts: havolineData.alerts,
  googleMapsData: havolineData.googleMapsData,
  sentimentCategorySummaries: havolineData.sentimentCategorySummaries,
  brandColors: havolineData.brandColors,
  chartAnnotations: havolineData.chartAnnotations,
  categoryTrends: havolineData.categoryTrends,
  brandTopicMaps: havolineData.brandTopicMaps,
  mentionVolumeData: havolineData.mentionVolumeData,
  networkIntelligence: havolineData.networkIntelligence,
  competitorStrategies: havolineData.competitorStrategies,
  commentTrend: [],
  brandEngagement: [],
  accountSnapshots: [],
  sovByNetwork: {},
  productLineLabels: havolineData.productLineLabels,
  productLineKeys: havolineData.productLineKeys,
  clientName: "Havoline",
  clientDescription: "Havoline Colombia",
};

const clients: Record<string, ClientDataset> = {
  "admin@datalitica.com.co": polarDataset,
  "havoline@datalitica.com.co": havolineDataset,
};

function filterDatasetByProductLine(dataset: ClientDataset, productLine: string): ClientDataset {
  const filteredOwnBrands = dataset.ownBrands.filter(b => b.productLine === productLine || (b.productLine === null && !productLine.startsWith("mascotas_")));
  const filteredCompetitors = dataset.competitors.filter(b => b.productLine === productLine);
  const brandNamesInLine = new Set(
    [...filteredOwnBrands, ...filteredCompetitors].map(b => b.brand)
  );

  const filteredSov = dataset.sovData.filter(s => brandNamesInLine.has(s.brand));
  const totalMentions = filteredSov.reduce((sum, s) => sum + s.mentions, 0);
  const recalcSov = filteredSov.map(s => ({
    ...s,
    percentage: totalMentions > 0 ? Number(((s.mentions / totalMentions) * 100).toFixed(1)) : 0,
  }));

  const ownBrandNames = new Set(filteredOwnBrands.map(b => b.brand));
  const filteredGrowth = dataset.growthTrend.map(entry => {
    const filtered: Record<string, string | number> = { date: entry.date as string };
    for (const key of Object.keys(entry)) {
      if (key !== "date" && ownBrandNames.has(key)) {
        filtered[key] = entry[key];
      }
    }
    return filtered;
  });

  return {
    ...dataset,
    brands: [...filteredOwnBrands, ...filteredCompetitors],
    ownBrands: filteredOwnBrands,
    competitors: filteredCompetitors,
    sovData: recalcSov,
    sentimentByBrand: dataset.sentimentByBrand.filter(s => brandNamesInLine.has(s.brand)),
    growthTrend: filteredGrowth,
    topPosts: dataset.topPosts.filter(p => brandNamesInLine.has(p.brand)),
    mentions: dataset.mentions.filter(m =>
      brandNamesInLine.has(m.brand) && (!m.productLine || m.productLine === productLine || (productLine.startsWith("mascotas_") && m.productLine === "mascotas"))
    ),
    alerts: dataset.alerts.filter(a => brandNamesInLine.has(a.brand)),
    sovByNetwork: Object.fromEntries(
      Object.entries(dataset.sovByNetwork).map(([net, entries]) => {
        const filtered = entries.filter(e => brandNamesInLine.has(e.brand));
        const total = filtered.reduce((s, e) => s + e.comments, 0);
        return [net, filtered.map(e => ({ ...e, percentage: total > 0 ? Number(((e.comments / total) * 100).toFixed(1)) : 0 }))];
      })
    ),
    brandTopicMaps: dataset.brandTopicMaps.filter(b => brandNamesInLine.has(b.brand)),
    categoryTrends: dataset.categoryTrends.filter(() => !productLine.startsWith("mascotas_")),
    networkIntelligence: dataset.networkIntelligence.filter(() => !productLine.startsWith("mascotas_")),
    competitorStrategies: dataset.competitorStrategies.filter(s => brandNamesInLine.has(s.brand)),
    sentimentCategorySummaries: Object.fromEntries(
      Object.entries(dataset.sentimentCategorySummaries).filter(([brand]) => brandNamesInLine.has(brand))
    ),
    clientDescription: filteredOwnBrands.length > 0 ? filteredOwnBrands.map(b => b.brand).join(" y ") : filteredCompetitors.slice(0, 2).map(b => b.brand).join(", "),
  };
}

const defaultContext: ClientContextValue = {
  ...polarDataset,
  selectedProductLine: "",
  setSelectedProductLine: () => {},
  productLineOptions: [],
  hasMultipleProductLines: false,
};

const ClientDataContext = createContext<ClientContextValue>(defaultContext);

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [realData, setRealData] = useState<Partial<ClientDataset> | null>(null);

  const loadRealData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("[Supabase] No hay sesión autenticada activa");
        return;
      }
      const tokenExp = session.expires_at ? new Date(session.expires_at * 1000) : null;
      const isExpired = tokenExp && tokenExp < new Date();
      if (isExpired) {
        const { error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr) {
          console.warn("[Supabase] No se pudo refrescar token:", refreshErr.message);
        }
      }
      const result = await fetchAllRealData();
      const counts = {
        mentions: result.mentions.length, topPosts: result.topPosts.length,
        mentionsByNet: result.mentionsByNetwork.length, sentiment: result.sentimentByBrand.length,
        sov: result.sovData.length, trend: result.commentTrend.length,
        engagement: result.brandEngagement.length, snapshots: result.accountSnapshots.length,
        sovByNet: Object.keys(result.sovByNetwork).length,
      };
      console.log("[Supabase] Datos cargados:", counts);
      const hasAny = Object.values(counts).some(c => c > 0);
      if (hasAny) {
        setRealData({
          mentions: result.mentions.length > 0 ? result.mentions : undefined,
          topPosts: result.topPosts.length > 0 ? result.topPosts : undefined,
          mentionsByNetwork: result.mentionsByNetwork.length > 0 ? result.mentionsByNetwork : undefined,
          sentimentByBrand: result.sentimentByBrand.length > 0 ? result.sentimentByBrand : undefined,
          sovData: result.sovData.length > 0 ? result.sovData : undefined,
          commentTrend: result.commentTrend.length > 0 ? result.commentTrend : undefined,
          brandEngagement: result.brandEngagement.length > 0 ? result.brandEngagement : undefined,
          accountSnapshots: result.accountSnapshots.length > 0 ? result.accountSnapshots : undefined,
          sovByNetwork: Object.keys(result.sovByNetwork).length > 0 ? result.sovByNetwork : undefined,
        });
      } else {
        console.warn("[Supabase] Todas las consultas retornaron vacío - verificar RLS policies");
      }
    } catch (err) {
      console.error("[Supabase] Error cargando datos:", err);
    }
  }, []);

  useEffect(() => {
    if (user?.email) loadRealData();
  }, [user?.email, loadRealData]);

  const baseDataset = useMemo(() => {
    const email = user?.email ?? "";
    const mock = clients[email] ?? polarDataset;
    if (!realData || email === "havoline@datalitica.com.co") return mock;
    const merged = { ...mock } as ClientDataset;

    if (realData.mentions && realData.mentions.length > 0) merged.mentions = realData.mentions;
    if (realData.mentionsByNetwork && realData.mentionsByNetwork.length > 0) merged.mentionsByNetwork = realData.mentionsByNetwork;
    if (realData.commentTrend && realData.commentTrend.length > 0) merged.commentTrend = realData.commentTrend;
    if (realData.brandEngagement && realData.brandEngagement.length > 0) merged.brandEngagement = realData.brandEngagement;
    if (realData.accountSnapshots && realData.accountSnapshots.length > 0) merged.accountSnapshots = realData.accountSnapshots;
    if (realData.sovByNetwork && Object.keys(realData.sovByNetwork).length > 0) merged.sovByNetwork = realData.sovByNetwork;

    if (realData.sentimentByBrand && realData.sentimentByBrand.length > 0) {
      const realBrandsSent = new Set(realData.sentimentByBrand.map(s => s.brand));
      const mockMissing = mock.sentimentByBrand.filter(s => !realBrandsSent.has(s.brand));
      merged.sentimentByBrand = [...realData.sentimentByBrand, ...mockMissing];
    }
    if (realData.sovData && realData.sovData.length > 0) {
      const realBrandsSov = new Set(realData.sovData.map(s => s.brand));
      const mockMissing = mock.sovData.filter(s => !realBrandsSov.has(s.brand));
      const combined = [...realData.sovData, ...mockMissing];
      const total = combined.reduce((s, e) => s + e.mentions, 0);
      merged.sovData = combined.map(e => ({ ...e, percentage: total > 0 ? Number(((e.mentions / total) * 100).toFixed(1)) : 0 })).sort((a, b) => b.mentions - a.mentions);
    }

    if (realData.topPosts && realData.topPosts.length > 0) {
      const realBrands = new Set(realData.topPosts.map(p => p.brand));
      const mockImagesByBrandNet: Record<string, string[]> = {};
      for (const p of mock.topPosts) {
        if (p.imageUrl && p.imageUrl.startsWith("/")) {
          const key = `${p.brand}|${p.network}`;
          if (!mockImagesByBrandNet[key]) mockImagesByBrandNet[key] = [];
          if (!mockImagesByBrandNet[key].includes(p.imageUrl)) mockImagesByBrandNet[key].push(p.imageUrl);
        }
      }
      const realWithImages = realData.topPosts.map(p => {
        const isLocalImage = p.imageUrl && p.imageUrl.startsWith("/");
        if (!isLocalImage) {
          const key = `${p.brand}|${p.network}`;
          const localImages = mockImagesByBrandNet[key];
          if (localImages && localImages.length > 0) {
            return { ...p, imageUrl: localImages[0] };
          }
          return { ...p, imageUrl: undefined };
        }
        return p;
      });
      const mockForMissingBrands = mock.topPosts.filter(p => !realBrands.has(p.brand));
      merged.topPosts = [...realWithImages, ...mockForMissingBrands];
    }
    return merged;
  }, [user?.email, realData]);

  const productLineOptions = useMemo<ProductLineOption[]>(() => {
    if (baseDataset.productLineKeys.length <= 1) return [];
    const ownBrandName = baseDataset.ownBrands[0]?.brand ?? "";
    return baseDataset.productLineKeys.map(key => ({
      key,
      brandName: ownBrandName,
      label: baseDataset.productLineLabels[key] || key,
    }));
  }, [baseDataset]);

  const [selectedProductLine, setSelectedProductLine] = useState<string>("");

  useEffect(() => {
    if (productLineOptions.length > 0 && !productLineOptions.some(o => o.key === selectedProductLine)) {
      setSelectedProductLine(productLineOptions[0].key);
    }
  }, [productLineOptions, selectedProductLine]);

  const effectiveProductLine = useMemo(() => {
    if (productLineOptions.length === 0) return "";
    if (productLineOptions.some(o => o.key === selectedProductLine)) return selectedProductLine;
    return productLineOptions[0].key;
  }, [productLineOptions, selectedProductLine]);

  const filteredDataset = useMemo(() => {
    if (!effectiveProductLine || productLineOptions.length <= 1) return baseDataset;
    return filterDatasetByProductLine(baseDataset, effectiveProductLine);
  }, [baseDataset, effectiveProductLine, productLineOptions]);

  const contextValue = useMemo<ClientContextValue>(() => ({
    ...filteredDataset,
    selectedProductLine: effectiveProductLine,
    setSelectedProductLine,
    productLineOptions,
    hasMultipleProductLines: productLineOptions.length > 1,
  }), [filteredDataset, effectiveProductLine, productLineOptions]);

  return (
    <ClientDataContext.Provider value={contextValue}>
      {children}
    </ClientDataContext.Provider>
  );
}

export function useClientData(): ClientContextValue {
  return useContext(ClientDataContext);
}
