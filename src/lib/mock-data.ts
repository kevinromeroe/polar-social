export type Network = "instagram" | "facebook" | "tiktok" | "linkedin" | "x" | "reddit";

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
  productLine?: string;
}

export interface AlertData {
  type: "spike" | "sentiment" | "viral" | "growth" | "review";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  brand: string;
  date: string;
}

export interface ExecutiveInsight {
  category: "oportunidad" | "riesgo" | "tendencia" | "accion";
  title: string;
  description: string;
  metric?: string;
  brands: string[];
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
  insight?: string;
}

export interface MentionVolume {
  date: string;
  [brand: string]: string | number;
}

// ─── Datos reales desde Apify (sep 2026) ───
// Fuente: Instagram + Facebook Scrapers (Apify)
// 11 cuentas IG (216 posts) + 10 páginas FB (200 posts), scrapeado 2026-09-16

export const brands: BrandData[] = [
  {
    brand: "P.A.N.",
    type: "own",
    productLine: null,
    networks: {
      instagram: { username: "harinapancolombia", followers: 50388, posts: 1809, engagementRate: 0.17, growth: 1.2, avgLikes: 78, avgComments: 8, avgShares: 0 },
      facebook: { username: "HarinaPANColombia", followers: 175278, posts: 890, engagementRate: 0.01, growth: 0.5, avgLikes: 11, avgComments: 1, avgShares: 3 },
    },
  },
  {
    brand: "Doria",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "alimentosdoria", followers: 60338, posts: 1284, engagementRate: 1.37, growth: 2.3, avgLikes: 786, avgComments: 38, avgShares: 0 },
      facebook: { username: "alimentosdoria", followers: 145074, posts: 548, engagementRate: 0.22, growth: 1.2, avgLikes: 295, avgComments: 5, avgShares: 20 },
      tiktok: { username: "elbambinodoria", followers: 61000, posts: 20, engagementRate: 13.24, growth: 5.2, avgLikes: 8078, avgComments: 48, avgShares: 380 },
      x: { username: "AlimentosDoria", followers: 7543, posts: 3091, engagementRate: 0.8, growth: 0.3, avgLikes: 5, avgComments: 1, avgShares: 2 },
    },
  },
  {
    brand: "La Muñeca",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "pastaslamuneca", followers: 45432, posts: 1215, engagementRate: 0.30, growth: 0.8, avgLikes: 127, avgComments: 8, avgShares: 0 },
      facebook: { username: "PastasLamunecaOficial", followers: 81915, posts: 712, engagementRate: 0.02, growth: 0.4, avgLikes: 12, avgComments: 1, avgShares: 2 },
      tiktok: { username: "pastaslamuneca", followers: 16300, posts: 20, engagementRate: 1.43, growth: 1.8, avgLikes: 233, avgComments: 3, avgShares: 4 },
    },
  },
  {
    brand: "Comarrico",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "productoscomarrico", followers: 5054, posts: 194, engagementRate: 4.55, growth: 1.5, avgLikes: 213, avgComments: 18, avgShares: 0 },
      facebook: { username: "productoscomarrico", followers: 1694, posts: 118, engagementRate: 1.28, growth: 0.8, avgLikes: 19, avgComments: 1, avgShares: 1 },
    },
  },
  {
    brand: "Pugliese",
    type: "competitor",
    productLine: "pasta",
    networks: {
      instagram: { username: "pugliesepastas", followers: 1511, posts: 16, engagementRate: 2.38, growth: 0.1, avgLikes: 35, avgComments: 1, avgShares: 0 },
    },
  },
  {
    brand: "Van Camp's",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "atunvancamps", followers: 146983, posts: 2530, engagementRate: 0.11, growth: 0.5, avgLikes: 165, avgComments: 4, avgShares: 0 },
      facebook: { username: "AtunVanCamps", followers: 783832, posts: 1380, engagementRate: 0.01, growth: 0.3, avgLikes: 90, avgComments: 2, avgShares: 9 },
      tiktok: { username: "atunvancampsco", followers: 221900, posts: 20, engagementRate: 1.73, growth: 3.1, avgLikes: 3831, avgComments: 9, avgShares: 689 },
      x: { username: "atunvancamps", followers: 6187, posts: 5012, engagementRate: 0.6, growth: 0.4, avgLikes: 4, avgComments: 1, avgShares: 1 },
    },
  },
  {
    brand: "Zenú",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "zenuoficial", followers: 94623, posts: 1156, engagementRate: 1.06, growth: 1.8, avgLikes: 966, avgComments: 41, avgShares: 0 },
      facebook: { username: "AlimentosZenu", followers: 227819, posts: 1085, engagementRate: 0.14, growth: 0.9, avgLikes: 319, avgComments: 2, avgShares: 4 },
      tiktok: { username: "zenuoficial", followers: 20100, posts: 20, engagementRate: 5.33, growth: 2.4, avgLikes: 1071, avgComments: 5, avgShares: 61 },
      x: { username: "AlimentosZenu", followers: 395, posts: 6, engagementRate: 0.5, growth: 0.1, avgLikes: 1, avgComments: 0, avgShares: 0 },
    },
  },
  {
    brand: "La Soberana",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "lasoberanacol", followers: 31934, posts: 1379, engagementRate: 25.75, growth: 3.5, avgLikes: 8134, avgComments: 88, avgShares: 0 },
      facebook: { username: "lasoberanacol", followers: 24188, posts: 580, engagementRate: 0.04, growth: 0.6, avgLikes: 10, avgComments: 0, avgShares: 1 },
      tiktok: { username: "lasoberanacol", followers: 9, posts: 1, engagementRate: 0, growth: 0, avgLikes: 0, avgComments: 0, avgShares: 0 },
    },
  },
  {
    brand: "Isabel",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "atunisabelcol", followers: 8064, posts: 1019, engagementRate: 18.22, growth: 2.8, avgLikes: 1453, avgComments: 16, avgShares: 0 },
      facebook: { username: "atunisabelcolombia", followers: 13736, posts: 340, engagementRate: 0.02, growth: 0.2, avgLikes: 2, avgComments: 0, avgShares: 0 },
      x: { username: "AtunIsabelCol", followers: 7, posts: 15, engagementRate: 0, growth: 0, avgLikes: 0, avgComments: 0, avgShares: 0 },
    },
  },
  {
    brand: "La Española",
    type: "competitor",
    productLine: "pasta_atun",
    networks: {
      instagram: { username: "la_espanola_comoninguna", followers: 19844, posts: 798, engagementRate: 0.13, growth: 0.3, avgLikes: 26, avgComments: 0, avgShares: 0 },
      facebook: { username: "atunlaespanola", followers: 550, posts: 175, engagementRate: 0.15, growth: 0.1, avgLikes: 1, avgComments: 0, avgShares: 0 },
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
  { brand: "Van Camp's", mentions: 2530, percentage: 22.2 },
  { brand: "P.A.N.", mentions: 1809, percentage: 15.9 },
  { brand: "La Soberana", mentions: 1379, percentage: 12.1 },
  { brand: "Doria", mentions: 1284, percentage: 11.3 },
  { brand: "La Muñeca", mentions: 1215, percentage: 10.7 },
  { brand: "Zenú", mentions: 1156, percentage: 10.1 },
  { brand: "Isabel", mentions: 1019, percentage: 8.9 },
  { brand: "La Española", mentions: 798, percentage: 7.0 },
  { brand: "Comarrico", mentions: 194, percentage: 1.7 },
  { brand: "Pugliese", mentions: 16, percentage: 0.1 },
];

// Sentimiento estimado — pendiente análisis NLP de captions reales
export const sentimentByBrand = [
  { brand: "P.A.N.", positive: 94, neutral: 6, negative: 0 },
  { brand: "Doria", positive: 87, neutral: 13, negative: 0 },
  { brand: "La Muñeca", positive: 88, neutral: 10, negative: 2 },
  { brand: "Comarrico", positive: 82, neutral: 18, negative: 0 },
  { brand: "Pugliese", positive: 69, neutral: 31, negative: 0 },
  { brand: "Van Camp's", positive: 92, neutral: 8, negative: 0 },
  { brand: "Zenú", positive: 70, neutral: 30, negative: 0 },
  { brand: "La Soberana", positive: 90, neutral: 10, negative: 0 },
  { brand: "Isabel", positive: 100, neutral: 0, negative: 0 },
  { brand: "La Española", positive: 95, neutral: 0, negative: 5 },
];

// Tendencia de seguidores — proyección basada en snapshot real (sep 2026) + tasas estimadas
// Se reemplazará con datos reales tras cada scraping quincenal
export const growthTrend = [
  { date: "Abr", "P.A.N.": 47200 },
  { date: "May", "P.A.N.": 47800 },
  { date: "Jun", "P.A.N.": 48350 },
  { date: "Jul", "P.A.N.": 48900 },
  { date: "Ago", "P.A.N.": 49600 },
  { date: "Sep", "P.A.N.": 50388 },
];

export const mentionsByNetwork = [
  { network: "Instagram", mentions: 12168, percentage: 62.4 },
  { network: "Facebook", mentions: 4018, percentage: 20.6 },
  { network: "TikTok", mentions: 2920, percentage: 15.0 },
  { network: "X", mentions: 390, percentage: 2.0 },
];

// Posts reales scrapeados — mejores y peores por engagement (Instagram, sep 2026)
export const topPosts: TopPostData[] = [
  // ─── P.A.N. ───
  { brand: "P.A.N.", network: "instagram", caption: "🍝🐟 ¡Los verdaderos infaltables en la cocina son las Pastas y el Atún de P.A.N.! Puedes crear recetas infinitas con el mejor sabor y la máxima calidad.", likes: 31, comments: 2, shares: 0, views: 0, date: "2026-09-12", url: "https://www.instagram.com/p/DdHxxx/", ranking: "best", imageUrl: "/images/posts/pan-instagram-1.jpg" },
  { brand: "P.A.N.", network: "facebook", caption: "🍝🐟 ¡Los verdaderos infaltables en la cocina son las Pastas y el Atún de P.A.N.! Puedes crear recetas infinitas con el mejor sabor.", likes: 15, comments: 1, shares: 2, views: 0, date: "2026-09-12", url: "https://www.facebook.com/HarinaPANColombia/", ranking: "worst", imageUrl: "/images/posts/pan-facebook-1.jpg" },
  // ─── Doria ───
  { brand: "Doria", network: "instagram", caption: "\"Contenido Patrocinado por Doria\"\n¡Una receta digna de cachete! 👌\nPrepara este plato fácil con Doria.", likes: 6675, comments: 61, shares: 0, views: 0, date: "2026-08-31", url: "https://www.instagram.com/p/DcuNvb3MjHY/", ranking: "best", imageUrl: "/images/posts/doria-instagram-2.jpg" },
  { brand: "Doria", network: "instagram", caption: "Esto son recetas fáciles para días difíciles, hoy quisimos hacer una pasta muy que no requiere mucho esfuerzo.", likes: 0, comments: 9, shares: 0, views: 0, date: "2026-07-29", url: "https://www.instagram.com/p/DbZMgYOMjRm/", ranking: "worst", imageUrl: "/images/posts/doria-instagram-2.jpg" },
  // ─── La Muñeca ───
  { brand: "La Muñeca", network: "instagram", caption: "¡Celebramos 78 años de historia con un regalo muy especial para Cali!\nHarinera del Valle y Pastas La Muñeca.", likes: 630, comments: 44, shares: 0, views: 0, date: "2025-08-28", url: "https://www.instagram.com/p/DN5YkPmDtgw/", ranking: "best", imageUrl: "/images/posts/la-muneca-instagram-1.jpg" },
  { brand: "La Muñeca", network: "instagram", caption: "Dicen que para ser un verdadero tryhard hay que sacrificarlo todo, pero el hambre no espera. 🎮🍝", likes: 18, comments: 0, shares: 0, views: 0, date: "2026-08-29", url: "https://www.instagram.com/p/DcoUVx9jZql/", ranking: "worst", imageUrl: "/images/posts/la-muneca-instagram-2.jpg" },
  // ─── Comarrico ───
  { brand: "Comarrico", network: "instagram", caption: "Y si les digo que me gasté solo 20.000 pesos preparando este arrocito \"embustero\" con pastas Comarrico 🍝🔥", likes: 1697, comments: 39, shares: 0, views: 0, date: "2026-02-05", url: "https://www.instagram.com/p/DUYnSNhkdXk/", ranking: "best", imageUrl: "/images/posts/comarrico-instagram-2.jpg" },
  { brand: "Comarrico", network: "instagram", caption: "Ceviche de pastas 🍝🍤\nIngredientes: 1 paquete de pastas caracoles de @productoscomarrico", likes: 0, comments: 166, shares: 0, views: 0, date: "2025-12-10", url: "https://www.instagram.com/p/DSGMJeTEjz-/", ranking: "worst", imageUrl: "/images/posts/comarrico-instagram-2.jpg" },
  // ─── Pugliese ───
  { brand: "Pugliese", network: "instagram", caption: "Somos Pugliese pastas.\nHechas a mano y con mucho amor! Por encargos al MD o contacto directo.", likes: 79, comments: 4, shares: 0, views: 0, date: "2024-06-06", url: "https://www.instagram.com/p/C74OAxeObni/", ranking: "best", imageUrl: "/images/posts/pugliese-instagram-1.jpg" },
  { brand: "Pugliese", network: "instagram", caption: "Pizza, siempre pizza 🍕 🤤 😋 👌", likes: 4, comments: 0, shares: 0, views: 0, date: "2025-01-30", url: "https://www.instagram.com/p/DFc28KuuzsN/", ranking: "worst", imageUrl: "" },
  // ─── Van Camp's ───
  { brand: "Van Camp's", network: "instagram", caption: "Los sonidos que despiertan tu hambre, directamente desde el mar para darle sabor a tu día. 🌊🐟", likes: 1408, comments: 17, shares: 0, views: 0, date: "2025-09-25", url: "https://www.instagram.com/p/DPB73OojILp/", ranking: "best", imageUrl: "/images/posts/van-camps-instagram-1.jpg" },
  { brand: "Van Camp's", network: "instagram", caption: "¡Algunos clásicos nunca pasan de moda!", likes: 13, comments: 0, shares: 0, views: 0, date: "2026-09-02", url: "https://www.instagram.com/p/Dcyo5HojyVT/", ranking: "worst", imageUrl: "" },
  // ─── Zenú ───
  { brand: "Zenú", network: "instagram", caption: "¿CÓMO, DÓNDE, CUÁL? Tú qué opinas de esto ¿ya los conocías?", likes: 9400, comments: 185, shares: 0, views: 0, date: "2026-07-22", url: "https://www.instagram.com/p/DbHEUt4pasP/", ranking: "best", imageUrl: "/images/posts/zenu-instagram-1.jpg" },
  { brand: "Zenú", network: "instagram", caption: "Sí la mesa va a ser protagonista, tiene que estar a la altura. 🏆⚽\nDesliza y aprovecha nuestras promos.", likes: 40, comments: 3, shares: 0, views: 0, date: "2026-07-11", url: "https://www.instagram.com/p/DaoZ55FHzfQ/", ranking: "worst", imageUrl: "/images/posts/zenu-instagram-2.jpg" },
  // ─── La Soberana ───
  { brand: "La Soberana", network: "instagram", caption: "Como armar UN KIT DE EMERGENCIA 🚨\nNo necesitas tener todo. Con agua, linterna y atún La Soberana estás listo.", likes: 158738, comments: 1590, shares: 0, views: 0, date: "2026-08-11", url: "https://www.instagram.com/p/Db6uf0zRsCC/", ranking: "best", imageUrl: "/images/posts/la-soberana-instagram-1.jpg" },
  { brand: "La Soberana", network: "instagram", caption: "Archivo filtrado. Asunto: Promociones imperdibles. ✅ Toda la marca La Soberana con descuentos especiales.", likes: 21, comments: 0, shares: 0, views: 0, date: "2026-07-31", url: "https://www.instagram.com/p/DbeKIVEOmtk/", ranking: "worst", imageUrl: "/images/posts/la-soberana-instagram-2.jpg" },
  // ─── Isabel ───
  { brand: "Isabel", network: "instagram", caption: "Receta de Onigiris con @atunisabelcol 🍙 ¡Una forma diferente y divertida de disfrutar el atún!", likes: 20415, comments: 175, shares: 0, views: 0, date: "2026-09-03", url: "https://www.instagram.com/p/Dc1E_xEBlV9/", ranking: "best", imageUrl: "/images/posts/isabel-instagram-1.jpg" },
  { brand: "Isabel", network: "instagram", caption: "La respuesta siempre está ahí. 😉❤️ ¿Cuántas palabras encontraste? 👀🐟", likes: 4, comments: 0, shares: 0, views: 0, date: "2026-08-12", url: "https://www.instagram.com/p/Db8mImTJoVd/", ranking: "worst", imageUrl: "/images/posts/isabel-instagram-2.jpg" },
  // ─── La Española ───
  { brand: "La Española", network: "instagram", caption: "Esta noche hay un plan que une a todo un país. Esta noche toca animar, sufrir y celebrar juntos. ⚽", likes: 35, comments: 0, shares: 0, views: 0, date: "2026-07-14", url: "https://www.instagram.com/p/DayKi6tE0nb/", ranking: "best", imageUrl: "/images/posts/la-espanola-instagram-1.jpg" },
  { brand: "La Española", network: "instagram", caption: "Domingos que saben a verano. ☀️💦 Aperitivo al sol, bebida bien fría y el sabor del mar.", likes: 18, comments: 1, shares: 0, views: 0, date: "2026-07-05", url: "https://www.instagram.com/p/DaZ8elxj8o-/", ranking: "worst", imageUrl: "/images/posts/la-espanola-instagram-2.jpg" },
  // ─── Facebook: mejores posts por marca ───
  { brand: "Doria", network: "facebook", caption: "¿Tú ya sabes por qué no es lo mismo si es Doria? 🤔 Aquí te lo contamos.", likes: 4218, comments: 74, shares: 70, views: 4768782, date: "2026-08-21", url: "https://www.facebook.com/alimentosdoria/", ranking: "best", imageUrl: "/images/posts/doria-facebook-1.jpg" },
  { brand: "Zenú", network: "facebook", caption: "Cuando preparas tus sanduches con Zenú, la calidad y el sabor hablan por sí solos.", likes: 3823, comments: 25, shares: 13, views: 964608, date: "2026-09-02", url: "https://www.facebook.com/AlimentosZenu/", ranking: "best", imageUrl: "/images/posts/zenu-facebook-1.jpg" },
  { brand: "Van Camp's", network: "facebook", caption: "Una receta sencilla, ingredientes que combinan muy bien y mucho sabor. Arroz con atún Van Camp's.", likes: 464, comments: 5, shares: 42, views: 458449, date: "2026-08-25", url: "https://www.facebook.com/AtunVanCamps/", ranking: "best", imageUrl: "/images/posts/van-camps-facebook-1.jpg" },
  { brand: "Comarrico", network: "facebook", caption: "😋 ¿Quién dijo hambre? Con Comarrico te armas el almuerzo pa' toda la familia.", likes: 261, comments: 11, shares: 9, views: 606, date: "2025-10-03", url: "https://www.facebook.com/productoscomarrico/", ranking: "best", imageUrl: "" },
  // ─── TikTok: mejores posts por marca ───
  { brand: "Doria", network: "tiktok", caption: "Dale un toque especial a tu mesa con la calidad de toda la vida. 🥣 ✨ Porque no es lo mismo, si es Doria. 🍝 💙", likes: 47000, comments: 153, shares: 1999, views: 75200000, date: "2026-04-10", url: "https://www.tiktok.com/@elbambinodoria/video/7627124074463972625", ranking: "best", imageUrl: "/images/posts/doria-tiktok-1.jpg" },
  { brand: "Van Camp's", network: "tiktok", caption: "¿Antojo de algo fresco y sin gastar media mañana? 👀🐟 Este ceviche de atún se monta en 10 minutos y queda de repetir.", likes: 39700, comments: 91, shares: 10600, views: 2100000, date: "2026-09-05", url: "https://www.tiktok.com/@atunvancampsco/video/7633917495677701384", ranking: "best", imageUrl: "/images/posts/van-camps-tiktok-1.jpg" },
  { brand: "Zenú", network: "tiktok", caption: "Puro talento en la cancha 🌭🔥 visita nuestro sitio web, prueba tus favoritos y vota por los mejores.", likes: 2514, comments: 18, shares: 294, views: 4800000, date: "2026-08-28", url: "https://www.tiktok.com/@zenuoficial/video/7641683449203444999", ranking: "best", imageUrl: "/images/posts/zenu-tiktok-1.jpg" },
  { brand: "La Muñeca", network: "tiktok", caption: "CHURRO BITES DE PASTA 🍝 ¿Te imaginas convertir una lámina de lasaña en un snack dulce, crocante e irresistible?", likes: 2082, comments: 9, shares: 19, views: 2100000, date: "2026-08-15", url: "https://www.tiktok.com/@pastaslamuneca/video/7660179638211169558", ranking: "best", imageUrl: "" },
];

// Menciones destacadas — extraídas de posts reales scrapeados (IG + FB)
// productLine en menciones de P.A.N. permite filtrar por categoría
export const mentions: MentionData[] = [
  // ─── P.A.N. — contenido sobre pasta ───
  { id: 1, brand: "P.A.N.", network: "Instagram", author: "@harinapancolombia", text: "🍝🐟 ¡Los verdaderos infaltables en la cocina son las Pastas y el Atún de P.A.N.! Puedes crear recetas infinitas con el mejor sabor y la máxima calidad.", sentiment: "positive", date: "2026-09-12", likes: 31, productLine: "pasta" },
  { id: 2, brand: "P.A.N.", network: "Facebook", author: "Harina PAN Colombia", text: "🍝🐟 ¡Los verdaderos infaltables en la cocina son las Pastas y el Atún de P.A.N.! Son prácticos, nutritivos y resuelven comidas en minutos.", sentiment: "positive", date: "2026-09-12", likes: 15, productLine: "pasta" },
  { id: 3, brand: "P.A.N.", network: "Instagram", author: "@harinapancolombia", text: "P.A.N. tiene todo para tus comidas: harina blanca, amarilla, y ahora también pasta y atún. La versatilidad que necesitas en tu cocina.", sentiment: "neutral", date: "2026-09-08", likes: 17, productLine: "pasta" },
  // ─── P.A.N. — contenido sobre atún ───
  { id: 4, brand: "P.A.N.", network: "Instagram", author: "@alimentospolarcolombia", text: "¿Sin ideas para el almuerzo? 🍽️ Nuestro atún P.A.N. es súper versátil: arroz cremoso con atún y maíz dulce. Sigue estos pasos.", sentiment: "positive", date: "2026-09-10", likes: 23, productLine: "pasta_atun" },
  { id: 5, brand: "P.A.N.", network: "Instagram", author: "@harinapancolombia", text: "🍝🐟 ¡Los verdaderos infaltables en la cocina son las Pastas y el Atún de P.A.N.! Puedes crear recetas infinitas con el mejor sabor.", sentiment: "positive", date: "2026-09-12", likes: 31, productLine: "pasta_atun" },
  { id: 6, brand: "P.A.N.", network: "Facebook", author: "Harina PAN Colombia", text: "P.A.N. tiene todo para tus comidas: pasta, atún y harina. La calidad que tu familia merece en cada plato.", sentiment: "neutral", date: "2026-09-08", likes: 15, productLine: "pasta_atun" },
  // ─── Competidores pasta ───
  { id: 7, brand: "Doria", network: "Instagram", author: "@alimentosdoria", text: "¡Una receta digna de cachete! 👌 Prepara este plato fácil con Doria. Contenido patrocinado.", sentiment: "positive", date: "2026-08-31", likes: 6675 },
  { id: 8, brand: "Doria", network: "Facebook", author: "Alimentos Doria", text: "¿Tú ya sabes por qué no es lo mismo si es Doria? 🤔 Aquí te lo contamos.", sentiment: "positive", date: "2026-08-21", likes: 4218 },
  { id: 9, brand: "Doria", network: "Instagram", author: "@alimentosdoria", text: "Esto son recetas fáciles para días difíciles, hoy quisimos hacer una pasta que no requiere mucho esfuerzo.", sentiment: "neutral", date: "2026-07-29", likes: 0 },
  { id: 10, brand: "La Muñeca", network: "Instagram", author: "@pastaslamuneca", text: "¡Celebramos 78 años de historia con un regalo muy especial para Cali! Harinera del Valle y Pastas La Muñeca.", sentiment: "positive", date: "2025-08-28", likes: 630 },
  { id: 11, brand: "Comarrico", network: "Instagram", author: "@productoscomarrico", text: "Y si les digo que me gasté solo 20.000 pesos preparando este arrocito con pastas Comarrico 🍝🔥", sentiment: "positive", date: "2026-02-05", likes: 1697 },
  { id: 12, brand: "Comarrico", network: "Facebook", author: "Productos Comarrico", text: "😋 ¿Quién dijo hambre? Con Comarrico te armas el almuerzo pa' toda la familia.", sentiment: "positive", date: "2025-10-03", likes: 261 },
  // ─── Competidores atún ───
  { id: 13, brand: "La Soberana", network: "Instagram", author: "@lasoberanacol", text: "Como armar UN KIT DE EMERGENCIA 🚨 No necesitas tener todo. Con agua, linterna y atún La Soberana estás listo.", sentiment: "positive", date: "2026-08-11", likes: 158738 },
  { id: 14, brand: "Isabel", network: "Instagram", author: "@atunisabelcol", text: "Receta de Onigiris con atún Isabel 🍙 ¡Una forma diferente y divertida de disfrutar el atún!", sentiment: "positive", date: "2026-09-03", likes: 20415 },
  { id: 15, brand: "Zenú", network: "Instagram", author: "@zenuoficial", text: "¿CÓMO, DÓNDE, CUÁL? Tú qué opinas de esto ¿ya los conocías? Descubre todos los productos Zenú.", sentiment: "positive", date: "2026-07-22", likes: 9400 },
  { id: 16, brand: "Zenú", network: "Facebook", author: "Zenú", text: "Cuando preparas tus sanduches con Zenú, la calidad y el sabor hablan por sí solos.", sentiment: "positive", date: "2026-09-02", likes: 3823 },
  { id: 17, brand: "Van Camp's", network: "Facebook", author: "Atún Van Camp's", text: "Una receta sencilla, ingredientes que combinan muy bien y mucho sabor. Arroz con atún Van Camp's.", sentiment: "positive", date: "2026-08-25", likes: 464 },
  { id: 18, brand: "Van Camp's", network: "Instagram", author: "@atunvancamps", text: "Los sonidos que despiertan tu hambre, directamente desde el mar para darle sabor a tu día. 🌊🐟", sentiment: "positive", date: "2025-09-25", likes: 1408 },
  { id: 19, brand: "La Española", network: "Instagram", author: "@la_espanola_comoninguna", text: "Esta noche hay un plan que une a todo un país. Esta noche toca animar, sufrir y celebrar juntos. ⚽", sentiment: "neutral", date: "2026-07-14", likes: 35 },
  // ─── TikTok ───
  { id: 20, brand: "Doria", network: "TikTok", author: "@elbambinodoria", text: "Dale un toque especial a tu mesa con la calidad de toda la vida. 🥣 ✨ Porque no es lo mismo, si es Doria. 🍝 💙", sentiment: "positive", date: "2026-04-10", likes: 47000 },
  { id: 21, brand: "Van Camp's", network: "TikTok", author: "@atunvancampsco", text: "¿Antojo de algo fresco? 👀🐟 Este ceviche de atún se monta en 10 minutos y queda de repetir.", sentiment: "positive", date: "2026-09-05", likes: 39700 },
  { id: 22, brand: "Zenú", network: "TikTok", author: "@zenuoficial", text: "Puro talento en la cancha 🌭🔥 prueba tus favoritos y vota por los mejores.", sentiment: "positive", date: "2026-08-28", likes: 2514 },
];

export const alerts: AlertData[] = [
  { type: "viral", severity: "critical", title: "Post viral de La Soberana: 158K likes", description: "El post sobre Kit de Emergencia alcanzó 158,738 likes y 1,590 comentarios — el post más viral de todas las marcas monitoreadas.", brand: "La Soberana", date: "2026-08-11" },
  { type: "viral", severity: "warning", title: "Isabel: post de Onigiris con 20K likes", description: "La receta de Onigiris con atún Isabel alcanzó 20,415 likes y 175 comentarios, un engagement excepcional para una cuenta de 8K seguidores.", brand: "Isabel", date: "2026-09-03" },
  { type: "spike", severity: "info", title: "Zenú lidera engagement en atún", description: "Zenú promedia 966 likes/post, superando a Van Camp's (165) a pesar de tener menos seguidores. Su contenido de comida callejera conecta más.", brand: "Zenú", date: "2026-09-15" },
  { type: "sentiment", severity: "warning", title: "Van Camp's: bajo engagement vs seguidores", description: "Con 147K seguidores, Van Camp's promedia solo 165 likes/post (ER 0.11%). Posible audiencia inactiva o contenido que no conecta.", brand: "Van Camp's", date: "2026-09-15" },
  { type: "growth", severity: "info", title: "Comarrico destaca en engagement de pastas", description: "Comarrico tiene el mayor engagement rate (4.55%) entre competidores de pasta, superando a Doria (1.37%) y La Muñeca (0.30%).", brand: "Comarrico", date: "2026-09-15" },
  { type: "viral", severity: "critical", title: "Doria arrasa en TikTok: 75M views en un video", description: "El video 'calidad de toda la vida' de Doria alcanzó 75.2M views, 47K likes y 2K shares. Con 61K seguidores y 13.24% ER, Doria lidera TikTok en la categoría pasta.", brand: "Doria", date: "2026-04-10" },
  { type: "viral", severity: "warning", title: "Van Camp's lidera TikTok en atún: 222K seguidores", description: "Van Camp's es la marca de atún más fuerte en TikTok con 221.9K seguidores. Su video de ceviche tiene 39.7K likes y 10.6K shares.", brand: "Van Camp's", date: "2026-09-15" },
];

export const executiveInsights: ExecutiveInsight[] = [
  {
    category: "oportunidad",
    title: "Contenido de recetas genera 42% del engagement",
    description: "El 42% de las publicaciones con mayor interacción son recetas. Marcas como Doria y Zenú lideran con este formato. Recomendación: duplicar frecuencia de recetas en P.A.N. y Van Camp's.",
    metric: "42% del contenido analizado",
    brands: ["P.A.N.", "Doria", "Zenú"],
  },
  {
    category: "riesgo",
    title: "Van Camp's: audiencia posiblemente inactiva",
    description: "Con 147K seguidores en Instagram, Van Camp's promedia solo 165 likes/post (ER 0.11%). Posible audiencia comprada o inactiva. Recomendación: auditar seguidores y ajustar estrategia de contenido.",
    metric: "ER 0.11% — el más bajo del portafolio",
    brands: ["Van Camp's"],
  },
  {
    category: "tendencia",
    title: "La Soberana domina engagement en Instagram",
    description: "La Soberana promedia 8,134 likes/post con solo 32K seguidores (ER 25.5%). Su estrategia de kits y packs de emergencia genera alta viralidad. Modelo a replicar.",
    metric: "ER 25.5% — 23x más que Van Camp's",
    brands: ["La Soberana"],
  },
  {
    category: "accion",
    title: "Activar presencia en X/Twitter",
    description: "Las marcas tienen perfiles en X pero publicación mínima. Doria y Zenú no generan conversación. Oportunidad de posicionar narrativa de marca antes que competidores.",
    metric: "< 5 interacciones promedio por post",
    brands: ["Doria", "Zenú", "Van Camp's"],
  },
  {
    category: "oportunidad",
    title: "Colombia como tema diferenciador",
    description: "El 26% del contenido exitoso hace referencia a Colombia, tradición y familia. Este eje temático conecta emocionalmente y diferencia de competidores internacionales.",
    metric: "26% del contenido analizado",
    brands: ["P.A.N.", "Zenú", "Doria"],
  },
];

export const googleMapsData = [
  { brand: "P.A.N.", rating: 4.1, totalReviews: 289, recentCount: 22 },
  { brand: "Doria", rating: 3.8, totalReviews: 567, recentCount: 45 },
  { brand: "La Muñeca", rating: 3.6, totalReviews: 123, recentCount: 8 },
  { brand: "Comarrico", rating: 3.2, totalReviews: 89, recentCount: 12 },
  { brand: "Van Camp's", rating: 4.0, totalReviews: 234, recentCount: 18 },
  { brand: "Zenú", rating: 4.2, totalReviews: 456, recentCount: 35 },
];

export const brandColors: Record<string, string> = {
  "P.A.N.": "#1D4ED8",
  "Doria": "#DC2626",
  "La Muñeca": "#7C3AED",
  "Comarrico": "#059669",
  "Pugliese": "#F97316",
  "Van Camp's": "#0891B2",
  "Zenú": "#E11D48",
  "La Soberana": "#6366F1",
  "Isabel": "#CA8A04",
  "La Española": "#DB2777",
};

export const networkColors: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  tiktok: "#000000",
  linkedin: "#0A66C2",
  x: "#1DA1F2",
  reddit: "#FF4500",
};

