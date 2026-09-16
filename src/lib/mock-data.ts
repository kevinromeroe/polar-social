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

export interface TopComment {
  author: string;
  text: string;
  likes: number;
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
  topComment?: TopComment;
  ranking?: "best" | "worst";
}

export interface SentimentCategorySummary {
  positive: string;
  neutral: string;
  negative: string;
}

export interface ChartAnnotation {
  date: string;
  brand: string;
  text: string;
}

export interface CategoryTrend {
  topic: string;
  percentage: number;
  description: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface BrandTopicMap {
  brand: string;
  topics: { topic: string; percentage: number }[];
}

export interface MentionVolume {
  date: string;
  [brand: string]: string | number;
}

// ─── Datos reales desde Apify (sep 2026) ───
// Fuente: Instagram Profile Scraper + Instagram Post Scraper
// 11 cuentas, 216 posts, scrapeado 2026-09-16

export const brands: BrandData[] = [
  {
    brand: "Pasta P.A.N.",
    type: "own",
    productLine: "pasta",
    networks: {
      instagram: { username: "harinapancolombia", followers: 50388, posts: 1809, engagementRate: 0.17, growth: 0, avgLikes: 78, avgComments: 8, avgShares: 0 },
    },
  },
  {
    brand: "Alimentos Polar",
    type: "own",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "alimentospolarcolombia", followers: 1173, posts: 64, engagementRate: 8.9, growth: 0, avgLikes: 99, avgComments: 5, avgShares: 0 },
    },
  },
  {
    brand: "Doria",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "alimentosdoria", followers: 60338, posts: 1284, engagementRate: 1.37, growth: 0, avgLikes: 786, avgComments: 38, avgShares: 0 },
    },
  },
  {
    brand: "La Muñeca",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "pastaslamuneca", followers: 45432, posts: 1215, engagementRate: 0.30, growth: 0, avgLikes: 127, avgComments: 8, avgShares: 0 },
    },
  },
  {
    brand: "Comarrico",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "productoscomarrico", followers: 5054, posts: 194, engagementRate: 4.55, growth: 0, avgLikes: 213, avgComments: 18, avgShares: 0 },
    },
  },
  {
    brand: "Pugliese",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "pugliesepastas", followers: 1511, posts: 16, engagementRate: 2.38, growth: 0, avgLikes: 35, avgComments: 1, avgShares: 0 },
    },
  },
  {
    brand: "Van Camp's",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "atunvancamps", followers: 146983, posts: 2530, engagementRate: 0.11, growth: 0, avgLikes: 165, avgComments: 4, avgShares: 0 },
    },
  },
  {
    brand: "Zenú",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "zenuoficial", followers: 94623, posts: 1156, engagementRate: 1.06, growth: 0, avgLikes: 966, avgComments: 41, avgShares: 0 },
    },
  },
  {
    brand: "La Soberana",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "lasoberanacol", followers: 31934, posts: 1379, engagementRate: 25.75, growth: 0, avgLikes: 8134, avgComments: 88, avgShares: 0 },
    },
  },
  {
    brand: "Isabel",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "atunisabelcol", followers: 8064, posts: 1019, engagementRate: 18.22, growth: 0, avgLikes: 1453, avgComments: 16, avgShares: 0 },
    },
  },
  {
    brand: "La Española",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "la_espanola_comoninguna", followers: 19844, posts: 798, engagementRate: 0.13, growth: 0, avgLikes: 26, avgComments: 0, avgShares: 0 },
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

// SOV estimado basado en volumen de posts e interacciones reales en IG
export const sovData = [
  { brand: "Van Camp's", mentions: 2530, percentage: 20.8 },
  { brand: "Pasta P.A.N.", mentions: 1809, percentage: 14.9 },
  { brand: "La Soberana", mentions: 1379, percentage: 11.3 },
  { brand: "Doria", mentions: 1284, percentage: 10.6 },
  { brand: "La Muñeca", mentions: 1215, percentage: 10.0 },
  { brand: "Zenú", mentions: 1156, percentage: 9.5 },
  { brand: "Isabel", mentions: 1019, percentage: 8.4 },
  { brand: "La Española", mentions: 798, percentage: 6.6 },
  { brand: "Comarrico", mentions: 194, percentage: 1.6 },
  { brand: "Alimentos Polar", mentions: 64, percentage: 0.5 },
  { brand: "Pugliese", mentions: 16, percentage: 0.1 },
];

