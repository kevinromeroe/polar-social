export type Network = "instagram" | "facebook" | "tiktok" | "linkedin" | "x";

export interface NetworkMetrics {
  username: string;
  followers: number;
  posts: number;
  engagementRate: number;
  growth: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
}

export interface BrandData {
  brand: string;
  type: "own" | "competitor";
  productLine: string | null;
  networks: Partial<Record<Network, NetworkMetrics>>;
}

export interface MentionData {
  id: number;
  brand: string;
  network: string;
  author: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  date: string;
  likes: number;
}

export interface AlertData {
  type: "spike" | "sentiment" | "viral" | "growth" | "review";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  brand: string;
  date: string;
}

export interface TopPostData {
  brand: string;
  network: Network;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  date: string;
  url?: string;
  imageUrl?: string;
}

export interface SentimentCategorySummary {
  positive: string;
  neutral: string;
  negative: string;
}

export const brands: BrandData[] = [
  {
    brand: "Buena Mesa",
    type: "own",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "buenamesa_oficial", followers: 45200, posts: 234, engagementRate: 2.8, growth: 1.2, avgLikes: 1120, avgComments: 85, avgShares: 42 },
      facebook: { username: "BuenaMesaOficial", followers: 112000, posts: 456, engagementRate: 0.9, growth: -0.1, avgLikes: 890, avgComments: 124, avgShares: 67 },
      tiktok: { username: "buenamesa_oficial", followers: 28700, posts: 89, engagementRate: 4.2, growth: 3.8, avgLikes: 3200, avgComments: 156, avgShares: 234 },
      linkedin: { username: "buena-mesa", followers: 8400, posts: 67, engagementRate: 2.1, growth: 2.1, avgLikes: 145, avgComments: 23, avgShares: 18 },
      x: { username: "BuenaMesa_CO", followers: 15600, posts: 312, engagementRate: 1.5, growth: 0.8, avgLikes: 89, avgComments: 34, avgShares: 56 },
    },
  },
  {
    brand: "Pasta P.A.N.",
    type: "own",
    productLine: "pasta",
    networks: {
      instagram: { username: "pastapan_oficial", followers: 38900, posts: 198, engagementRate: 3.1, growth: 2.4, avgLikes: 980, avgComments: 72, avgShares: 38 },
      facebook: { username: "PastaPANOficial", followers: 95000, posts: 389, engagementRate: 0.7, growth: 0.3, avgLikes: 560, avgComments: 89, avgShares: 45 },
      tiktok: { username: "pastapan_oficial", followers: 22100, posts: 56, engagementRate: 5.1, growth: 6.2, avgLikes: 4100, avgComments: 210, avgShares: 320 },
      linkedin: { username: "pasta-pan", followers: 6200, posts: 45, engagementRate: 1.8, growth: 1.5, avgLikes: 98, avgComments: 15, avgShares: 12 },
      x: { username: "PastaPAN_CO", followers: 12400, posts: 245, engagementRate: 1.2, growth: 0.5, avgLikes: 67, avgComments: 28, avgShares: 41 },
    },
  },
  {
    brand: "Doria",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "doriacolombia", followers: 120000, posts: 567, engagementRate: 2.1, growth: 0.9, avgLikes: 2200, avgComments: 180, avgShares: 95 },
      facebook: { username: "DoriaColombia", followers: 340000, posts: 890, engagementRate: 0.6, growth: 0.2, avgLikes: 1800, avgComments: 245, avgShares: 120 },
      tiktok: { username: "doriacolombia", followers: 85000, posts: 145, engagementRate: 3.8, growth: 2.1, avgLikes: 8900, avgComments: 420, avgShares: 560 },
      x: { username: "DoriaColombia", followers: 28000, posts: 456, engagementRate: 0.9, growth: -0.3, avgLikes: 120, avgComments: 45, avgShares: 78 },
    },
  },
  {
    brand: "La Muñeca",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "lamuneca_pastas", followers: 32000, posts: 178, engagementRate: 3.2, growth: 1.8, avgLikes: 890, avgComments: 67, avgShares: 34 },
      facebook: { username: "LaMunecaPastas", followers: 78000, posts: 345, engagementRate: 0.8, growth: 0.1, avgLikes: 520, avgComments: 78, avgShares: 34 },
      tiktok: { username: "lamuneca_pastas", followers: 18500, posts: 67, engagementRate: 4.5, growth: 4.2, avgLikes: 2800, avgComments: 134, avgShares: 189 },
      x: { username: "LaMunecaPastas", followers: 8900, posts: 189, engagementRate: 1.1, growth: 0.4, avgLikes: 45, avgComments: 18, avgShares: 23 },
    },
  },
  {
    brand: "Comarico",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "comarico_oficial", followers: 15800, posts: 134, engagementRate: 2.4, growth: 1.1, avgLikes: 340, avgComments: 28, avgShares: 15 },
      facebook: { username: "ComaricoOficial", followers: 42000, posts: 234, engagementRate: 0.5, growth: -0.2, avgLikes: 180, avgComments: 34, avgShares: 12 },
      tiktok: { username: "comarico_oficial", followers: 8900, posts: 34, engagementRate: 3.6, growth: 5.1, avgLikes: 1200, avgComments: 67, avgShares: 89 },
      x: { username: "Comarico_CO", followers: 4500, posts: 123, engagementRate: 0.8, growth: 0.2, avgLikes: 23, avgComments: 8, avgShares: 11 },
    },
  },
  {
    brand: "San Remo",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "sanremo_co", followers: 9200, posts: 89, engagementRate: 1.9, growth: 0.6, avgLikes: 156, avgComments: 12, avgShares: 8 },
      facebook: { username: "SanRemoColombia", followers: 23000, posts: 178, engagementRate: 0.4, growth: -0.1, avgLikes: 78, avgComments: 15, avgShares: 6 },
    },
  },
  {
    brand: "Pugliese",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "pugliese_pastas", followers: 6800, posts: 56, engagementRate: 2.2, growth: 1.4, avgLikes: 134, avgComments: 18, avgShares: 7 },
      facebook: { username: "PugliesePastas", followers: 18000, posts: 145, engagementRate: 0.6, growth: 0.3, avgLikes: 89, avgComments: 23, avgShares: 9 },
    },
  },
  {
    brand: "Van Camps",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "vancamps_co", followers: 67000, posts: 312, engagementRate: 2.5, growth: 1.3, avgLikes: 1450, avgComments: 98, avgShares: 56 },
      facebook: { username: "VanCampsColombia", followers: 189000, posts: 567, engagementRate: 0.7, growth: 0.4, avgLikes: 1100, avgComments: 156, avgShares: 78 },
      tiktok: { username: "vancamps_co", followers: 42000, posts: 78, engagementRate: 3.9, growth: 3.2, avgLikes: 5600, avgComments: 267, avgShares: 345 },
      x: { username: "VanCamps_CO", followers: 18000, posts: 289, engagementRate: 1.0, growth: 0.1, avgLikes: 78, avgComments: 34, avgShares: 45 },
    },
  },
  {
    brand: "Zenú",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "zenu_oficial", followers: 156000, posts: 489, engagementRate: 2.9, growth: 1.6, avgLikes: 3800, avgComments: 234, avgShares: 145 },
      facebook: { username: "ZenuOficial", followers: 420000, posts: 1023, engagementRate: 0.8, growth: 0.3, avgLikes: 2800, avgComments: 345, avgShares: 189 },
      tiktok: { username: "zenu_oficial", followers: 98000, posts: 167, engagementRate: 4.1, growth: 2.8, avgLikes: 12000, avgComments: 567, avgShares: 890 },
      x: { username: "Zenu_CO", followers: 34000, posts: 567, engagementRate: 1.3, growth: 0.6, avgLikes: 189, avgComments: 67, avgShares: 89 },
    },
  },
  {
    brand: "La Soberana",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "lasoberana_co", followers: 11200, posts: 98, engagementRate: 2.0, growth: 0.8, avgLikes: 189, avgComments: 23, avgShares: 12 },
      facebook: { username: "LaSoberanaCO", followers: 28000, posts: 167, engagementRate: 0.5, growth: 0.1, avgLikes: 120, avgComments: 34, avgShares: 15 },
    },
  },
  {
    brand: "Bari",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "bari_colombia", followers: 8900, posts: 67, engagementRate: 1.8, growth: 0.5, avgLikes: 134, avgComments: 15, avgShares: 8 },
      facebook: { username: "BariColombia", followers: 21000, posts: 134, engagementRate: 0.4, growth: -0.1, avgLikes: 67, avgComments: 18, avgShares: 7 },
    },
  },
  {
    brand: "Isabell",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "isabell_co", followers: 5600, posts: 45, engagementRate: 1.5, growth: 0.3, avgLikes: 78, avgComments: 8, avgShares: 4 },
      facebook: { username: "IsabellColombia", followers: 14000, posts: 89, engagementRate: 0.3, growth: -0.2, avgLikes: 34, avgComments: 12, avgShares: 5 },
    },
  },
  {
    brand: "La Española",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "laespanola_co", followers: 7800, posts: 56, engagementRate: 1.7, growth: 0.7, avgLikes: 112, avgComments: 12, avgShares: 6 },
      facebook: { username: "LaEspanolaCO", followers: 19000, posts: 123, engagementRate: 0.4, growth: 0.0, avgLikes: 56, avgComments: 15, avgShares: 8 },
    },
  },
];