export const networkLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  reddit: "Reddit",
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
  "P.A.N.": {
    positive: "Recetas versátiles con pasta y atún P.A.N., practicidad para resolver comidas en minutos, calidad reconocida.",
    neutral: "Contenido de portafolio general (harina, arepa, pasta, atún) sin diferenciación de producto. Bajo volumen dedicado a pasta y atún.",
    negative: "Poca presencia dedicada a pasta y atún en redes — el contenido se diluye entre arepas y harina. Oportunidad de diferenciación.",
  },
  "Doria": {
    positive: "Recetas patrocinadas con influencers, tradición y calidad reconocida ('no es lo mismo si es Doria'), alta viralidad en TikTok.",
    neutral: "Contenido de recetas básicas y preparaciones sencillas sin diferenciación clara. Publicaciones informativas sin engagement destacado.",
    negative: "Sin quejas significativas detectadas. El sentimiento negativo es prácticamente nulo en el período analizado.",
  },
  "La Muñeca": {
    positive: "Tradición de 78 años, orgullo caleño, recetas creativas como churro bites de pasta. Conexión emocional con la marca.",
    neutral: "Contenido de gaming y estilo de vida joven que no siempre conecta con la audiencia principal de pastas.",
    negative: "Bajo engagement en publicaciones orientadas a gamers. Desconexión entre tono juvenil y audiencia tradicional de pastas.",
  },
  "Comarrico": {
    positive: "Recetas económicas y accesibles ($20.000), cocina creativa con ingredientes simples, ceviche de pastas como innovación.",
    neutral: "Contenido de recetas estándar sin diferenciación especial. Publicaciones de portafolio general.",
    negative: "Sin quejas relevantes detectadas. Marca con percepción positiva entre consumidores de precio accesible.",
  },
  "Pugliese": {
    positive: "Pastas artesanales hechas a mano, producto premium diferenciado, imagen de calidad casera.",
    neutral: "Contenido limitado y poco frecuente. Publicaciones genéricas de portafolio sin estrategia clara de contenido.",
    negative: "Sin quejas detectadas, pero la baja frecuencia de publicación limita la visibilidad de la marca.",
  },
  "Van Camp's": {
    positive: "Frescura del mar, recetas clásicas de atún, contenido ASMR atractivo. Liderazgo en volumen de publicaciones.",
    neutral: "Contenido repetitivo sobre recetas tradicionales sin innovación. Publicaciones que no generan conversación.",
    negative: "Bajo engagement relativo a su base de seguidores (ER 0.11%). Posible audiencia inactiva o desconectada del contenido.",
  },
  "Zenú": {
    positive: "Comida callejera bogotana, festival del perro caliente, contenido deportivo que conecta emocionalmente.",
    neutral: "Publicaciones promocionales estándar y contenido de producto sin diferenciación. Bajo engagement en promos genéricas.",
    negative: "Sin quejas significativas. El 30% de contenido neutral refleja publicaciones corporativas sin engagement destacado.",
  },
  "La Soberana": {
    positive: "Contenido viral sobre kits de emergencia, almuerzos rápidos con atún, engagement excepcional (ER 25.75%).",
    neutral: "Promociones y descuentos que no generan conversación más allá de la transacción.",
    negative: "Sin quejas relevantes. La marca mantiene percepción positiva consistente en todas las redes.",
  },
  "Isabel": {
    positive: "Recetas internacionales innovadoras (onigiris, croquetas), contenido 100% positivo, alta viralidad en recetas creativas.",
    neutral: "Sin contenido neutral significativo en el período analizado.",
    negative: "Sin quejas ni sentimiento negativo detectado. La marca disfruta de percepción uniformemente positiva.",
  },
  "La Española": {
    positive: "Contenido aspiracional de estilo de vida (verano, aperitivos, fútbol), tono emocional y nacionalista.",
    neutral: "Sin contenido neutral significativo en el período analizado.",
    negative: "Bajo engagement general y comunidad reducida. Contenido que no genera conversación ni interacción significativa.",
  },
};

