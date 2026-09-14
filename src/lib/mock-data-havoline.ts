import type { BrandData, NetworkMetrics, MentionData, AlertData, TopPostData } from "./mock-data";

export const brands: BrandData[] = [
  {
    brand: "Havoline",
    type: "own",
    productLine: "automotriz",
    networks: {
      instagram: { username: "havoline_co", followers: 52300, posts: 312, engagementRate: 3.1, growth: 2.4, avgLikes: 1450, avgComments: 112, avgShares: 67, },
      facebook: { username: "HavolineColombia", followers: 134000, posts: 578, engagementRate: 1.2, growth: 0.6, avgLikes: 1320, avgComments: 189, avgShares: 98, },
      tiktok: { username: "havoline_co", followers: 41200, posts: 98, engagementRate: 4.8, growth: 5.3, avgLikes: 5400, avgComments: 234, avgShares: 412, },
      linkedin: { username: "havoline-colombia", followers: 12400, posts: 89, engagementRate: 2.3, growth: 1.8, avgLikes: 245, avgComments: 34, avgShares: 28, },
      x: { username: "Havoline_CO", followers: 18900, posts: 345, engagementRate: 1.6, growth: 0.9, avgLikes: 134, avgComments: 45, avgShares: 67, },
    },
  },
  {
    brand: "Delo",
    type: "own",
    productLine: "industrial",
    networks: {
      instagram: { username: "delo_colombia", followers: 8900, posts: 67, engagementRate: 1.8, growth: 1.2, avgLikes: 134, avgComments: 18, avgShares: 12, },
      facebook: { username: "DeloColombia", followers: 28000, posts: 189, engagementRate: 0.7, growth: 0.3, avgLikes: 167, avgComments: 34, avgShares: 23, },
      linkedin: { username: "delo-lubricantes", followers: 15600, posts: 134, engagementRate: 2.9, growth: 2.4, avgLikes: 389, avgComments: 56, avgShares: 45, },
      x: { username: "Delo_CO", followers: 5200, posts: 123, engagementRate: 1.1, growth: 0.4, avgLikes: 45, avgComments: 12, avgShares: 18, },
    },
  },
  {
    brand: "Mobil 1",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "mobil1_co", followers: 145000, posts: 567, engagementRate: 2.6, growth: 1.1, avgLikes: 3200, avgComments: 245, avgShares: 134, },
      facebook: { username: "Mobil1Colombia", followers: 389000, posts: 890, engagementRate: 0.8, growth: 0.3, avgLikes: 2600, avgComments: 345, avgShares: 178, },
      tiktok: { username: "mobil1_co", followers: 98000, posts: 167, engagementRate: 4.2, growth: 2.8, avgLikes: 11200, avgComments: 567, avgShares: 890, },
      linkedin: { username: "exxonmobil-co", followers: 34000, posts: 234, engagementRate: 2.1, growth: 1.4, avgLikes: 567, avgComments: 78, avgShares: 56, },
      x: { username: "Mobil1_CO", followers: 42000, posts: 456, engagementRate: 1.3, growth: -0.2, avgLikes: 234, avgComments: 67, avgShares: 89, },
    },
  },
  {
    brand: "Castrol",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "castrol_co", followers: 112000, posts: 489, engagementRate: 2.9, growth: 1.6, avgLikes: 2800, avgComments: 198, avgShares: 112, },
      facebook: { username: "CastrolColombia", followers: 298000, posts: 756, engagementRate: 0.9, growth: 0.4, avgLikes: 2200, avgComments: 289, avgShares: 145, },
      tiktok: { username: "castrol_co", followers: 76000, posts: 134, engagementRate: 3.9, growth: 3.2, avgLikes: 8900, avgComments: 412, avgShares: 678, },
      x: { username: "Castrol_CO", followers: 28000, posts: 389, engagementRate: 1.1, growth: 0.1, avgLikes: 167, avgComments: 45, avgShares: 67, },
    },
  },
  {
    brand: "Shell Helix",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "shellhelix_co", followers: 89000, posts: 345, engagementRate: 2.4, growth: 1.3, avgLikes: 1890, avgComments: 145, avgShares: 89, },
      facebook: { username: "ShellHelixColombia", followers: 245000, posts: 623, engagementRate: 0.7, growth: 0.2, avgLikes: 1450, avgComments: 198, avgShares: 112, },
      tiktok: { username: "shellhelix_co", followers: 52000, posts: 89, engagementRate: 3.6, growth: 2.4, avgLikes: 6700, avgComments: 312, avgShares: 456, },
      linkedin: { username: "shell-lubricantes-co", followers: 28000, posts: 178, engagementRate: 2.0, growth: 1.1, avgLikes: 456, avgComments: 56, avgShares: 38, },
      x: { username: "ShellHelix_CO", followers: 21000, posts: 267, engagementRate: 1.0, growth: 0.3, avgLikes: 112, avgComments: 34, avgShares: 45, },
    },
  },
  {
    brand: "Valvoline",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "valvoline_co", followers: 34000, posts: 198, engagementRate: 2.2, growth: 1.8, avgLikes: 678, avgComments: 56, avgShares: 34, },
      facebook: { username: "ValvolineColombia", followers: 87000, posts: 345, engagementRate: 0.6, growth: 0.1, avgLikes: 445, avgComments: 67, avgShares: 34, },
      tiktok: { username: "valvoline_co", followers: 19000, posts: 45, engagementRate: 4.1, growth: 4.5, avgLikes: 3400, avgComments: 156, avgShares: 234, },
      x: { username: "Valvoline_CO", followers: 11000, posts: 178, engagementRate: 0.9, growth: 0.2, avgLikes: 67, avgComments: 23, avgShares: 34, },
    },
  },
  {
    brand: "Motul",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "motul_co", followers: 67000, posts: 289, engagementRate: 3.4, growth: 2.1, avgLikes: 1890, avgComments: 134, avgShares: 89, },
      facebook: { username: "MotulColombia", followers: 156000, posts: 467, engagementRate: 0.8, growth: 0.5, avgLikes: 1100, avgComments: 156, avgShares: 78, },
      tiktok: { username: "motul_co", followers: 45000, posts: 112, engagementRate: 5.2, growth: 4.8, avgLikes: 7800, avgComments: 389, avgShares: 567, },
      x: { username: "Motul_CO", followers: 15000, posts: 234, engagementRate: 1.2, growth: 0.6, avgLikes: 89, avgComments: 28, avgShares: 45, },
    },
  },
  {
    brand: "Total Quartz",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "totalquartz_co", followers: 28000, posts: 156, engagementRate: 1.9, growth: 0.8, avgLikes: 456, avgComments: 34, avgShares: 23, },
      facebook: { username: "TotalQuartzCO", followers: 67000, posts: 289, engagementRate: 0.5, growth: -0.1, avgLikes: 289, avgComments: 45, avgShares: 23, },
      linkedin: { username: "totalenergies-co", followers: 18000, posts: 123, engagementRate: 1.8, growth: 1.2, avgLikes: 267, avgComments: 34, avgShares: 28, },
    },
  },
  {
    brand: "Pennzoil",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "pennzoil_co", followers: 18000, posts: 112, engagementRate: 2.0, growth: 1.2, avgLikes: 312, avgComments: 28, avgShares: 15, },
      facebook: { username: "PennzoilColombia", followers: 45000, posts: 198, engagementRate: 0.5, growth: 0.1, avgLikes: 189, avgComments: 34, avgShares: 18, },
      tiktok: { username: "pennzoil_co", followers: 12000, posts: 34, engagementRate: 3.8, growth: 5.1, avgLikes: 2100, avgComments: 98, avgShares: 145, },
    },
  },
  {
    brand: "Shell Rimula",
    type: "competitor",
    productLine: "industrial",
    networks: {
      instagram: { username: "shellrimula_co", followers: 12000, posts: 89, engagementRate: 1.5, growth: 0.6, avgLikes: 156, avgComments: 18, avgShares: 9, },
      facebook: { username: "ShellRimulaCO", followers: 34000, posts: 178, engagementRate: 0.4, growth: 0.1, avgLikes: 112, avgComments: 23, avgShares: 12, },
      linkedin: { username: "shell-rimula-co", followers: 22000, posts: 145, engagementRate: 2.4, growth: 1.8, avgLikes: 445, avgComments: 56, avgShares: 38, },
    },
  },
  {
    brand: "Mobil Delvac",
    type: "competitor",
    productLine: "industrial",
    networks: {
      instagram: { username: "mobildelvac_co", followers: 8900, posts: 67, engagementRate: 1.3, growth: 0.4, avgLikes: 98, avgComments: 12, avgShares: 6, },
      facebook: { username: "MobilDelvacCO", followers: 28000, posts: 145, engagementRate: 0.4, growth: -0.1, avgLikes: 89, avgComments: 18, avgShares: 9, },
      linkedin: { username: "mobil-delvac-co", followers: 19000, posts: 112, engagementRate: 2.1, growth: 1.5, avgLikes: 334, avgComments: 45, avgShares: 34, },
    },
  },
  {
    brand: "Gulf",
    type: "competitor",
    productLine: "industrial",
    networks: {
      instagram: { username: "gulf_co", followers: 15000, posts: 98, engagementRate: 1.7, growth: 0.9, avgLikes: 223, avgComments: 18, avgShares: 12, },
      facebook: { username: "GulfColombia", followers: 38000, posts: 198, engagementRate: 0.5, growth: 0.2, avgLikes: 156, avgComments: 28, avgShares: 15, },
    },
  },
  {
    brand: "Repsol",
    type: "competitor",
    productLine: "industrial",
    networks: {
      instagram: { username: "repsol_lubricantes_co", followers: 11000, posts: 78, engagementRate: 1.6, growth: 0.7, avgLikes: 156, avgComments: 15, avgShares: 8, },
      facebook: { username: "RepsolLubricantesCO", followers: 32000, posts: 167, engagementRate: 0.4, growth: 0.0, avgLikes: 112, avgComments: 23, avgShares: 11, },
      linkedin: { username: "repsol-lubricantes-co", followers: 14000, posts: 98, engagementRate: 1.9, growth: 1.3, avgLikes: 223, avgComments: 34, avgShares: 28, },
    },
  },
];