export const ownBrands = brands.filter((b) => b.type === "own");
export const competitors = brands.filter((b) => b.type === "competitor");

export function getTotalFollowers(brand: BrandData): number {
  return Object.values(brand.networks).reduce((sum, n) => sum + (n?.followers ?? 0), 0);
}

export function getAvgEngagement(brand: BrandData): number {
  const nets = Object.values(brand.networks).filter(Boolean) as NetworkMetrics[];
  if (nets.length === 0) return 0;
  return Number((nets.reduce((sum, n) => sum + n.engagementRate, 0) / nets.length).toFixed(1));
}

export const sovData = [
  { brand: "Doria", mentions: 2840, percentage: 22.1 },
  { brand: "Buena Mesa", mentions: 2320, percentage: 18.1 },
  { brand: "Zenú", mentions: 1980, percentage: 15.4 },
  { brand: "Pasta P.A.N.", mentions: 1560, percentage: 12.2 },
  { brand: "Van Camps", mentions: 1120, percentage: 8.7 },
  { brand: "La Muñeca", mentions: 890, percentage: 6.9 },
  { brand: "Comarico", mentions: 620, percentage: 4.8 },
  { brand: "La Soberana", mentions: 450, percentage: 3.5 },
  { brand: "San Remo", mentions: 380, percentage: 3.0 },
  { brand: "Bari", mentions: 280, percentage: 2.2 },
  { brand: "Pugliese", mentions: 210, percentage: 1.6 },
  { brand: "La Española", mentions: 120, percentage: 0.9 },
  { brand: "Isabell", mentions: 80, percentage: 0.6 },
];