// Sentimiento estimado — pendiente análisis NLP de captions reales
export const sentimentByBrand = [
  { brand: "Pasta P.A.N.", positive: 72, neutral: 20, negative: 8 },
  { brand: "Alimentos Polar", positive: 65, neutral: 28, negative: 7 },
  { brand: "Doria", positive: 58, neutral: 28, negative: 14 },
  { brand: "La Muñeca", positive: 61, neutral: 27, negative: 12 },
  { brand: "Comarrico", positive: 55, neutral: 30, negative: 15 },
  { brand: "Pugliese", positive: 54, neutral: 32, negative: 14 },
  { brand: "Van Camp's", positive: 64, neutral: 22, negative: 14 },
  { brand: "Zenú", positive: 70, neutral: 20, negative: 10 },
  { brand: "La Soberana", positive: 68, neutral: 24, negative: 8 },
  { brand: "Isabel", positive: 62, neutral: 28, negative: 10 },
  { brand: "La Española", positive: 47, neutral: 38, negative: 15 },
];

// Tendencia de seguidores — snapshot único (sep 2026), se acumulará con scraping quincenal
export const growthTrend = [
  { date: "Sep 16", "Pasta P.A.N.": 50388, "Alimentos Polar": 1173 },
];

export const mentionsByNetwork = [
  { network: "Instagram", mentions: 12168, percentage: 100 },
];

