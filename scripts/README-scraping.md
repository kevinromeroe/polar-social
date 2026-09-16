# Scraping Periódico — Escucha Activa de Clientes

## Scripts disponibles

| Script | Descripción | Costo estimado |
|--------|------------|----------------|
| `scrape-polar.mjs` | Scraper original IG + FB | ~$2-3 |
| `scrape-polar-tiktok.mjs` | TikTok videos | ~$0.50 |
| `scrape-polar-x.mjs` | X/Twitter tweets | ~$0.01 |
| `scrape-polar-fb.mjs` | Facebook páginas + posts | ~$1.00 |
| `scrape-polar-linkedin.mjs` | LinkedIn empresas | ~$0.05 |
| `scrape-all.mjs` | Scraping completo via Supabase | ~$3-5 |

## Configuración del scraping periódico (cada 15 días)

### Opción 1: Apify Schedules (Recomendado)

1. Ir a [Apify Console](https://console.apify.com/schedules)
2. Crear un Schedule por cada red:
   - **Instagram**: Cada 15 días, actor `apify/instagram-profile-scraper`
   - **Facebook**: Cada 15 días, actor `apify/facebook-pages-scraper`  
   - **TikTok**: Cada 15 días, actor `clockworks/free-tiktok-scraper`
3. Usar las mismas configuraciones de input que los scripts locales

### Opción 2: GitHub Actions (CI/CD)

Archivo `.github/workflows/scrape.yml`:

```yaml
name: Scraping quincenal
on:
  schedule:
    - cron: '0 6 1,15 * *'  # Día 1 y 15 de cada mes a las 6am UTC
  workflow_dispatch: {}

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: node scripts/scrape-all.mjs --client polar
        env:
          APIFY_API_TOKEN: ${{ secrets.APIFY_API_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### Opción 3: Cron local (Mac/Linux)

```bash
# Editar crontab
crontab -e

# Agregar (ejecuta día 1 y 15 de cada mes a las 6am):
0 6 1,15 * * cd /Users/kevinandresromero/Documents/AlimentosPolar && /Users/kevinandresromero/.nvm/versions/node/v22.23.2/bin/node scripts/scrape-all.mjs --client polar >> /tmp/scraping.log 2>&1
```

## Ejecución manual

```bash
# Scraping completo de Polar
node scripts/scrape-all.mjs --client polar

# Solo una red
node scripts/scrape-all.mjs --client polar --network instagram

# Scripts individuales (guardan en data/scraped/polar/)
node scripts/scrape-polar-tiktok.mjs
node scripts/scrape-polar-x.mjs
```

## Prerequisitos

1. Archivo `.env.local` con:
   - `APIFY_API_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Migraciones SQL ejecutadas en Supabase
3. Node.js 22+