export const sentimentByBrand = [
  { brand: "Buena Mesa", positive: 68, neutral: 24, negative: 8 },
  { brand: "Pasta P.A.N.", positive: 72, neutral: 20, negative: 8 },
  { brand: "Doria", positive: 58, neutral: 28, negative: 14 },
  { brand: "La Muñeca", positive: 61, neutral: 27, negative: 12 },
  { brand: "Comarico", positive: 55, neutral: 30, negative: 15 },
  { brand: "Van Camps", positive: 64, neutral: 22, negative: 14 },
  { brand: "Zenú", positive: 70, neutral: 20, negative: 10 },
  { brand: "San Remo", positive: 52, neutral: 35, negative: 13 },
  { brand: "La Soberana", positive: 48, neutral: 38, negative: 14 },
  { brand: "Bari", positive: 50, neutral: 36, negative: 14 },
  { brand: "Pugliese", positive: 54, neutral: 32, negative: 14 },
  { brand: "Isabell", positive: 45, neutral: 40, negative: 15 },
  { brand: "La Española", positive: 47, neutral: 38, negative: 15 },
];

export const growthTrend = [
  { date: "Abr", "Buena Mesa": 197200, "Pasta P.A.N.": 163400 },
  { date: "May", "Buena Mesa": 199400, "Pasta P.A.N.": 165100 },
  { date: "Jun", "Buena Mesa": 202300, "Pasta P.A.N.": 167500 },
  { date: "Jul", "Buena Mesa": 205200, "Pasta P.A.N.": 169200 },
  { date: "Ago", "Buena Mesa": 207900, "Pasta P.A.N.": 171200 },
  { date: "Sep", "Buena Mesa": 209900, "Pasta P.A.N.": 174600 },
];

export const mentionsByNetwork = [
  { network: "X", mentions: 4820, percentage: 37.5 },
  { network: "TikTok", mentions: 3200, percentage: 24.9 },
  { network: "Facebook", mentions: 1980, percentage: 15.4 },
  { network: "Reddit", mentions: 1240, percentage: 9.7 },
  { network: "Instagram", mentions: 890, percentage: 6.9 },
  { network: "LinkedIn", mentions: 420, percentage: 3.3 },
  { network: "Google Maps", mentions: 300, percentage: 2.3 },
];