export const ownBrands = brands.filter((b) => b.type === "own");
export const competitors = brands.filter((b) => b.type === "competitor");

export const sovData = [
  { brand: "Mobil 1", mentions: 3120, percentage: 21.8 },
  { brand: "Havoline", mentions: 2680, percentage: 18.7 },
  { brand: "Castrol", mentions: 2340, percentage: 16.3 },
  { brand: "Shell Helix", mentions: 1560, percentage: 10.9 },
  { brand: "Motul", mentions: 1240, percentage: 8.7 },
  { brand: "Valvoline", mentions: 890, percentage: 6.2 },
  { brand: "Delo", mentions: 620, percentage: 4.3 },
  { brand: "Total Quartz", mentions: 480, percentage: 3.4 },
  { brand: "Pennzoil", mentions: 380, percentage: 2.7 },
  { brand: "Shell Rimula", mentions: 340, percentage: 2.4 },
  { brand: "Mobil Delvac", mentions: 280, percentage: 2.0 },
  { brand: "Gulf", mentions: 210, percentage: 1.5 },
  { brand: "Repsol", mentions: 170, percentage: 1.2 },
];

export const sentimentByBrand = [
  { brand: "Havoline", positive: 71, neutral: 22, negative: 7 },
  { brand: "Delo", positive: 65, neutral: 28, negative: 7 },
  { brand: "Mobil 1", positive: 74, neutral: 18, negative: 8 },
  { brand: "Castrol", positive: 67, neutral: 23, negative: 10 },
  { brand: "Shell Helix", positive: 63, neutral: 26, negative: 11 },
  { brand: "Valvoline", positive: 59, neutral: 28, negative: 13 },
  { brand: "Motul", positive: 76, neutral: 16, negative: 8 },
  { brand: "Total Quartz", positive: 54, neutral: 32, negative: 14 },
  { brand: "Pennzoil", positive: 52, neutral: 34, negative: 14 },
  { brand: "Shell Rimula", positive: 58, neutral: 30, negative: 12 },
  { brand: "Mobil Delvac", positive: 56, neutral: 32, negative: 12 },
  { brand: "Gulf", positive: 50, neutral: 36, negative: 14 },
  { brand: "Repsol", positive: 48, neutral: 38, negative: 14 },
];