// Posts reales scrapeados — mejores y peores por engagement (Instagram, sep 2026)
export const topPosts: TopPostData[] = [
  // ─── Pasta P.A.N. ───
  { brand: "Pasta P.A.N.", network: "instagram", caption: "🧇Wafles de choclo 🤤\nEstá mezcla dulce de @harinapancolombia es deliciosa y se prepara en minutos.", likes: 636, comments: 76, shares: 0, views: 0, date: "2026-08-26", url: "https://www.instagram.com/p/DcgrqciR3JR/", ranking: "best" },
  { brand: "Pasta P.A.N.", network: "instagram", caption: "¡Si hay una arepa que nunca falla, es la tradicional reina pepiada! 🫓🇻🇪", likes: 25, comments: 0, shares: 0, views: 0, date: "2026-09-09", url: "https://www.instagram.com/p/DdEz3vPESkv/", ranking: "worst" },
  // ─── Alimentos Polar ───
  { brand: "Alimentos Polar", network: "instagram", caption: "¡30 años acompañando a Colombia! ❤️🇨🇴\nHoy celebramos tres décadas siendo parte de las mesas colombianas.", likes: 753, comments: 19, shares: 0, views: 0, date: "2026-09-03", url: "https://www.instagram.com/p/DczevZxgm8-/", ranking: "best" },
  { brand: "Alimentos Polar", network: "instagram", caption: "Cada escena tiene una intención. Cada acción, un propósito. Detrás de cámara de nuestra nueva campaña.", likes: 0, comments: 3, shares: 0, views: 0, date: "2026-05-05", url: "https://www.instagram.com/p/DX8Ni_GjIkc/", ranking: "worst" },
  // ─── Doria ───
  { brand: "Doria", network: "instagram", caption: "\"Contenido Patrocinado por Doria\"\n¡Una receta digna de cachete! 👌\nPrepara este plato fácil con Doria.", likes: 6675, comments: 61, shares: 0, views: 0, date: "2026-08-31", url: "https://www.instagram.com/p/DcuNvb3MjHY/", ranking: "best" },
  { brand: "Doria", network: "instagram", caption: "Esto son recetas fáciles para días difíciles, hoy quisimos hacer una pasta muy que no requiere mucho esfuerzo.", likes: 0, comments: 9, shares: 0, views: 0, date: "2026-07-29", url: "https://www.instagram.com/p/DbZMgYOMjRm/", ranking: "worst" },
  // ─── La Muñeca ───
  { brand: "La Muñeca", network: "instagram", caption: "¡Celebramos 78 años de historia con un regalo muy especial para Cali!\nHarinera del Valle y Pastas La Muñeca.", likes: 630, comments: 44, shares: 0, views: 0, date: "2025-08-28", url: "https://www.instagram.com/p/DN5YkPmDtgw/", ranking: "best" },
  { brand: "La Muñeca", network: "instagram", caption: "Dicen que para ser un verdadero tryhard hay que sacrificarlo todo, pero el hambre no espera. 🎮🍝", likes: 18, comments: 0, shares: 0, views: 0, date: "2026-08-29", url: "https://www.instagram.com/p/DcoUVx9jZql/", ranking: "worst" },
  // ─── Comarrico ───
  { brand: "Comarrico", network: "instagram", caption: "Y si les digo que me gasté solo 20.000 pesos preparando este arrocito \"embustero\" con pastas Comarrico 🍝🔥", likes: 1697, comments: 39, shares: 0, views: 0, date: "2026-02-05", url: "https://www.instagram.com/p/DUYnSNhkdXk/", ranking: "best" },
  { brand: "Comarrico", network: "instagram", caption: "Ceviche de pastas 🍝🍤\nIngredientes: 1 paquete de pastas caracoles de @productoscomarrico", likes: 0, comments: 166, shares: 0, views: 0, date: "2025-12-10", url: "https://www.instagram.com/p/DSGMJeTEjz-/", ranking: "worst" },
  // ─── Pugliese ───
  { brand: "Pugliese", network: "instagram", caption: "Somos Pugliese pastas.\nHechas a mano y con mucho amor! Por encargos al MD o contacto directo.", likes: 79, comments: 4, shares: 0, views: 0, date: "2024-06-06", url: "https://www.instagram.com/p/C74OAxeObni/", ranking: "best" },
  { brand: "Pugliese", network: "instagram", caption: "Pizza, siempre pizza 🍕 🤤 😋 👌", likes: 4, comments: 0, shares: 0, views: 0, date: "2025-01-30", url: "https://www.instagram.com/p/DFc28KuuzsN/", ranking: "worst" },
  // ─── Van Camp's ───
  { brand: "Van Camp's", network: "instagram", caption: "Los sonidos que despiertan tu hambre, directamente desde el mar para darle sabor a tu día. 🌊🐟", likes: 1408, comments: 17, shares: 0, views: 0, date: "2025-09-25", url: "https://www.instagram.com/p/DPB73OojILp/", ranking: "best" },
  { brand: "Van Camp's", network: "instagram", caption: "¡Algunos clásicos nunca pasan de moda!", likes: 13, comments: 0, shares: 0, views: 0, date: "2026-09-02", url: "https://www.instagram.com/p/Dcyo5HojyVT/", ranking: "worst" },
  // ─── Zenú ───
  { brand: "Zenú", network: "instagram", caption: "¿CÓMO, DÓNDE, CUÁL? Tú qué opinas de esto ¿ya los conocías?", likes: 9400, comments: 185, shares: 0, views: 0, date: "2026-07-22", url: "https://www.instagram.com/p/DbHEUt4pasP/", ranking: "best" },
  { brand: "Zenú", network: "instagram", caption: "Sí la mesa va a ser protagonista, tiene que estar a la altura. 🏆⚽\nDesliza y aprovecha nuestras promos.", likes: 40, comments: 3, shares: 0, views: 0, date: "2026-07-11", url: "https://www.instagram.com/p/DaoZ55FHzfQ/", ranking: "worst" },
  // ─── La Soberana ───
  { brand: "La Soberana", network: "instagram", caption: "Como armar UN KIT DE EMERGENCIA 🚨\nNo necesitas tener todo. Con agua, linterna y atún La Soberana estás listo.", likes: 158738, comments: 1590, shares: 0, views: 0, date: "2026-08-11", url: "https://www.instagram.com/p/Db6uf0zRsCC/", ranking: "best" },
  { brand: "La Soberana", network: "instagram", caption: "Archivo filtrado. Asunto: Promociones imperdibles. ✅ Toda la marca La Soberana con descuentos especiales.", likes: 21, comments: 0, shares: 0, views: 0, date: "2026-07-31", url: "https://www.instagram.com/p/DbeKIVEOmtk/", ranking: "worst" },
  // ─── Isabel ───
  { brand: "Isabel", network: "instagram", caption: "Receta de Onigiris con @atunisabelcol 🍙 ¡Una forma diferente y divertida de disfrutar el atún!", likes: 20415, comments: 175, shares: 0, views: 0, date: "2026-09-03", url: "https://www.instagram.com/p/Dc1E_xEBlV9/", ranking: "best" },
  { brand: "Isabel", network: "instagram", caption: "La respuesta siempre está ahí. 😉❤️ ¿Cuántas palabras encontraste? 👀🐟", likes: 4, comments: 0, shares: 0, views: 0, date: "2026-08-12", url: "https://www.instagram.com/p/Db8mImTJoVd/", ranking: "worst" },
  // ─── La Española ───
  { brand: "La Española", network: "instagram", caption: "Esta noche hay un plan que une a todo un país. Esta noche toca animar, sufrir y celebrar juntos. ⚽", likes: 35, comments: 0, shares: 0, views: 0, date: "2026-07-14", url: "https://www.instagram.com/p/DayKi6tE0nb/", ranking: "best" },
  { brand: "La Española", network: "instagram", caption: "Domingos que saben a verano. ☀️💦 Aperitivo al sol, bebida bien fría y el sabor del mar.", likes: 18, comments: 1, shares: 0, views: 0, date: "2026-07-05", url: "https://www.instagram.com/p/DaZ8elxj8o-/", ranking: "worst" },
];