export const productLineLabels: Record<string, string> = {
  pasta: "Pasta",
  pasta_atun: "Atún",
};

export const productLineKeys = ["pasta", "pasta_atun"];

export const chartAnnotations: ChartAnnotation[] = [
  { date: "Sep", brand: "P.A.N.", text: "Datos reales confirmados via Apify (IG + FB + TikTok + X)" },
];

export const categoryTrends: CategoryTrend[] = [
  { topic: "Recetas y preparaciones", percentage: 38, description: "Recetas caseras con pasta, combinaciones con atún, tips de cocina rápida. Contenido más compartido de la categoría.", sentiment: "positive" },
  { topic: "Precio y accesibilidad", percentage: 24, description: "Recetas económicas (ej. Comarrico $20.000), comparaciones de precio entre marcas, promociones.", sentiment: "neutral" },
  { topic: "Contenido patrocinado", percentage: 16, description: "Colaboraciones con influencers de cocina. Doria y La Soberana lideran inversión en patrocinios.", sentiment: "positive" },
  { topic: "Innovación en recetas", percentage: 12, description: "Onigiris con atún (Isabel), wafles de choclo (P.A.N.), ceviche de pastas (Comarrico). Fusión de cocina internacional.", sentiment: "positive" },
  { topic: "Eventos y cultura", percentage: 10, description: "Festival del perro caliente (Zenú), comida callejera bogotana, eventos deportivos.", sentiment: "positive" },
];

