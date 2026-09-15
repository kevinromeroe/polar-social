import type { BrandData, MentionData, AlertData, TopPostData, SentimentCategorySummary, ChartAnnotation, TopComment } from "./mock-data";

export const brands: BrandData[] = [
  {
    brand: "Havoline",
    type: "own",
    productLine: "automotriz",
    networks: {
      instagram: { username: "havolinecolombia", followers: 17439, posts: 130, engagementRate: 1.65, growth: 1.5, avgLikes: 279, avgComments: 12, avgShares: 0 },
      facebook: { username: "HavolineColombia", followers: 109977, posts: 130, engagementRate: 0.21, growth: 0.5, avgLikes: 184, avgComments: 0, avgShares: 51 },
    },
  },
  {
    brand: "Mobil",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "mobil.lubricantescol", followers: 35293, posts: 111, engagementRate: 1.68, growth: 2.0, avgLikes: 580, avgComments: 13, avgShares: 0 },
      facebook: { username: "Mobil.lubricantescol", followers: 70487, posts: 49, engagementRate: 0.01, growth: 0.1, avgLikes: 6, avgComments: 0, avgShares: 2 },
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
  {
    brand: "Motul",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "motul.colombia", followers: 33294, posts: 33, engagementRate: 0.35, growth: 0.5, avgLikes: 113, avgComments: 3, avgShares: 0 },
      facebook: { username: "MotulColombia", followers: 9404, posts: 30, engagementRate: 0.10, growth: 0.1, avgLikes: 7, avgComments: 0, avgShares: 2 },
    },
  },
  {
    brand: "Castrol",
    type: "competitor",
    productLine: "automotriz",
    networks: {
      instagram: { username: "castrol.colombia", followers: 6729, posts: 96, engagementRate: 4.17, growth: 1.8, avgLikes: 275, avgComments: 5, avgShares: 0 },
      facebook: { username: "CastrolColombia", followers: 14406, posts: 62, engagementRate: 0.05, growth: 0.1, avgLikes: 5, avgComments: 0, avgShares: 2 },
    },
  },
];

export const ownBrands = brands.filter((b) => b.type === "own");
export const competitors = brands.filter((b) => b.type === "competitor");

export const brandColors: Record<string, string> = {
  Havoline: "#C8102E",
  Mobil: "#002F87",
  "Liqui Moly": "#003DA5",
  Motul: "#CE0E2D",
  Castrol: "#006B3F",
};

export const sovData = [
  { brand: "Havoline", mentions: 67791, percentage: 37.9 },
  { brand: "Mobil", mentions: 65875, percentage: 36.8 },
  { brand: "Castrol", mentions: 27356, percentage: 15.3 },
  { brand: "Liqui Moly", mentions: 13695, percentage: 7.7 },
  { brand: "Motul", mentions: 4079, percentage: 2.3 },
];

export const sentimentByBrand = [
  { brand: "Havoline", positive: 68, neutral: 25, negative: 7 },
  { brand: "Mobil", positive: 72, neutral: 20, negative: 8 },
  { brand: "Castrol", positive: 60, neutral: 28, negative: 12 },
  { brand: "Liqui Moly", positive: 65, neutral: 27, negative: 8 },
  { brand: "Motul", positive: 70, neutral: 22, negative: 8 },
];

export const growthTrend = [
  { date: "Dic", "Havoline": 1653 },
  { date: "Ene", "Havoline": 554 },
  { date: "Feb", "Havoline": 4649 },
  { date: "Mar", "Havoline": 45746 },
  { date: "Abr", "Havoline": 881 },
  { date: "May", "Havoline": 6029 },
  { date: "Jun", "Havoline": 1473 },
  { date: "Jul", "Havoline": 6550 },
  { date: "Ago", "Havoline": 256 },
];

export const mentionsByNetwork = [
  { network: "Instagram", mentions: 143423, percentage: 80.2 },
  { network: "Facebook", mentions: 35373, percentage: 19.8 },
];

const IMG = "https://tidctfgcbzziiqnbjjer.supabase.co/storage/v1/object/public/post-images";

