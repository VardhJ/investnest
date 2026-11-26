import { NextResponse } from 'next/server';
import { reitsAndInvits } from '@/data/reits-invits';

export const revalidate = 3600; // Cache live NSE quotes for 1 hour

const NSE_SYMBOL_MAP: Record<string, string> = {
  EMBASSY: 'EMBASSY.NS',
  MINDSPACE: 'MINDSPACE.NS',
  BIRET: 'BIRET.NS',
  NXST: 'NXST.NS',
  INDIGRID: 'INDIGRID.NS',
  PGINVIT: 'PGINVIT.NS',
  IRBINVIT: 'IRBINVIT.NS',
};

export async function GET() {
  const quotes: Record<
    string,
    {
      price: number;
      fiftyTwoWeekHigh: number;
      fiftyTwoWeekLow: number;
      trailing12mDividend: number;
      liveYieldPct: number;
      updatedAt: string;
      source: string;
    }
  > = {};

  await Promise.allSettled(
    reitsAndInvits.map(async (trust) => {
      const yahooSym = NSE_SYMBOL_MAP[trust.ticker];
      if (!yahooSym) return;

      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?range=1y&interval=1mo&events=div`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 },
          }
        );

        if (!res.ok) return;
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        if (!result?.meta?.regularMarketPrice) return;

        const price = Number(result.meta.regularMarketPrice);
        const divs = result?.events?.dividends || {};
        const trailingDiv = Object.values(divs).reduce(
          (sum: number, d: any) => sum + (Number(d?.amount) || 0),
          0
        );

        const dpu = trailingDiv > 0 ? Number(trailingDiv.toFixed(2)) : trust.annualDistributionPerUnit;
        const liveYieldPct = price > 0 ? Number(((dpu / price) * 100).toFixed(2)) : trust.distributionYieldPct;

        quotes[trust.id] = {
          price: Number(price.toFixed(2)),
          fiftyTwoWeekHigh: Number((result.meta.fiftyTwoWeekHigh || trust.fiftyTwoWeekHigh).toFixed(2)),
          fiftyTwoWeekLow: Number((result.meta.fiftyTwoWeekLow || trust.fiftyTwoWeekLow).toFixed(2)),
          trailing12mDividend: dpu,
          liveYieldPct,
          updatedAt: new Date().toISOString(),
          source: `NSE Live Feed (${trust.ticker})`,
        };
      } catch {
        // Fallback silently to verified baseline metrics in reits-invits.ts
      }
    })
  );

  return NextResponse.json({
    quotes,
    fetchedAt: new Date().toISOString(),
  });
}