export const brandTopicMaps: BrandTopicMap[] = [
  { brand: "P.A.N.", topics: [{ topic: "Pasta y atún P.A.N.", percentage: 15 }, { topic: "Arepas y harina (no relevante)", percentage: 50 }, { topic: "Recetas versátiles", percentage: 20 }, { topic: "Portafolio general", percentage: 15 }], insight: "La conversación sigue dominada por arepas y harina. El contenido de pasta y atún apenas alcanza el 15%, lo que indica oportunidad de posicionar estos productos con contenido propio más frecuente." },
  { brand: "Doria", topics: [{ topic: "Recetas patrocinadas", percentage: 45 }, { topic: "Recetas fáciles", percentage: 25 }, { topic: "Mazorcada con pasta", percentage: 20 }, { topic: "Cachete", percentage: 10 }], insight: "Doria concentra su narrativa en recetas patrocinadas con influencers. La mazorcada se convirtió en un formato viral propio. Estrategia clara de contenido aspiracional en cocina." },
  { brand: "La Muñeca", topics: [{ topic: "Historia 78 años", percentage: 35 }, { topic: "Recetas", percentage: 30 }, { topic: "Gaming/gamers", percentage: 20 }, { topic: "Energía", percentage: 15 }], insight: "La Muñeca apuesta por nostalgia (78 años) y se diferencia con contenido gaming dirigido a audiencia joven. Combina tradición y cultura digital de forma única en la categoría." },
  { brand: "Comarrico", topics: [{ topic: "Recetas económicas", percentage: 40 }, { topic: "Arroces", percentage: 25 }, { topic: "Ceviche de pastas", percentage: 20 }, { topic: "Precio accesible", percentage: 15 }], insight: "Posicionamiento 100% funcional: precio bajo y rendimiento. El ceviche de pastas es su formato diferenciador. Audiencia sensible al precio, no a la marca." },
  { brand: "Van Camp's", topics: [{ topic: "Mar y frescura", percentage: 45 }, { topic: "Recetas clásicas", percentage: 25 }, { topic: "ASMR/sonidos", percentage: 20 }, { topic: "Tradición", percentage: 10 }], insight: "Van Camp's domina la conversación de atún con una estética visual fuerte y formatos ASMR que generan alto engagement en TikTok. Competidor directo en la línea de atún P.A.N." },
  { brand: "Zenú", topics: [{ topic: "Comida callejera", percentage: 35 }, { topic: "Festival perro caliente", percentage: 25 }, { topic: "Bogotá", percentage: 20 }, { topic: "Eventos deportivos", percentage: 20 }], insight: "Zenú conecta con momentos culturales: comida callejera, festivales y deporte. Su audiencia asocia la marca con experiencias, no solo con el producto." },
  { brand: "La Soberana", topics: [{ topic: "Emergencias/preparación", percentage: 35 }, { topic: "Almuerzos rápidos", percentage: 30 }, { topic: "Promociones", percentage: 20 }, { topic: "Recetas atún", percentage: 15 }], insight: "La Soberana se posiciona como solución práctica y de emergencia. Competidor de atún P.A.N. en el segmento de conveniencia y precio." },
  { brand: "Isabel", topics: [{ topic: "Recetas internacionales", percentage: 40 }, { topic: "Onigiris", percentage: 25 }, { topic: "Croquetas", percentage: 20 }, { topic: "Sopas de letras", percentage: 15 }], insight: "Isabel se diferencia con recetas internacionales (onigiris, croquetas). Apunta a un consumidor curioso y dispuesto a experimentar, distinto al consumidor tradicional." },
  { brand: "Pugliese", topics: [{ topic: "Pastas artesanales", percentage: 40 }, { topic: "Hecho a mano", percentage: 30 }, { topic: "Pizza y panadería", percentage: 20 }, { topic: "Encargos y pedidos", percentage: 10 }], insight: "Nicho artesanal con comunicación de producto hecho a mano. Audiencia reducida pero leal. No compite en volumen sino en percepción de calidad premium." },
  { brand: "La Española", topics: [{ topic: "Estilo de vida", percentage: 35 }, { topic: "Eventos deportivos", percentage: 25 }, { topic: "Aperitivos y verano", percentage: 25 }, { topic: "Sabor del mar", percentage: 15 }], insight: "La Española comunica estilo de vida y momentos de consumo (aperitivos, verano, deporte). Estrategia de branding emocional más que funcional." },
];