export const topPosts: TopPostData[] = [
  // — Marca propia: mejores posts —
  { brand: "Havoline", network: "instagram", caption: "Muchos roces en la vía pasan por lo mismo: estar en el lugar donde nadie te ve. Rodar pegado a la puerta, quedarse en el punto ciego...", likes: 24154, comments: 1307, shares: 0, views: 0, date: "2026-03-18", url: "https://www.instagram.com/p/DWCrHQaDkM_/", imageUrl: `${IMG}/havoline-ig-puntos-ciegos.jpg`, ranking: "best", topComment: { author: "@cfelipe0328", text: "Si señor prioridad el ciclista y más tolerancia en las vías nadie es más que nadie humildad", likes: 8 } },
  { brand: "Havoline", network: "facebook", caption: "Muchos roces en la vía pasan por lo mismo: estar en el lugar donde nadie te ve. Rodar pegado a la puerta...", likes: 13446, comments: 0, shares: 5272, views: 0, date: "2026-03-18", url: "https://www.facebook.com/reel/1938988486714393/", imageUrl: `${IMG}/havoline-fb-puntos-ciegos.jpg`, ranking: "best", topComment: { author: "Usuario FB", text: "El espejo prácticamente lo tiene mirando al copiloto. Si ubica bien el espejo claro que el punto ciego mejora.", likes: 0 } },
  { brand: "Havoline", network: "facebook", caption: "Muchos creen que la seguridad depende solo del conductor, pero un buen parrillero también hace la diferencia.", likes: 3824, comments: 0, shares: 617, views: 0, date: "2026-07-24", url: "https://www.facebook.com/reel/4316502191907113/", imageUrl: `${IMG}/havoline-fb-parrillero.jpg`, ranking: "best", topComment: { author: "Usuario FB", text: "Importante mensaje, muchos parrilleros no saben cómo ir bien sentados.", likes: 0 } },
  // — Marca propia: peores posts —
  { brand: "Havoline", network: "instagram", caption: "Conoce nuestra línea completa de lubricantes para tu moto. Calidad que protege tu motor en cada kilómetro.", likes: 42, comments: 1, shares: 0, views: 0, date: "2026-08-15", ranking: "worst" },
  { brand: "Havoline", network: "facebook", caption: "Tip del día: revisa el nivel de aceite de tu moto cada 15 días para evitar desgaste prematuro del motor.", likes: 12, comments: 0, shares: 3, views: 0, date: "2026-08-20", ranking: "worst" },
  // — Competencia: mejores posts —
  { brand: "Mobil", network: "instagram", caption: "Por primera vez, un mismo apellido conquistó el podio del Gran Premio Mobil Delvac. Más que una victoria...", likes: 10906, comments: 31, shares: 0, views: 0, date: "2026-07-27", url: "https://www.instagram.com/p/DbTbeEDxNmm/", imageUrl: `${IMG}/mobil-ig-podio.jpg`, ranking: "best", topComment: { author: "@julianpedrazaf", text: "Ya queremos escuchar esos motores. Con toda este año!", likes: 12 } },
  { brand: "Mobil", network: "instagram", caption: "La historia ya tiene a su primera campeona. Juliana Castelblanco Rueda conquistó la pista y se convirtió en la primera mujer en ganar...", likes: 7563, comments: 47, shares: 0, views: 0, date: "2026-07-28", url: "https://www.instagram.com/p/DbVukb0xXQY/", imageUrl: `${IMG}/mobil-ig-campeona.jpg`, ranking: "best", topComment: { author: "@mariap_racing", text: "Increíble logro! Las mujeres también dominamos la pista 🏆", likes: 24 } },
  { brand: "Castrol", network: "instagram", caption: "Lucas tiene claro el objetivo para 2026. Estuvimos con él en el Autódromo de Tocancipá hablando del plan, las carreras...", likes: 6708, comments: 4, shares: 0, views: 0, date: "2026-03-04", url: "https://www.instagram.com/p/DVefLpMjlCY/", imageUrl: `${IMG}/castrol-ig-lucas.jpg`, ranking: "best", topComment: { author: "@lucasfan_co", text: "Solo Castrol para mis carreras. El mejor rendimiento en pista.", likes: 3 } },
  { brand: "Castrol", network: "instagram", caption: "¡GANA UNA EXPERIENCIA DE F1 CON CASTROL! ¿Listo para sentirte como piloto de Fórmula 1?", likes: 5480, comments: 27, shares: 0, views: 0, date: "2026-04-21", url: "https://www.instagram.com/p/DXaCfRiFECr/", imageUrl: `${IMG}/castrol-ig-f1.jpg`, ranking: "best", topComment: { author: "@andres_moto", text: "¿Cómo participo? Sería un sueño cumplido 🏎️", likes: 15 } },
  { brand: "Liqui Moly", network: "facebook", caption: "¡No contamines el aceite nuevo de tu moto! Antes de hacer el cambio de aceite, aplica LIQUI MOLY Engine Flush para eliminar residuos...", likes: 1911, comments: 0, shares: 48, views: 0, date: "2026-08-10", url: "https://www.facebook.com/reel/1072988555068766/", imageUrl: `${IMG}/liquimoly-fb-flush.jpg`, ranking: "best", topComment: { author: "Usuario FB", text: "Buen tip, yo siempre uso el flush antes del cambio y se nota la diferencia.", likes: 5 } },
  { brand: "Motul", network: "instagram", caption: "Lo que estás a punto de ver no es un viaje cualquiera, es una aventura de Guayaquil a Medellín con toda la potencia...", likes: 810, comments: 5, shares: 0, views: 0, date: "2026-05-18", url: "https://www.instagram.com/p/DX-KbFopF3A/", imageUrl: `${IMG}/motul-ig-aventura.jpg`, ranking: "best", topComment: { author: "@rider_colombia", text: "Esa ruta es espectacular, Motul aguanta todo el viaje sin problema.", likes: 2 } },
  // — Competencia: peores posts —
  { brand: "Mobil", network: "facebook", caption: "¿Ya conoces la gama completa de lubricantes Mobil? Encuentra el ideal para tu vehículo.", likes: 3, comments: 0, shares: 1, views: 0, date: "2026-06-15", ranking: "worst" },
  { brand: "Castrol", network: "facebook", caption: "Recuerda que un cambio de aceite a tiempo protege tu motor. Confía en Castrol.", likes: 2, comments: 0, shares: 0, views: 0, date: "2026-07-10", ranking: "worst" },
  { brand: "Liqui Moly", network: "instagram", caption: "Nuestro equipo técnico te espera en el punto de servicio autorizado. Agenda tu cita.", likes: 18, comments: 0, shares: 0, views: 0, date: "2026-07-22", ranking: "worst" },
  { brand: "Motul", network: "facebook", caption: "Lubricantes Motul: tecnología francesa para tu motor colombiano.", likes: 4, comments: 0, shares: 1, views: 0, date: "2026-06-28", ranking: "worst" },
  { brand: "Havoline", network: "facebook", caption: "La pelea entre carro y moto se volvió viral, y en los comentarios quedó claro: cada quien defiende su lado.", likes: 1853, comments: 0, shares: 194, views: 0, date: "2026-05-05", url: "https://www.facebook.com/reel/2268106087298540/", imageUrl: `${IMG}/havoline-fb-carro-moto.jpg`, ranking: "best", topComment: { author: "Usuario FB", text: "Los dos tienen la razón pero el respeto es lo que falta en las vías.", likes: 0 } },
];