export const growthTrend = [
  { date: "Abr 1", "Havoline": 246800, "Delo": 55200 },
  { date: "Abr 15", "Havoline": 248100, "Delo": 55600 },
  { date: "May 1", "Havoline": 249500, "Delo": 56100 },
  { date: "May 15", "Havoline": 251200, "Delo": 56500 },
  { date: "Jun 1", "Havoline": 253100, "Delo": 57000 },
  { date: "Jun 15", "Havoline": 254800, "Delo": 57400 },
  { date: "Jul 1", "Havoline": 256200, "Delo": 57700 },
  { date: "Jul 15", "Havoline": 257400, "Delo": 57900 },
  { date: "Ago 1", "Havoline": 258300, "Delo": 58100 },
  { date: "Ago 15", "Havoline": 258900, "Delo": 57700 },
  { date: "Sep 1", "Havoline": 259200, "Delo": 57700 },
  { date: "Sep 14", "Havoline": 258800, "Delo": 57700 },
];

export const mentionsByNetwork = [
  { network: "X", mentions: 4280, percentage: 29.9 },
  { network: "TikTok", mentions: 3890, percentage: 27.2 },
  { network: "Facebook", mentions: 2340, percentage: 16.4 },
  { network: "Instagram", mentions: 1780, percentage: 12.4 },
  { network: "Reddit", mentions: 980, percentage: 6.8 },
  { network: "LinkedIn", mentions: 680, percentage: 4.8 },
  { network: "Google Maps", mentions: 360, percentage: 2.5 },
];

