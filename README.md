# InvestNest — Investment Discovery & Education Platform

## Vision
Help everyday Indians discover, understand, and access investment products beyond traditional markets — starting with bank-seized properties (SARFAESI auctions).

## Tech Stack (100% Free Tier)
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (free tier)
- **Auth:** Supabase Auth
- **Scraping:** Python (BeautifulSoup) via GitHub Actions (free)
- **Search:** PostgreSQL full-text search (free, built into Supabase)
- **Hosting:** Vercel (free tier)
- **Analytics:** PostHog (free tier) + GA4 (free)

## Features
1. Investment product catalog (16 products)
2. SARFAESI property scraper (IBAPI + SBI)
3. Property listing with search & filters
4. Property detail page with enrichment
5. Investment calculator + comparison tool
6. Education hub
7. SEO (sitemap, robots.txt, OpenGraph)

## Getting Started
```bash
npm install
cp .env.example .env.local
# Add your Supabase keys to .env.local
npm run dev
```

## Deploy
1. Push to GitHub
2. Connect to Vercel (free)
3. Add environment variables
4. Deploy!

## Scraper
```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```
Runs daily via GitHub Actions (free).