export const mentions: MentionData[] = [
  { id: 1, brand: "Havoline", network: "Instagram", author: "@cfelipe0328", text: "Si señor prioridad el ciclista y más tolerancia en las vías nadie es más que nadie humildad", sentiment: "positive", date: "2026-07-03", likes: 8 },
  { id: 2, brand: "Havoline", network: "Instagram", author: "@hernando2428", text: "El ciclista no pierde nada si frena y deja pasar al motero, carro... Al final se evita un accidente y siempre el ciclista llevará la de perder.", sentiment: "neutral", date: "2026-07-03", likes: 0 },
  { id: 3, brand: "Havoline", network: "Instagram", author: "@stevan_salgado", text: "¡Yo quiero premios! Havoline siempre con los moteros.", sentiment: "positive", date: "2026-08-27", likes: 1 },
  { id: 4, brand: "Havoline", network: "Instagram", author: "@diego_ale_lopto", text: "Buena calvo! Acabamos de llegar de Ecuador con el Full gas Villavicencio y lo voy entendiendo!", sentiment: "positive", date: "2026-08-01", likes: 0 },
  { id: 5, brand: "Havoline", network: "Instagram", author: "@televisorcasa2023", text: "Se convirtió en propagandista de marcas. Cuando su opinión cambia por pago de propaganda pierde credibilidad.", sentiment: "negative", date: "2026-06-14", likes: 0 },
  { id: 6, brand: "Havoline", network: "Instagram", author: "@barrantes1603", text: "Sirve para carros también?", sentiment: "neutral", date: "2026-05-25", likes: 0 },
  { id: 7, brand: "Havoline", network: "Instagram", author: "@jrcreacionesysoluciones", text: "Muchas verdades en un solo vídeo. Gran contenido de seguridad vial.", sentiment: "positive", date: "2026-07-30", likes: 0 },
  { id: 8, brand: "Havoline", network: "Facebook", author: "Usuario FB", text: "El espejo prácticamente lo tiene mirando al copiloto. Si ubica bien el espejo claro que el punto ciego mejora.", sentiment: "neutral", date: "2026-03-18", likes: 0 },
  { id: 9, brand: "Havoline", network: "Facebook", author: "Usuario FB", text: "Excelente aceite pero el havoline dorado sintético lo he preguntado en varias partes y no lo venden.", sentiment: "neutral", date: "2026-02-25", likes: 0 },
  { id: 10, brand: "Havoline", network: "Instagram", author: "@kevin.13th.kun", text: "Ya deja de culpar al usuario de las malas prácticas de ingeniería. Perfectamente existen las aleaciones correctas de metales.", sentiment: "negative", date: "2026-06-13", likes: 1 },
  { id: 11, brand: "Mobil", network: "Instagram", author: "@julianpedrazaf", text: "Ya queremos escuchar esos motores. Con toda este año!", sentiment: "positive", date: "2026-04-01", likes: 0 },
  { id: 12, brand: "Castrol", network: "Instagram", author: "Usuario IG", text: "Solo Castrol para mis carreras. El mejor rendimiento en pista.", sentiment: "positive", date: "2026-03-04", likes: 0 },
];