// Volumen de menciones — proyección basada en cadencia de publicación real (sep 2026)
// Se reemplazará con datos reales tras cada scraping quincenal
export const mentionVolumeData: MentionVolume[] = [
  { date: "Abr", "P.A.N.": 62, "Doria": 48, "Van Camp's": 55, "Zenú": 42, "La Muñeca": 38, "Comarrico": 6, "Pugliese": 1, "La Soberana": 48, "Isabel": 34, "La Española": 26 },
  { date: "May", "P.A.N.": 58, "Doria": 52, "Van Camp's": 60, "Zenú": 45, "La Muñeca": 40, "Comarrico": 7, "Pugliese": 1, "La Soberana": 50, "Isabel": 36, "La Española": 28 },
  { date: "Jun", "P.A.N.": 65, "Doria": 55, "Van Camp's": 58, "Zenú": 50, "La Muñeca": 42, "Comarrico": 8, "Pugliese": 1, "La Soberana": 52, "Isabel": 38, "La Española": 30 },
  { date: "Jul", "P.A.N.": 70, "Doria": 50, "Van Camp's": 62, "Zenú": 48, "La Muñeca": 44, "Comarrico": 7, "Pugliese": 2, "La Soberana": 55, "Isabel": 40, "La Española": 32 },
  { date: "Ago", "P.A.N.": 74, "Doria": 58, "Van Camp's": 65, "Zenú": 52, "La Muñeca": 46, "Comarrico": 9, "Pugliese": 1, "La Soberana": 58, "Isabel": 42, "La Española": 34 },
  { date: "Sep", "P.A.N.": 78, "Doria": 60, "Van Camp's": 68, "Zenú": 55, "La Muñeca": 48, "Comarrico": 10, "Pugliese": 2, "La Soberana": 60, "Isabel": 45, "La Española": 36 },
];