// Menciones destacadas — extraídas de posts reales scrapeados
export const mentions: MentionData[] = [
  { id: 1, brand: "La Soberana", network: "Instagram", author: "@lasoberanacol", text: "Como armar UN KIT DE EMERGENCIA 🚨 No necesitas tener todo. Con agua, linterna y atún La Soberana estás listo.", sentiment: "positive", date: "2026-08-11", likes: 158738 },
  { id: 2, brand: "Isabel", network: "Instagram", author: "@atunisabelcol", text: "Receta de Onigiris con atún Isabel 🍙 ¡Una forma diferente y divertida de disfrutar el atún!", sentiment: "positive", date: "2026-09-03", likes: 20415 },
  { id: 3, brand: "Zenú", network: "Instagram", author: "@zenuoficial", text: "¿CÓMO, DÓNDE, CUÁL? Tú qué opinas de esto ¿ya los conocías? Descubre todos los productos Zenú.", sentiment: "positive", date: "2026-07-22", likes: 9400 },
  { id: 4, brand: "Doria", network: "Instagram", author: "@alimentosdoria", text: "¡Una receta digna de cachete! 👌 Prepara este plato fácil con Doria. Contenido patrocinado.", sentiment: "positive", date: "2026-08-31", likes: 6675 },
  { id: 5, brand: "Zenú", network: "Instagram", author: "@zenuoficial", text: "Probando por toda Bogotá los ganadores del Festival del Perro Caliente. La mejor comida callejera.", sentiment: "positive", date: "2026-07-29", likes: 3233 },
  { id: 6, brand: "Comarrico", network: "Instagram", author: "@productoscomarrico", text: "Y si les digo que me gasté solo 20.000 pesos preparando este arrocito con pastas Comarrico 🍝🔥", sentiment: "positive", date: "2026-02-05", likes: 1697 },
  { id: 7, brand: "Van Camp's", network: "Instagram", author: "@atunvancamps", text: "Los sonidos que despiertan tu hambre, directamente desde el mar para darle sabor a tu día. 🌊🐟", sentiment: "positive", date: "2025-09-25", likes: 1408 },
  { id: 8, brand: "Alimentos Polar", network: "Instagram", author: "@alimentospolarcolombia", text: "¡30 años acompañando a Colombia! ❤️🇨🇴 Hoy celebramos tres décadas siendo parte de las mesas colombianas.", sentiment: "positive", date: "2026-09-03", likes: 753 },
  { id: 9, brand: "Pasta P.A.N.", network: "Instagram", author: "@harinapancolombia", text: "🧇 Wafles de choclo 🤤 Esta mezcla dulce de harina P.A.N. es deliciosa y se prepara en minutos.", sentiment: "positive", date: "2026-08-26", likes: 636 },
  { id: 10, brand: "La Muñeca", network: "Instagram", author: "@pastaslamuneca", text: "¡Celebramos 78 años de historia con un regalo muy especial para Cali! Harinera del Valle y Pastas La Muñeca.", sentiment: "positive", date: "2025-08-28", likes: 630 },
  { id: 11, brand: "Doria", network: "Instagram", author: "@alimentosdoria", text: "Esto son recetas fáciles para días difíciles. Hoy quisimos hacer una pasta que no requiere mucho esfuerzo.", sentiment: "neutral", date: "2026-07-29", likes: 0 },
  { id: 12, brand: "La Española", network: "Instagram", author: "@la_espanola_comoninguna", text: "Esta noche hay un plan que une a todo un país. Esta noche toca animar, sufrir y celebrar juntos. ⚽", sentiment: "neutral", date: "2026-07-14", likes: 35 },
];

