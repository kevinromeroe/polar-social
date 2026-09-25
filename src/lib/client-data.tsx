"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import type { BrandData, MentionData, AlertData, TopPostData, SentimentCategorySummary, ChartAnnotation, CategoryTrend, BrandTopicMap, MentionVolume, NetworkIntelligence, CompetitorStrategy } from "./mock-data";

import * as polarData from "./mock-data";
import * as havolineData from "./mock-data-havoline";
import { fetchRealMentions, fetchRealTopPosts, fetchMentionsByNetwork, fetchSentimentByBrand, fetchSOVData, fetchCommentTrend, fetchBrandEngagement, fetchAccountSnapshots, fetchSOVByNetwork } from "./supabase-data";
import type { CommentTrendPoint, BrandEngagement, AccountSnapshot, SOVByNetworkEntry } from "./supabase-data";

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
  const filteredOwnBrands = dataset.ownBrands.filter(b => b.productLine === productLine || b.productLine === null);
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
    clientDescription: filteredOwnBrands.map(b => b.brand).join(" y "),
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
      const [mentions, topPosts, mentionsByNet, sentiment, sov, trend, engagement, snapshots, sovByNet] = await Promise.all([
        fetchRealMentions(),
        fetchRealTopPosts(),
        fetchMentionsByNetwork(),
        fetchSentimentByBrand(),
        fetchSOVData(),
        fetchCommentTrend(),
        fetchBrandEngagement(),
        fetchAccountSnapshots(),
        fetchSOVByNetwork(),
      ]);
      if (mentions.length > 0 || topPosts.length > 0) {
        setRealData({
          mentions: mentions.length > 0 ? mentions : undefined,
          topPosts: topPosts.length > 0 ? topPosts : undefined,
          mentionsByNetwork: mentionsByNet.length > 0 ? mentionsByNet : undefined,
          sentimentByBrand: sentiment.length > 0 ? sentiment : undefined,
          sovData: sov.length > 0 ? sov : undefined,
          commentTrend: trend.length > 0 ? trend : undefined,
          brandEngagement: engagement.length > 0 ? engagement : undefined,
          accountSnapshots: snapshots.length > 0 ? snapshots : undefined,
          sovByNetwork: Object.keys(sovByNet).length > 0 ? sovByNet : undefined,
        });
      }
    } catch {
      // Supabase no disponible, se usa mock data
    }
  }, []);

  useEffect(() => {
    if (user?.email) loadRealData();
  }, [user?.email, loadRealData]);

  const baseDataset = useMemo(() => {
    const email = user?.email ?? "";
    const mock = clients[email] ?? polarDataset;
    if (!realData || email === "havoline@datalitica.com.co") return mock;
    const merged = { ...mock, ...Object.fromEntries(Object.entries(realData).filter(([, v]) => v !== undefined)) } as ClientDataset;
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