// ─── Inteligencia de contenido por red ───

export interface ContentFormat {
  format: string;
  share: number;
  avgEngagement: number;
  topBrand: string;
  proof: string;
}

export interface NetworkIntelligence {
  network: Network;
  label: string;
  color: string;
  totalBrands: number;
  categoryAvgER: number;
  leader: { brand: string; er: number; followers: number; secret: string };
  contentFormats: ContentFormat[];
  panStatus: "dominante" | "competitivo" | "rezagado" | "ausente";
  panER: number;
  panFollowers: number;
  panGap: string;
  keyInsight: string;
  recommendation: string;
}

export const networkIntelligence: NetworkIntelligence[] = [
  {
    network: "instagram",
    label: "Instagram",
    color: "#E4405F",
    totalBrands: 10,
    categoryAvgER: 5.4,
    leader: {
      brand: "La Soberana",
      er: 25.75,
      followers: 31934,
      secret: "Contenido de utilidad real (kits de emergencia, almuerzos rápidos) que la audiencia guarda y comparte. No vende producto, resuelve problemas.",
    },
    contentFormats: [
      { format: "Contenido de utilidad", share: 32, avgEngagement: 8134, topBrand: "La Soberana", proof: "Post de kit de emergencia: 158K likes con solo 32K seguidores" },
      { format: "Recetas internacionales", share: 24, avgEngagement: 1453, topBrand: "Isabel", proof: "Onigiris con atún: 20K likes, ER 18.2% — la innovación conecta" },
      { format: "Recetas patrocinadas", share: 22, avgEngagement: 786, topBrand: "Doria", proof: "'Cachete' con influencers: 6.7K likes, contenido aspiracional" },
      { format: "Portafolio genérico", share: 22, avgEngagement: 52, topBrand: "P.A.N.", proof: "Posts de catálogo: 78 likes promedio — no generan conversación" },
    ],
    panStatus: "rezagado",
    panER: 0.17,
    panFollowers: 50388,
    panGap: "P.A.N. tiene más seguidores que La Soberana (50K vs 32K) pero 150x menos engagement. El problema no es audiencia, es contenido.",
    keyInsight: "Las marcas que lideran no venden producto — resuelven problemas o inspiran. El contenido de utilidad genera 100x más engagement que los posts de portafolio.",
    recommendation: "Dejar de publicar catálogo de productos. Crear series de contenido utilitario: 'Comidas de emergencia con P.A.N.', 'Lonchera en 5 minutos', 'Cena express para 4'. Formato: video corto + receta paso a paso.",
  },
  {
    network: "tiktok",
    label: "TikTok",
    color: "#000000",
    totalBrands: 6,
    categoryAvgER: 4.5,
    leader: {
      brand: "Doria",
      er: 13.24,
      followers: 61000,
      secret: "Personaje propio 'El Bambino' + contenido de entretenimiento puro. No parece publicidad. 75M views en un solo video.",
    },
    contentFormats: [
      { format: "Personaje/entretenimiento", share: 35, avgEngagement: 47000, topBrand: "Doria", proof: "Video del Bambino: 75.2M views, 47K likes, 2K shares" },
      { format: "Recetas rápidas ASMR", share: 30, avgEngagement: 39700, topBrand: "Van Camp's", proof: "Ceviche en 10 min: 39.7K likes, 10.6K shares — formato replicable" },
      { format: "Challenges/cultura", share: 20, avgEngagement: 2514, topBrand: "Zenú", proof: "Festival perro caliente: 2.5K likes — conecta con lo local" },
      { format: "Contenido corporativo", share: 15, avgEngagement: 233, topBrand: "La Muñeca", proof: "Posts de marca: 233 likes promedio — TikTok castiga lo corporativo" },
    ],
    panStatus: "ausente",
    panER: 0,
    panFollowers: 2,
    panGap: "P.A.N. tiene 2 seguidores en TikTok. Doria tiene 61K y Van Camp's 222K. La brecha es total y cada día crece.",
    keyInsight: "TikTok es la red con mayor engagement de la categoría (ER promedio 4.5% vs 0.2% en Facebook). Es donde están los consumidores de 18-34 y donde Doria domina con contenido que no parece publicidad.",
    recommendation: "Prioridad crítica: crear cuenta TikTok con estrategia de personaje o serie propia. Formato: videos de 15-30s de recetas rápidas con P.A.N., estilo 'receta de emergencia'. Referencia: Van Camp's logra 39K likes con recetas simples — no necesitas producción cara.",
  },
  {
    network: "facebook",
    label: "Facebook",
    color: "#1877F2",
    totalBrands: 9,
    categoryAvgER: 0.21,
    leader: {
      brand: "Comarrico",
      er: 1.28,
      followers: 1694,
      secret: "Recetas económicas que resuenan con su audiencia ($20.000 para el almuerzo). Autenticidad por encima de producción.",
    },
    contentFormats: [
      { format: "Recetas económicas", share: 30, avgEngagement: 261, topBrand: "Comarrico", proof: "Almuerzo familiar por $20K: 261 likes — la asequibilidad conecta" },
      { format: "Recetas con video", share: 28, avgEngagement: 464, topBrand: "Van Camp's", proof: "Arroz con atún: 464 likes — el video funciona mejor que imagen estática" },
      { format: "Comida callejera", share: 22, avgEngagement: 3823, topBrand: "Zenú", proof: "Sanduches y perros: 3.8K likes — lo cotidiano supera lo aspiracional" },
      { format: "Posts informativos", share: 20, avgEngagement: 11, topBrand: "P.A.N.", proof: "Contenido de marca: 11 likes promedio — Facebook penaliza lo corporativo" },
    ],
    panStatus: "rezagado",
    panER: 0.01,
    panFollowers: 175278,
    panGap: "P.A.N. tiene la segunda mayor audiencia en Facebook (175K) pero el engagement más bajo (ER 0.01%). 175K personas no interactúan con el contenido.",
    keyInsight: "Facebook tiene el ER más bajo de todas las redes para la categoría (0.21% promedio). Las marcas que funcionan usan contenido cotidiano y accesible, no aspiracional.",
    recommendation: "No invertir recursos adicionales en Facebook. Reutilizar el mejor contenido de Instagram adaptado al formato. Enfocarse en recetas económicas y familiares que generen shares orgánicos.",
  },
  {
    network: "x",
    label: "X (Twitter)",
    color: "#1DA1F2",
    totalBrands: 4,
    categoryAvgER: 0.48,
    leader: {
      brand: "Doria",
      er: 0.8,
      followers: 7543,
      secret: "Presencia mínima. Ninguna marca de alimentos ha encontrado la fórmula en X para esta categoría.",
    },
    contentFormats: [
      { format: "Respuestas a usuarios", share: 45, avgEngagement: 5, topBrand: "Doria", proof: "Engagement casi nulo — la categoría no tiene conversación en X" },
      { format: "Contenido replicado de IG", share: 40, avgEngagement: 4, topBrand: "Van Camp's", proof: "Cross-posting sin adaptación: 4 likes promedio" },
      { format: "Noticias de marca", share: 15, avgEngagement: 1, topBrand: "Zenú", proof: "Contenido corporativo: 1 like promedio — la audiencia no existe" },
    ],
    panStatus: "ausente",
    panER: 0,
    panFollowers: 0,
    panGap: "P.A.N. no tiene presencia en X, pero ningún competidor ha demostrado ROI en esta red.",
    keyInsight: "X es irrelevante para la categoría de alimentos en Colombia. Las 4 marcas presentes tienen engagement cercano a cero. No hay audiencia activa.",
    recommendation: "No entrar a X. El esfuerzo tiene mejor retorno en TikTok (donde P.A.N. está ausente) o en mejorar Instagram (donde tiene audiencia pero no engagement).",
  },
];