export const topPosts: TopPostData[] = [
  { brand: "Buena Mesa", network: "tiktok", caption: "Receta de pasta al pesto con ingredientes colombianos 🇨🇴 #cocina #recetas", likes: 45200, comments: 2340, shares: 8900, views: 320000, date: "2026-09-08" },
  { brand: "Buena Mesa", network: "instagram", caption: "Nuestro nuevo empaque sostenible ya está en tu supermercado favorito", likes: 3400, comments: 245, shares: 189, views: 0, date: "2026-09-10" },
  { brand: "Buena Mesa", network: "facebook", caption: "¡Feliz día de la familia! Comparte tu receta favorita con Buena Mesa", likes: 2100, comments: 567, shares: 345, views: 0, date: "2026-09-05" },
  { brand: "Pasta P.A.N.", network: "tiktok", caption: "3 recetas rápidas para la lonchera de tus hijos con Pasta P.A.N.", likes: 38900, comments: 1890, shares: 12400, views: 285000, date: "2026-09-06" },
  { brand: "Pasta P.A.N.", network: "instagram", caption: "Del campo a tu mesa: conoce el proceso detrás de cada pasta", likes: 2800, comments: 178, shares: 145, views: 0, date: "2026-09-12" },
  { brand: "Pasta P.A.N.", network: "x", caption: "Gracias a todos los que nos acompañaron en la FeriaGastronómica. ¡Nos vemos el próximo año!", likes: 890, comments: 123, shares: 234, views: 0, date: "2026-09-03" },
];

export const mentions: MentionData[] = [
  { id: 1, brand: "Buena Mesa", network: "X", author: "@chefcolombia", text: "Probé la nueva línea integral de Buena Mesa y quedé sorprendida. La textura es perfecta para pasta al dente.", sentiment: "positive", date: "2026-09-13", likes: 234 },
  { id: 2, brand: "Buena Mesa", network: "Reddit", author: "u/cocina_casera", text: "¿Alguien más ha notado que Buena Mesa cambió la receta? El sabor está diferente desde hace unos meses.", sentiment: "negative", date: "2026-09-12", likes: 45 },
  { id: 3, brand: "Pasta P.A.N.", network: "TikTok", author: "@recetas_faciles", text: "Este hack con Pasta P.A.N. me salvó la cena en 10 minutos", sentiment: "positive", date: "2026-09-11", likes: 12300 },
  { id: 4, brand: "Doria", network: "X", author: "@consumidor_co", text: "Doria subió el precio otra vez y el paquete viene con menos producto. Cada vez peor relación calidad-precio.", sentiment: "negative", date: "2026-09-13", likes: 567 },
  { id: 5, brand: "Doria", network: "Facebook", author: "María López", text: "Toda la vida he cocinado con Doria. Es la pasta de mi familia desde que era niña.", sentiment: "positive", date: "2026-09-10", likes: 89 },
  { id: 6, brand: "La Muñeca", network: "Instagram", author: "@foodie_bogota", text: "La pasta La Muñeca tiene una textura que no me convence del todo. Prefiero otras marcas.", sentiment: "negative", date: "2026-09-09", likes: 34 },
  { id: 7, brand: "Zenú", network: "TikTok", author: "@sabores_de_casa", text: "La pasta con atún Zenú es mi almuerzo express favorito. Rápido, rico y económico.", sentiment: "positive", date: "2026-09-12", likes: 8900 },
  { id: 8, brand: "Van Camps", network: "X", author: "@nutricion_co", text: "Comparé las tablas nutricionales de todas las pastas con atún y Van Camps tiene el mejor balance proteico.", sentiment: "positive", date: "2026-09-11", likes: 345 },
  { id: 9, brand: "Buena Mesa", network: "Google Maps", author: "Carlos R.", text: "Encontré Buena Mesa integral en el Éxito de la 80. Excelente producto, 100% recomendado.", sentiment: "positive", date: "2026-09-08", likes: 12 },
  { id: 10, brand: "Comarico", network: "Reddit", author: "u/pasta_lover_co", text: "Comarico es la opción más económica pero honestamente la calidad ha bajado mucho en el último año.", sentiment: "negative", date: "2026-09-07", likes: 67 },
  { id: 11, brand: "Pasta P.A.N.", network: "LinkedIn", author: "Andrés Gómez", text: "Gran movimiento de Pasta P.A.N. con su estrategia de sostenibilidad. Así se hace branding con propósito.", sentiment: "positive", date: "2026-09-10", likes: 156 },
  { id: 12, brand: "Buena Mesa", network: "TikTok", author: "@cocina_rapida", text: "Tutorial: cómo hacer la pasta perfecta con Buena Mesa en 8 minutos", sentiment: "positive", date: "2026-09-09", likes: 5600 },
];