export const topPosts: TopPostData[] = [
  { brand: "Havoline", network: "tiktok", caption: "Cambio de aceite en 3 minutos: lo que tu mecánico no te cuenta sobre Havoline ProDS", likes: 52300, comments: 3120, shares: 11200, views: 410000, date: "2026-09-08" },
  { brand: "Havoline", network: "instagram", caption: "Tu motor merece lo mejor. Havoline ProDS con tecnología sintética avanzada ahora en tu lubricentro", likes: 4200, comments: 312, shares: 234, views: 0, date: "2026-09-10" },
  { brand: "Havoline", network: "facebook", caption: "Fin de semana de ruta. Comparte tu destino favorito para rodar con Havoline", likes: 2890, comments: 678, shares: 412, views: 0, date: "2026-09-05" },
  { brand: "Delo", network: "linkedin", caption: "Caso de éxito: cómo una flota de 200 camiones redujo costos de mantenimiento 18% con Delo 400", likes: 1890, comments: 145, shares: 267, views: 0, date: "2026-09-06" },
  { brand: "Delo", network: "facebook", caption: "Tu flota merece protección de verdad. Delo 400 SDE: rendimiento comprobado kilómetro a kilómetro", likes: 890, comments: 89, shares: 123, views: 0, date: "2026-09-12" },
  { brand: "Havoline", network: "x", caption: "Gracias a los más de 500 asistentes al Havoline Racing Day en el Autódromo de Tocancipá. Nos vemos en noviembre.", likes: 1230, comments: 178, shares: 345, views: 0, date: "2026-09-03" },
];