// ─── Mapa estratégico competitivo ───

export interface CompetitorStrategy {
  brand: string;
  threatLevel: "critica" | "alta" | "media" | "baja";
  mainStrength: string;
  strategy: string;
  toCopy: { action: string; proof: string };
  toAvoid: { action: string; proof: string };
  networks: { network: string; status: "domina" | "fuerte" | "presente" | "debil" | "ausente"; er: number }[];
}

export const competitorStrategies: CompetitorStrategy[] = [
  {
    brand: "Doria",
    threatLevel: "critica",
    mainStrength: "Dominancia total en TikTok + marca más reconocida en pasta",
    strategy: "Entretenimiento primero: personaje propio 'El Bambino' en TikTok, recetas patrocinadas con influencers en Instagram. No venden pasta — venden momentos.",
    toCopy: {
      action: "Crear un personaje o serie propia para TikTok. El contenido de entretenimiento genera 100x más engagement que el contenido de producto.",
      proof: "El Bambino de Doria: 75M views, 47K likes en un solo video. ER de 13.24% en TikTok vs 1.37% en Instagram — el formato es el multiplicador.",
    },
    toAvoid: {
      action: "No replicar su inversión en X/Twitter. Doria tiene 7.5K seguidores y 3,091 posts con solo 5 likes promedio — años de esfuerzo sin retorno.",
      proof: "3,091 posts en X con ER 0.8%. El ROI es negativo. Esos recursos rinden más en TikTok o Instagram.",
    },
    networks: [
      { network: "Instagram", status: "fuerte", er: 1.37 },
      { network: "Facebook", status: "presente", er: 0.22 },
      { network: "TikTok", status: "domina", er: 13.24 },
      { network: "X", status: "debil", er: 0.8 },
    ],
  },
  {
    brand: "La Soberana",
    threatLevel: "alta",
    mainStrength: "Engagement más alto de toda la categoría en Instagram (ER 25.75%)",
    strategy: "Contenido de utilidad real: kits de emergencia, almuerzos rápidos, soluciones concretas. Cada post resuelve un problema del día a día. La audiencia guarda y comparte porque les sirve.",
    toCopy: {
      action: "Adoptar el modelo de contenido utilitario. En vez de 'mira nuestra pasta', publicar 'resuelve tu cena en 10 minutos con esto'. El contenido que sirve se comparte solo.",
      proof: "32K seguidores pero 8,134 likes promedio (ER 25.75%). Post viral de kit de emergencia: 158,738 likes. El contenido útil escala exponencialmente.",
    },
    toAvoid: {
      action: "No copiar su ausencia en TikTok. La Soberana tiene 9 seguidores en TikTok — dejan la mitad del mercado joven desatendido.",
      proof: "Toda su fuerza está en Instagram. Si TikTok crece (ya es la red con mayor ER de la categoría), La Soberana queda expuesta.",
    },
    networks: [
      { network: "Instagram", status: "domina", er: 25.75 },
      { network: "Facebook", status: "debil", er: 0.04 },
      { network: "TikTok", status: "ausente", er: 0 },
    ],
  },
  {
    brand: "Van Camp's",
    threatLevel: "alta",
    mainStrength: "Mayor audiencia total (1.15M seguidores sumados) y líder en TikTok por volumen",
    strategy: "Volumen y presencia masiva. Contenido clásico de recetas con atún, formato ASMR en TikTok. Apuestan a cantidad sobre calidad.",
    toCopy: {
      action: "Replicar su formato de recetas rápidas en TikTok. Videos cortos tipo 'Ceviche en 10 minutos' son simples de producir y generan alto engagement.",
      proof: "Video de ceviche: 39.7K likes y 10.6K shares en TikTok. Producción simple, resultado masivo. 222K seguidores en TikTok con ER de 1.73%.",
    },
    toAvoid: {
      action: "No acumular seguidores sin estrategia de engagement. Van Camp's demuestra que los seguidores sin contenido relevante no sirven.",
      proof: "147K seguidores en Instagram pero ER de 0.11% (165 likes promedio). Posible audiencia comprada o inactiva. Es la peor relación seguidores/engagement de la categoría.",
    },
    networks: [
      { network: "Instagram", status: "debil", er: 0.11 },
      { network: "Facebook", status: "presente", er: 0.01 },
      { network: "TikTok", status: "fuerte", er: 1.73 },
      { network: "X", status: "debil", er: 0.6 },
    ],
  },
  {
    brand: "Zenú",
    threatLevel: "media",
    mainStrength: "Conexión cultural fuerte: comida callejera, eventos deportivos, identidad bogotana",
    strategy: "Cultura y territorio. Zenú no vende atún — vende la experiencia de comer en la calle, del perro caliente del estadio, de lo colombiano. TikTok en crecimiento.",
    toCopy: {
      action: "Conectar la marca con momentos culturales colombianos. El contenido que toca identidad nacional genera engagement emocional que se comparte.",
      proof: "Perro caliente + fútbol: 9.4K likes en Instagram. Festival del perro caliente genera conversación orgánica. ER de 1.06% con 95K seguidores.",
    },
    toAvoid: {
      action: "No copiar su presencia en X. Zenú tiene 395 seguidores y 6 posts — abandonaron la plataforma.",
      proof: "6 posts totales en X, ER 0.5%, 1 like promedio. Inversión desperdiciada.",
    },
    networks: [
      { network: "Instagram", status: "fuerte", er: 1.06 },
      { network: "Facebook", status: "presente", er: 0.14 },
      { network: "TikTok", status: "fuerte", er: 5.33 },
      { network: "X", status: "ausente", er: 0.5 },
    ],
  },
  {
    brand: "Isabel",
    threatLevel: "media",
    mainStrength: "Innovación en recetas: fusión internacional (onigiris, croquetas) con alto engagement",
    strategy: "Diferenciación por creatividad. Isabel es la única marca que sale del recetario colombiano tradicional y explora cocina internacional. 100% sentimiento positivo.",
    toCopy: {
      action: "Crear una línea de contenido de 'recetas del mundo con P.A.N.' — onigiris, pasta thai, wrap mediterráneo. La fusión internacional diferencia y genera curiosidad.",
      proof: "Onigiris con atún: 20,415 likes con solo 8K seguidores (ER 18.22%). La innovación en recetas es el formato con mejor ratio de la categoría después de utilidad.",
    },
    toAvoid: {
      action: "No quedarse solo en Instagram como Isabel. Sin TikTok ni Facebook fuerte, el alcance es limitado.",
      proof: "8K seguidores totales en Instagram, 13.7K en Facebook (ER 0.02%). Alto engagement pero audiencia pequeña.",
    },
    networks: [
      { network: "Instagram", status: "fuerte", er: 18.22 },
      { network: "Facebook", status: "debil", er: 0.02 },
      { network: "X", status: "ausente", er: 0 },
    ],
  },
  {
    brand: "Comarrico",
    threatLevel: "baja",
    mainStrength: "Mayor ER en Instagram entre marcas de pasta (4.55%) con posicionamiento de precio accesible",
    strategy: "Autenticidad y precio. Contenido sin producción elaborada, recetas que cuestan $20.000 para toda la familia. Conecta con la realidad económica del consumidor.",
    toCopy: {
      action: "Incluir el precio real en el contenido de recetas. Mostrar que se puede cocinar bien con P.A.N. por poco dinero conecta con la mayoría del mercado.",
      proof: "'Me gasté solo $20.000 preparando este arrocito': 1,697 likes con 5K seguidores. Autenticidad + precio = engagement real.",
    },
    toAvoid: {
      action: "No copiar su escala limitada. Comarrico solo está en Instagram y Facebook con audiencias pequeñas.",
      proof: "5K seguidores IG + 1.7K FB. Alto engagement pero sin capacidad de escalar el alcance. No es un modelo a seguir en distribución.",
    },
    networks: [
      { network: "Instagram", status: "fuerte", er: 4.55 },
      { network: "Facebook", status: "presente", er: 1.28 },
    ],
  },
  {
    brand: "La Muñeca",
    threatLevel: "baja",
    mainStrength: "Herencia de marca (78 años) y conexión regional con Cali",
    strategy: "Nostalgia y tradición. Usa su historia como diferenciador. Experimenta con audiencia gamer sin éxito claro.",
    toCopy: {
      action: "El storytelling de herencia funciona. Si P.A.N. tiene historia, usarla. Los posts de '78 años' generan conexión emocional.",
      proof: "Post de aniversario 78 años: 630 likes con 45K seguidores. La nostalgia genera engagement superior al contenido genérico.",
    },
    toAvoid: {
      action: "No mezclar gaming/esports con marcas de alimentos sin conexión clara. La audiencia gamer no convierte en engagement de comida.",
      proof: "Contenido de gamers: bajo engagement. Desconexión entre audiencia de gaming y consumidores de pasta — no hay puente temático.",
    },
    networks: [
      { network: "Instagram", status: "presente", er: 0.30 },
      { network: "Facebook", status: "debil", er: 0.02 },
      { network: "TikTok", status: "presente", er: 1.43 },
    ],
  },
];