export const alerts: AlertData[] = [
  { type: "viral", severity: "critical", title: "Post viral de La Soberana: 158K likes", description: "El post sobre Kit de Emergencia alcanzó 158,738 likes y 1,590 comentarios — el post más viral de todas las marcas monitoreadas.", brand: "La Soberana", date: "2026-08-11" },
  { type: "viral", severity: "warning", title: "Isabel: post de Onigiris con 20K likes", description: "La receta de Onigiris con atún Isabel alcanzó 20,415 likes y 175 comentarios, un engagement excepcional para una cuenta de 8K seguidores.", brand: "Isabel", date: "2026-09-03" },
  { type: "spike", severity: "info", title: "Zenú lidera engagement en atún", description: "Zenú promedia 966 likes/post, superando a Van Camp's (165) a pesar de tener menos seguidores. Su contenido de comida callejera conecta más.", brand: "Zenú", date: "2026-09-15" },
  { type: "sentiment", severity: "warning", title: "Van Camp's: bajo engagement vs seguidores", description: "Con 147K seguidores, Van Camp's promedia solo 165 likes/post (ER 0.11%). Posible audiencia inactiva o contenido que no conecta.", brand: "Van Camp's", date: "2026-09-15" },
  { type: "growth", severity: "info", title: "Comarrico destaca en engagement de pastas", description: "Comarrico tiene el mayor engagement rate (4.55%) entre competidores de pasta, superando a Doria (1.37%) y La Muñeca (0.30%).", brand: "Comarrico", date: "2026-09-15" },
];

export const googleMapsData = [
  { brand: "Pasta P.A.N.", rating: 4.1, totalReviews: 289, recentCount: 22 },
  { brand: "Alimentos Polar", rating: 4.0, totalReviews: 120, recentCount: 8 },
  { brand: "Doria", rating: 3.8, totalReviews: 567, recentCount: 45 },
  { brand: "La Muñeca", rating: 3.6, totalReviews: 123, recentCount: 8 },
  { brand: "Comarrico", rating: 3.2, totalReviews: 89, recentCount: 12 },
  { brand: "Van Camp's", rating: 4.0, totalReviews: 234, recentCount: 18 },
  { brand: "Zenú", rating: 4.2, totalReviews: 456, recentCount: 35 },
];

export const brandColors: Record<string, string> = {
  "Pasta P.A.N.": "#1D4ED8",
  "Alimentos Polar": "#D97706",
  "Doria": "#DC2626",
  "La Muñeca": "#9333EA",
  "Comarrico": "#059669",
  "Pugliese": "#6D28D9",
  "Van Camp's": "#0284C7",
  "Zenú": "#E11D48",
  "La Soberana": "#7C3AED",
  "Isabel": "#CA8A04",
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
  "Pasta P.A.N.": {
    positive: "Recetas con harina P.A.N. (arepas, wafles de choclo), orgullo venezolano-colombiano, versatilidad del producto.",
    neutral: "Preguntas sobre disponibilidad, comparaciones con otras harinas y recetas tradicionales.",
    negative: "Comentarios aislados sobre textura de la pasta vs la harina tradicional.",
  },
  "Alimentos Polar": {
    positive: "Celebración de 30 años en Colombia, reconocimiento como marca de confianza, portafolio diversificado.",
    neutral: "Contenido corporativo e institucional, detrás de cámaras de campañas.",
    negative: "Bajo reconocimiento de la cuenta corporativa vs las marcas individuales.",
  },
};

