import "server-only";
import yahooFinance from "yahoo-finance2";

yahooFinance.suppressNotices(["yahooSurvey", "ripHistorical"] as any);

async function withRetry<T>(fn: () => Promise<T>, label: string, tries = 3): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || e);
      const rateLimited = /too many requests|429|Unexpected token .T.*Too Many/i.test(msg);
      if (!rateLimited && i === 0) break;
      const delay = 800 * Math.pow(2, i) + Math.random() * 400;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export type Quote = {
  symbol: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  exchange?: string;
  fullExchangeName?: string;
  marketState?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  averageDailyVolume3Month?: number;
  trailingAnnualDividendYield?: number;
  epsTrailingTwelveMonths?: number;
  bookValue?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  quoteType?: string;
};

export async function getQuote(symbol: string): Promise<Quote | null> {
  try {
    const q = (await withRetry(() => yahooFinance.quote(symbol), `quote ${symbol}`)) as any;
    if (!q) return null;
    return q as Quote;
  } catch (e) {
    console.error("[yahoo.getQuote]", symbol, String((e as any)?.message || e));
    return null;
  }
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  try {
    const r = (await withRetry(() => yahooFinance.quote(symbols), `quotes ${symbols.length}`)) as any;
    return (Array.isArray(r) ? r : [r]) as Quote[];
  } catch (e) {
    console.error("[yahoo.getQuotes]", String((e as any)?.message || e));
    return [];
  }
}

export type ChartPoint = { t: number; open: number; high: number; low: number; close: number; volume: number };

export type ChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "ytd" | "1y" | "2y" | "5y" | "10y" | "max";

const RANGE_INTERVAL: Record<ChartRange, string> = {
  "1d": "5m",
  "5d": "15m",
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1d",
  "ytd": "1d",
  "1y": "1d",
  "2y": "1wk",
  "5y": "1wk",
  "10y": "1mo",
  "max": "1mo",
};

export async function getChart(symbol: string, range: ChartRange = "6mo"): Promise<ChartPoint[]> {
  try {
    const interval = RANGE_INTERVAL[range] as any;
    const period1 = rangeToStart(range);
    const r = (await withRetry(() => yahooFinance.chart(symbol, { period1, interval }), `chart ${symbol}`)) as any;
    const quotes = r?.quotes ?? [];
    return quotes
      .filter((q: any) => q.close != null)
      .map((q: any) => ({
        t: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume ?? 0,
      }));
  } catch (e) {
    console.error("[yahoo.getChart]", symbol, range, e);
    return [];
  }
}

function rangeToStart(range: ChartRange): Date {
  const d = new Date();
  switch (range) {
    case "1d": d.setDate(d.getDate() - 1); break;
    case "5d": d.setDate(d.getDate() - 5); break;
    case "1mo": d.setMonth(d.getMonth() - 1); break;
    case "3mo": d.setMonth(d.getMonth() - 3); break;
    case "6mo": d.setMonth(d.getMonth() - 6); break;
    case "ytd": return new Date(new Date().getFullYear(), 0, 1);
    case "1y": d.setFullYear(d.getFullYear() - 1); break;
    case "2y": d.setFullYear(d.getFullYear() - 2); break;
    case "5y": d.setFullYear(d.getFullYear() - 5); break;
    case "10y": d.setFullYear(d.getFullYear() - 10); break;
    case "max": d.setFullYear(d.getFullYear() - 25); break;
  }
  return d;
}

export async function searchSymbols(query: string): Promise<any[]> {
  if (!query || query.length < 1) return [];
  try {
    const r = (await withRetry(() => yahooFinance.search(query, { quotesCount: 15, newsCount: 0 }), `search ${query}`)) as any;
    return (r?.quotes ?? []).filter((q: any) => q.symbol);
  } catch (e) {
    console.error("[yahoo.searchSymbols]", query, e);
    return [];
  }
}

export async function getSummary(symbol: string): Promise<any | null> {
  try {
    const r = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "assetProfile",
        "summaryDetail",
        "financialData",
        "defaultKeyStatistics",
        "recommendationTrend",
        "earnings",
        "calendarEvents",
        "price",
      ],
    });
    return r;
  } catch (e) {
    console.error("[yahoo.getSummary]", symbol, e);
    return null;
  }
}

export async function getTrending(region = "US"): Promise<string[]> {
  try {
    const r = (await withRetry(() => yahooFinance.trendingSymbols(region, { count: 12 }), `trending ${region}`)) as any;
    return (r?.quotes ?? []).map((q: any) => q.symbol).filter(Boolean);
  } catch (e) {
    console.error("[yahoo.getTrending]", region, e);
    return [];
  }
}