export const mentions: MentionData[] = [
  { id: 1, brand: "Havoline", network: "X", author: "@mecanico_pro", text: "Llevo 8 años usando Havoline ProDS en mi taller y ningún cliente ha tenido problema de motor. El sintético de Havoline es top.", sentiment: "positive", date: "2026-09-13", likes: 345 },
  { id: 2, brand: "Havoline", network: "Reddit", author: "u/carros_colombia", text: "¿Alguien ha comparado Havoline vs Mobil 1 en motores turbo? Estoy entre los dos para mi Mazda CX-5.", sentiment: "neutral", date: "2026-09-12", likes: 67 },
  { id: 3, brand: "Delo", network: "LinkedIn", author: "Carlos Mendoza", text: "Migramos toda la flota de TransCarga a Delo 400 SDE hace 6 meses. Los intervalos de cambio se extendieron un 25%.", sentiment: "positive", date: "2026-09-11", likes: 234 },
  { id: 4, brand: "Mobil 1", network: "X", author: "@auto_review_co", text: "Mobil 1 sigue siendo el referente en sintéticos pero el precio se ha ido por las nubes. Ya no es tan accesible.", sentiment: "negative", date: "2026-09-13", likes: 567 },
  { id: 5, brand: "Castrol", network: "TikTok", author: "@tumecanico", text: "Castrol Edge vs Havoline ProDS: cuál es mejor para tu carro? Mira esta prueba real", sentiment: "neutral", date: "2026-09-10", likes: 12300 },
  { id: 6, brand: "Shell Helix", network: "Facebook", author: "Juan Pérez", text: "Cambié de Shell Helix a Havoline y la verdad no noto diferencia. Ambos buenos aceites.", sentiment: "neutral", date: "2026-09-09", likes: 89 },
  { id: 7, brand: "Motul", network: "Instagram", author: "@moto_racing_co", text: "Motul 300V es imbatible para motos deportivas. Lo uso en mi R6 y el motor vuela.", sentiment: "positive", date: "2026-09-12", likes: 4500 },
  { id: 8, brand: "Havoline", network: "Google Maps", author: "Andrea M.", text: "Excelente servicio en el lubricentro Havoline de la Calle 80. Rápido y con producto original.", sentiment: "positive", date: "2026-09-08", likes: 18 },
  { id: 9, brand: "Valvoline", network: "X", author: "@conductor_experto", text: "Valvoline subió el precio del galón un 15% y el envase ahora trae menos. Decepcionante.", sentiment: "negative", date: "2026-09-07", likes: 234 },
  { id: 10, brand: "Havoline", network: "TikTok", author: "@tips_mecanicos", text: "Tutorial: cómo saber si tu aceite Havoline es original y no falsificado. Ojo con las imitaciones.", sentiment: "positive", date: "2026-09-09", likes: 8900 },
  { id: 11, brand: "Delo", network: "Facebook", author: "Transportes del Valle", text: "Desde que usamos Delo en nuestros Kenworth, los costos de mantenimiento bajaron notablemente. 100% recomendado para flotas.", sentiment: "positive", date: "2026-09-10", likes: 156 },
  { id: 12, brand: "Mobil 1", network: "Reddit", author: "u/mecanica_avanzada", text: "Análisis de laboratorio: Mobil 1 ESP 5W-30 vs Havoline ProDS 5W-30. Ambos excelentes, Havoline gana en precio.", sentiment: "positive", date: "2026-09-11", likes: 189 },
];

export const alerts: AlertData[] = [
  { type: "sentiment", severity: "warning", title: "Pico de quejas sobre Valvoline", description: "Valvoline registró 28 menciones negativas en X en 48h por aumento de precio y reducción de contenido del envase.", brand: "Valvoline", date: "2026-09-13" },
  { type: "viral", severity: "info", title: "Video viral de Havoline en TikTok", description: "El tutorial de cambio de aceite alcanzó 410K views y 52K likes en 6 días. Altísimo engagement orgánico.", brand: "Havoline", date: "2026-09-08" },
  { type: "growth", severity: "info", title: "Havoline creció 5.3% en TikTok", description: "Mayor crecimiento quincenal en la categoría. Impulsado por contenido de tips mecánicos y comparativas.", brand: "Havoline", date: "2026-09-14" },
  { type: "review", severity: "warning", title: "Reseñas negativas en Google Maps para Shell Helix", description: "4 reseñas de 1-2 estrellas en lubricentros Shell en Bogotá esta semana. Quejas sobre tiempos de espera.", brand: "Shell Helix", date: "2026-09-12" },
  { type: "spike", severity: "info", title: "Castrol compite fuerte en TikTok", description: "Castrol alcanzó 3.2% de crecimiento en TikTok con contenido de comparativas mecánicas patrocinadas.", brand: "Castrol", date: "2026-09-11" },
];

export const googleMapsData = [
  { brand: "Havoline", rating: 4.4, totalReviews: 456, recentCount: 38 },
  { brand: "Delo", rating: 4.2, totalReviews: 178, recentCount: 14 },
  { brand: "Mobil 1", rating: 4.1, totalReviews: 612, recentCount: 42 },
  { brand: "Castrol", rating: 3.9, totalReviews: 389, recentCount: 28 },
  { brand: "Shell Helix", rating: 3.7, totalReviews: 534, recentCount: 45 },
  { brand: "Valvoline", rating: 3.5, totalReviews: 167, recentCount: 12 },
  { brand: "Motul", rating: 4.3, totalReviews: 234, recentCount: 19 },
];

export const productLineLabels: Record<string, string> = {
  automotriz: "Automotriz",
  industrial: "Industrial",
};

export const productLineKeys = ["automotriz", "industrial"];