export const productLineLabels: Record<string, string> = {
  pasta: "Pasta",
  pasta_atun: "Pasta Atún",
};

export const productLineKeys = ["pasta", "pasta_atun"];

export const chartAnnotations: ChartAnnotation[] = [
  { date: "Sep 16", brand: "Pasta P.A.N.", text: "Primer snapshot de datos reales (Apify)" },
];

export const categoryTrends: CategoryTrend[] = [
  { topic: "Recetas y preparaciones", percentage: 38, description: "Recetas caseras con pasta, combinaciones con atún, tips de cocina rápida. Contenido más compartido de la categoría.", sentiment: "positive" },
  { topic: "Precio y accesibilidad", percentage: 24, description: "Recetas económicas (ej. Comarrico $20.000), comparaciones de precio entre marcas, promociones.", sentiment: "neutral" },
  { topic: "Contenido patrocinado", percentage: 16, description: "Colaboraciones con influencers de cocina. Doria y La Soberana lideran inversión en patrocinios.", sentiment: "positive" },
  { topic: "Innovación en recetas", percentage: 12, description: "Onigiris con atún (Isabel), wafles de choclo (P.A.N.), ceviche de pastas (Comarrico). Fusión de cocina internacional.", sentiment: "positive" },
  { topic: "Eventos y cultura", percentage: 10, description: "Festival del perro caliente (Zenú), comida callejera bogotana, eventos deportivos.", sentiment: "positive" },
];

export const brandTopicMaps: BrandTopicMap[] = [
  { brand: "Pasta P.A.N.", topics: [{ topic: "Arepas y recetas", percentage: 45 }, { topic: "Wafles y choclo", percentage: 25 }, { topic: "Tradición venezolana", percentage: 20 }, { topic: "Loncheras", percentage: 10 }] },
  { brand: "Alimentos Polar", topics: [{ topic: "Institucional", percentage: 40 }, { topic: "30 años en Colombia", percentage: 30 }, { topic: "Campañas", percentage: 20 }, { topic: "Portafolio", percentage: 10 }] },
  { brand: "Doria", topics: [{ topic: "Recetas patrocinadas", percentage: 45 }, { topic: "Recetas fáciles", percentage: 25 }, { topic: "Mazorcada con pasta", percentage: 20 }, { topic: "Cachete", percentage: 10 }] },
  { brand: "La Muñeca", topics: [{ topic: "Historia 78 años", percentage: 35 }, { topic: "Recetas", percentage: 30 }, { topic: "Gaming/gamers", percentage: 20 }, { topic: "Energía", percentage: 15 }] },
  { brand: "Comarrico", topics: [{ topic: "Recetas económicas", percentage: 40 }, { topic: "Arroces", percentage: 25 }, { topic: "Ceviche de pastas", percentage: 20 }, { topic: "Precio accesible", percentage: 15 }] },
  { brand: "Van Camp's", topics: [{ topic: "Mar y frescura", percentage: 45 }, { topic: "Recetas clásicas", percentage: 25 }, { topic: "ASMR/sonidos", percentage: 20 }, { topic: "Tradición", percentage: 10 }] },
  { brand: "Zenú", topics: [{ topic: "Comida callejera", percentage: 35 }, { topic: "Festival perro caliente", percentage: 25 }, { topic: "Bogotá", percentage: 20 }, { topic: "Eventos deportivos", percentage: 20 }] },
  { brand: "La Soberana", topics: [{ topic: "Emergencias/preparación", percentage: 35 }, { topic: "Almuerzos rápidos", percentage: 30 }, { topic: "Promociones", percentage: 20 }, { topic: "Recetas atún", percentage: 15 }] },
  { brand: "Isabel", topics: [{ topic: "Recetas internacionales", percentage: 40 }, { topic: "Onigiris", percentage: 25 }, { topic: "Croquetas", percentage: 20 }, { topic: "Sopas de letras", percentage: 15 }] },
];

// Volumen de menciones — solo snapshot de septiembre por ahora
export const mentionVolumeData: MentionVolume[] = [
  { date: "Sep 16", "Pasta P.A.N.": 78, "Alimentos Polar": 99 },
];