export const alerts: AlertData[] = [
  { type: "sentiment", severity: "warning", title: "Pico de menciones negativas de Doria", description: "Doria registró 34 menciones negativas en X en las últimas 24h relacionadas con cambio de precio y reducción de contenido.", brand: "Doria", date: "2026-09-13" },
  { type: "viral", severity: "info", title: "Post viral de Buena Mesa en TikTok", description: "La receta de pasta al pesto alcanzó 320K views y 45K likes en 5 días.", brand: "Buena Mesa", date: "2026-09-08" },
  { type: "growth", severity: "info", title: "Pasta P.A.N. creció 6.2% en TikTok", description: "El mayor crecimiento quincenal de todas las marcas monitoreadas. Impulsado por contenido de recetas rápidas.", brand: "Pasta P.A.N.", date: "2026-09-14" },
  { type: "review", severity: "warning", title: "Reseñas negativas en Google Maps", description: "3 reseñas de 1-2 estrellas para puntos de venta Comarico en Medellín esta semana.", brand: "Comarico", date: "2026-09-12" },
  { type: "spike", severity: "info", title: "Zenú domina conversación de pasta con atún", description: "Zenú acumula 15.4% del SOV total de la categoría, superando a Van Camps por primera vez.", brand: "Zenú", date: "2026-09-11" },
];

export const googleMapsData = [
  { brand: "Buena Mesa", rating: 4.3, totalReviews: 342, recentCount: 28 },
  { brand: "Pasta P.A.N.", rating: 4.1, totalReviews: 289, recentCount: 22 },
  { brand: "Doria", rating: 3.8, totalReviews: 567, recentCount: 45 },
  { brand: "La Muñeca", rating: 3.6, totalReviews: 123, recentCount: 8 },
  { brand: "Comarico", rating: 3.2, totalReviews: 89, recentCount: 12 },
  { brand: "Van Camps", rating: 4.0, totalReviews: 234, recentCount: 18 },
  { brand: "Zenú", rating: 4.2, totalReviews: 456, recentCount: 35 },
];

export const brandColors: Record<string, string> = {
  "Buena Mesa": "#D97706",
  "Pasta P.A.N.": "#1D4ED8",
  "Doria": "#DC2626",
  "La Muñeca": "#9333EA",
  "Comarico": "#059669",
  "San Remo": "#B45309",
  "Pugliese": "#6D28D9",
  "Van Camps": "#0284C7",
  "Zenú": "#E11D48",
  "La Soberana": "#7C3AED",
  "Bari": "#0891B2",
  "Isabell": "#CA8A04",
  "La Española": "#BE185D",
};

export const networkColors: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  tiktok: "#000000",
  linkedin: "#0A66C2",
  x: "#1DA1F2",
};

export const networkLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
};

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("es-CO");
}

export function getTotalInteractions(brand: BrandData, network?: Network): number {
  if (network) {
    const m = brand.networks[network];
    if (!m) return 0;
    return Math.round((m.avgLikes + m.avgComments + m.avgShares) * m.posts);
  }
  return Object.values(brand.networks).reduce((sum, m) => {
    if (!m) return sum;
    return sum + Math.round((m.avgLikes + m.avgComments + m.avgShares) * m.posts);
  }, 0);
}

export const sentimentCategorySummaries: Record<string, SentimentCategorySummary> = {
  "Buena Mesa": {
    positive: "Elogios a la calidad del producto, nuevos empaques sostenibles y recetas compartidas por la comunidad.",
    neutral: "Comentarios sobre disponibilidad en tiendas, preguntas sobre ingredientes y comparaciones con otras marcas.",
    negative: "Percepción de cambio en la receta y preocupaciones sobre la relación calidad-precio.",
  },
  "Pasta P.A.N.": {
    positive: "Recetas rápidas y prácticas, contenido de loncheras escolares y reconocimiento a la estrategia de sostenibilidad.",
    neutral: "Preguntas sobre tabla nutricional, comparaciones con otras marcas y discusiones generales sobre pastas.",
    negative: "Comentarios aislados sobre textura y presentación del producto.",
  },
};

export const productLineLabels: Record<string, string> = {
  pasta: "Pasta",
  pasta_atun: "Pasta Atún",
};

export const productLineKeys = ["pasta", "pasta_atun"];
