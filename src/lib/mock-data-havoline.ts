import type { BrandData, MentionData, AlertData, TopPostData, SentimentCategorySummary, ChartAnnotation, TopComment, CategoryTrend, BrandTopicMap, MentionVolume, NetworkIntelligence, CompetitorStrategy } from "./mock-data";

export const brands: BrandData[] = [
  {
    brand: "Valvoline",
    type: "own",
    productLine: "automotriz",
    networks: {
      instagram: { username: "valvolineglobalco", followers: 17439, posts: 130, engagementRate: 1.65, growth: 1.5, avgLikes: 279, avgComments: 12, avgShares: 0 },
      facebook: { username: "ValvolineGlobalCO", followers: 109977, posts: 130, engagementRate: 0.21, growth: 0.5, avgLikes: 184, avgComments: 0, avgShares: 51 },
    },
  },
  {
    brand: "Shell",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "shell_colombia", followers: 50000, posts: 200, engagementRate: 1.2, growth: 1.0, avgLikes: 400, avgComments: 10, avgShares: 0 },
      facebook: { username: "ShellColombia", followers: 80000, posts: 150, engagementRate: 0.15, growth: 0.5, avgLikes: 100, avgComments: 0, avgShares: 20 },
    },
  },
  {
    brand: "Mobil",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "mobil.lubricantescol", followers: 35293, posts: 111, engagementRate: 1.68, growth: 2.0, avgLikes: 580, avgComments: 13, avgShares: 0 },
    },
  },
  {
    brand: "Liqui Moly",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "liquimoly.colombia", followers: 54642, posts: 162, engagementRate: 0.11, growth: 1.2, avgLikes: 58, avgComments: 2, avgShares: 0 },
      facebook: { username: "LiquiMolyColombia", followers: 61737, posts: 88, engagementRate: 0.07, growth: 0.3, avgLikes: 40, avgComments: 0, avgShares: 5 },
    },
  },
];

export const ownBrands = brands.filter((b) => b.type === "own");
export const competitors = brands.filter((b) => b.type === "competitor");

export const brandColors: Record<string, string> = {
  Valvoline: "#C8102E",
  Shell: "#FBCE07",
  Mobil: "#002F87",
  "Liqui Moly": "#003DA5",
};

export const sovData = [
  { brand: "Valvoline", mentions: 535, percentage: 43.2 },
  { brand: "Shell", mentions: 317, percentage: 25.6 },
  { brand: "Mobil", mentions: 281, percentage: 22.7 },
  { brand: "Liqui Moly", mentions: 104, percentage: 8.4 },
];

export const sentimentByBrand = [
  { brand: "Valvoline", positive: 14, neutral: 84, negative: 2 },
  { brand: "Shell", positive: 13, neutral: 84, negative: 3 },
  { brand: "Mobil", positive: 14, neutral: 83, negative: 3 },
  { brand: "Liqui Moly", positive: 12, neutral: 85, negative: 3 },
];

export const growthTrend = [
  { date: "Dic", "Valvoline": 1653 },
  { date: "Ene", "Valvoline": 554 },
  { date: "Feb", "Valvoline": 4649 },
  { date: "Mar", "Valvoline": 45746 },
  { date: "Abr", "Valvoline": 881 },
  { date: "May", "Valvoline": 6029 },
  { date: "Jun", "Valvoline": 1473 },
  { date: "Jul", "Valvoline": 6550 },
  { date: "Ago", "Valvoline": 256 },
];

export const mentionsByNetwork = [
  { network: "Instagram", mentions: 143423, percentage: 80.2 },
  { network: "Facebook", mentions: 35373, percentage: 19.8 },
];

const IMG = "https://tidctfgcbzziiqnbjjer.supabase.co/storage/v1/object/public/post-images";

export const topPosts: TopPostData[] = [];


export const mentions: MentionData[] = [];

export const alerts: AlertData[] = [];

export const sentimentCategorySummaries: Record<string, SentimentCategorySummary> = {};

export const googleMapsData: { brand: string; rating: number; totalReviews: number; recentCount: number }[] = [];

export const productLineLabels: Record<string, string> = {
  carros: "Carros",
};

export const productLineKeys = ["carros"];

export const chartAnnotations: ChartAnnotation[] = [];

export const categoryTrends: CategoryTrend[] = [];

export const brandTopicMaps: BrandTopicMap[] = [];

export const mentionVolumeData: MentionVolume[] = [];

export const networkIntelligence: NetworkIntelligence[] = [];
export const competitorStrategies: CompetitorStrategy[] = [];
