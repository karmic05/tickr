import Link from "next/link";
import { getQuotes, getTrending } from "@/lib/yahoo";
import { WORLD_INDICES } from "@/lib/exchanges";
import StockCard from "@/components/StockCard";
import Ticker from "@/components/Ticker";
import { formatCurrency, formatPercent, changeClass } from "@/lib/format";
import { TrendingUp, TrendingDown, Activity, Globe2, Sparkles, Star } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const MEGACAPS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B", "AVGO", "LLY", "JPM", "V"];
const SECTOR_ETFS = [
  { s: "XLK", n: "Technology" },
  { s: "XLF", n: "Financials" },
  { s: "XLV", n: "Healthcare" },
  { s: "XLE", n: "Energy" },
  { s: "XLY", n: "Consumer Discretionary" },
  { s: "XLP", n: "Consumer Staples" },
  { s: "XLI", n: "Industrials" },
  { s: "XLU", n: "Utilities" },
  { s: "XLRE", n: "Real Estate" },
  { s: "XLB", n: "Materials" },
  { s: "XLC", n: "Communications" },
];

export default async function Home() {
  const indices = await getQuotes(WORLD_INDICES.map((i) => i.symbol));
  const mega = await getQuotes(MEGACAPS);
  const sectors = await getQuotes(SECTOR_ETFS.map((s) => s.s));
  const trendingSymbols = await getTrending("US");
  const trending = trendingSymbols.length ? await getQuotes(trendingSymbols.slice(0, 12)) : [];

  const gainers = [...mega].filter((q) => q.regularMarketChangePercent != null)
    .sort((a, b) => (b.regularMarketChangePercent! - a.regularMarketChangePercent!)).slice(0, 5);
  const losers = [...mega].filter((q) => q.regularMarketChangePercent != null)
    .sort((a, b) => (a.regularMarketChangePercent! - b.regularMarketChangePercent!)).slice(0, 5);

  const noData = indices.length === 0 && mega.length === 0;

  return (
    <div className="space-y-8">
      {noData && (
        <div className="card p-4 bg-down/5 border-down/30 text-sm">
          <strong className="down">Market data temporarily unavailable.</strong>
          <span className="text-muted"> Yahoo Finance is rate-limiting this IP. Refresh in ~1 minute — the server retries with backoff.</span>
        </div>
      )}
      <Ticker quotes={indices} />

      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Global Markets</h1>
            <p className="text-sm text-muted">Major indices around the world, updated live.</p>
          </div>
          <Link href="/exchanges" className="btn btn-ghost text-sm">
            <Globe2 className="w-4 h-4" /> All exchanges
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {indices.map((q) => (
            <IndexTile key={q.symbol} q={q} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Most Active — US
          </h2>
          <Link href="/analysis" className="btn btn-ghost text-sm">
            <Sparkles className="w-4 h-4" /> Run analysis
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {(trending.length ? trending : mega).map((q) => (
            <StockCard key={q.symbol} q={q} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="up w-4 h-4" /> Top Gainers</h3>
          <MoverList items={gainers} />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingDown className="down w-4 h-4" /> Top Losers</h3>
          <MoverList items={losers} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Sectors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sectors.map((q) => {
            const meta = SECTOR_ETFS.find((s) => s.s === q.symbol);
            const cls = changeClass(q.regularMarketChangePercent);
            return (
              <Link key={q.symbol} href={`/stock/${q.symbol}`} className="card p-3 hover:border-accent/60">
                <div className="text-xs text-muted">{meta?.n}</div>
                <div className="mt-1 font-mono font-semibold">{q.symbol}</div>
                <div className={`text-sm tabular-nums ${cls}`}>{formatPercent(q.regularMarketChangePercent)}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card p-6 bg-gradient-to-br from-accent/10 via-panel to-panel">
        <div className="flex flex-wrap items-center gap-6 justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /> Get AI-style investment analysis</h2>
            <p className="text-sm text-muted max-w-lg mt-1">
              Enter any ticker to get a BUY/HOLD/SELL signal based on valuation, momentum, profitability, and risk.
            </p>
          </div>
          <Link href="/analysis" className="btn btn-primary">Try it now</Link>
        </div>
      </section>
    </div>
  );
}

function IndexTile({ q }: { q: any }) {
  const cls = changeClass(q.regularMarketChangePercent);
  return (
    <Link href={`/stock/${encodeURIComponent(q.symbol)}`} className="card p-3 hover:border-accent/60">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">{q.shortName || q.symbol}</div>
        <div className={`text-xs tabular-nums ${cls}`}>{formatPercent(q.regularMarketChangePercent)}</div>
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">
        {q.regularMarketPrice?.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </div>
    </Link>
  );
}

function MoverList({ items }: { items: any[] }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((q) => {
        const cls = changeClass(q.regularMarketChangePercent);
        return (
          <li key={q.symbol}>
            <Link href={`/stock/${q.symbol}`} className="flex items-center justify-between py-2 hover:bg-panel/60 px-2 -mx-2 rounded-md">
              <div>
                <div className="font-mono font-semibold text-sm">{q.symbol}</div>
                <div className="text-xs text-muted truncate max-w-[220px]">{q.shortName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm tabular-nums">{formatCurrency(q.regularMarketPrice, q.currency)}</div>
                <div className={`text-xs tabular-nums ${cls}`}>{formatPercent(q.regularMarketChangePercent)}</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