export const alerts: AlertData[] = [
  { type: "viral", severity: "info", title: "Post viral de Havoline en marzo", description: "El contenido sobre puntos ciegos en motocicleta alcanzó 25,461 interacciones en Instagram y 18,718 en Facebook. El post más exitoso del período.", brand: "Havoline", date: "2026-03-18" },
  { type: "spike", severity: "warning", title: "Mobil domina julio con Gran Premio Delvac", description: "Mobil acumuló 43,821 interacciones en Instagram en julio, superando ampliamente a la competencia con contenido del Gran Premio de Tractomulas.", brand: "Mobil", date: "2026-07-30" },
  { type: "growth", severity: "info", title: "Castrol lidera engagement rate en Instagram", description: "Con 4.17% de engagement rate, Castrol tiene la tasa más alta de la categoría en Instagram, impulsada por contenido de motorsport y concursos.", brand: "Castrol", date: "2026-09-01" },
  { type: "sentiment", severity: "warning", title: "Baja actividad de Havoline en agosto", description: "Havoline registró solo 256 interacciones totales en agosto (202 IG + 54 FB), una caída significativa respecto a meses anteriores.", brand: "Havoline", date: "2026-08-31" },
  { type: "spike", severity: "info", title: "Liqui Moly fuerte en Facebook agosto", description: "Liqui Moly alcanzó 2,078 interacciones en Facebook en agosto, su mejor mes en esa red, impulsado por contenido educativo sobre mantenimiento.", brand: "Liqui Moly", date: "2026-08-10" },
];

export const sentimentCategorySummaries: Record<string, SentimentCategorySummary> = {
  Havoline: {
    positive: "Fans celebran el contenido de seguridad vial y convivencia en las vías, elogian la calidad del producto y muestran entusiasmo por promociones, premios y activaciones de marca como el Motoclub.",
    neutral: "Preguntas sobre disponibilidad de productos (aceite sintético dorado), consultas técnicas sobre uso en carros vs. motos, y debates sobre seguridad vial entre ciclistas, motociclistas y conductores.",
    negative: "Críticas sobre publicidad pagada y pérdida de credibilidad de influenciadores, cuestionamientos sobre prácticas de ingeniería y obsolescencia programada en la industria de lubricantes.",
  },
  Mobil: {
    positive: "Entusiasmo por el Gran Premio Mobil Delvac de tractomulas y reconocimiento a pilotos patrocinados.",
    neutral: "Comentarios generales sobre eventos y competencias de motorsport.",
    negative: "Sin menciones negativas significativas en el período.",
  },
  Castrol: {
    positive: "Lealtad de fans del motorsport, entusiasmo por concursos de experiencia F1 y contenido de automovilismo.",
    neutral: "Preguntas sobre patrocinios deportivos y disponibilidad de productos.",
    negative: "Sin menciones negativas relevantes en el período.",
  },
};

export const googleMapsData: { brand: string; rating: number; totalReviews: number; recentCount: number }[] = [];

export const productLineLabels: Record<string, string> = {
  automotriz: "Lubricantes",
};

export const productLineKeys = ["automotriz"];

export const chartAnnotations: ChartAnnotation[] = [
  { date: "Mar", brand: "Havoline", text: "Post viral \"Puntos ciegos en moto\" — 25K interacciones en IG + 18K en FB" },
  { date: "Jul", brand: "Havoline", text: "Contenido seguridad vial (parrillero) con alto engagement en FB (4.4K interacciones)" },
];
