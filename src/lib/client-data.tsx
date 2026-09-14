"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import type { BrandData, MentionData, AlertData, TopPostData } from "./mock-data";

import * as polarData from "./mock-data";
import * as havolineData from "./mock-data-havoline";

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
  productLineLabels: Record<string, string>;
  productLineKeys: string[];
  clientName: string;
  clientDescription: string;
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
  productLineLabels: polarData.productLineLabels,
  productLineKeys: polarData.productLineKeys,
  clientName: "Alimentos Polar",
  clientDescription: "Buena Mesa y Pasta P.A.N.",
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
  productLineLabels: havolineData.productLineLabels,
  productLineKeys: havolineData.productLineKeys,
  clientName: "Havoline",
  clientDescription: "Havoline y Delo",
};

const clients: Record<string, ClientDataset> = {
  "admin@datalitica.com.co": polarDataset,
  "havoline@datalitica.com.co": havolineDataset,
};

const ClientDataContext = createContext<ClientDataset>(polarDataset);

export function ClientDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const dataset = useMemo(() => {
    const email = user?.email ?? "";
    return clients[email] ?? polarDataset;
  }, [user?.email]);

  return (
    <ClientDataContext.Provider value={dataset}>
      {children}
    </ClientDataContext.Provider>
  );
}

export function useClientData(): ClientDataset {
  return useContext(ClientDataContext);
}
