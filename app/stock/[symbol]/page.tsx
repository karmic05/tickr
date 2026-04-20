import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuote, getSummary, getChart } from "@/lib/yahoo";
import { analyzeQuote } from "@/lib/analysis";
import StockChart from "@/components/StockChart";
import WatchlistButton from "@/components/WatchlistButton";
import { formatCurrency, formatCompact, formatNumber, formatPercent, changeClass } from "@/lib/format";
import { TrendingUp, TrendingDown, Building2, ExternalLink, Info } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw).toUpperCase();

  const [quote, summary, chart] = await Promise.all([
    getQuote(symbol),
    getSummary(symbol),
    getChart(symbol, "6mo"),
  ]);
  if (!quote) notFound();

  const analysis = analyzeQuote(quote, chart.map((p) => p.close));
  const profile = summary?.assetProfile;
  const sd = summary?.summaryDetail;
  const fd = summary?.financialData;
  const stats = summary?.defaultKeyStatistics;
  const earnings = summary?.earnings;

  const cls = changeClass(quote.regularMarketChangePercent);
  const Trend = (quote.regularMarketChangePercent ?? 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold font-mono tracking-tight">{quote.symbol}</h1>
            <span className="chip bg-panel border border-border text-muted">
              {quote.fullExchangeName || quote.exchange}
            </span>
            {quote.marketState && (
              <span className={`chip ${quote.marketState === "REGULAR" ? "bg-up/10 up" : "bg-border/30 text-muted"}`}>
                {quote.marketState === "REGULAR" ? "Open" : quote.marketState}
              </span>
            )}
          </div>
          <p className="text-muted mt-1">{quote.longName || quote.shortName}</p>
        </div>
        <div className="flex items-center gap-2">
          <WatchlistButton symbol={quote.symbol} />
        </div>
      </header>

      <section className="card p-5">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="text-4xl font-bold tabular-nums">
            {formatCurrency(quote.regularMarketPrice, quote.currency || "USD")}
          </div>
          <div className={`flex items-center gap-2 font-semibold ${cls}`}>
            <Trend className="w-5 h-5" />
            <span className="tabular-nums">
              {(quote.regularMarketChange ?? 0) >= 0 ? "+" : ""}
              {quote.regularMarketChange?.toFixed(2)} ({formatPercent(quote.regularMarketChangePercent)})
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
          <Stat label="Open" value={formatNumber(quote.regularMarketOpen)} />
          <Stat label="Prev Close" value={formatNumber(quote.regularMarketPreviousClose)} />
          <Stat label="Day High" value={formatNumber(quote.regularMarketDayHigh)} />
          <Stat label="Day Low" value={formatNumber(quote.regularMarketDayLow)} />
          <Stat label="Volume" value={formatCompact(quote.regularMarketVolume)} />
          <Stat label="Avg Vol (3M)" value={formatCompact(quote.averageDailyVolume3Month)} />
          <Stat label="52w High" value={formatNumber(quote.fiftyTwoWeekHigh)} />
          <Stat label="52w Low" value={formatNumber(quote.fiftyTwoWeekLow)} />
          <Stat label="Market Cap" value={formatCompact(quote.marketCap)} />
          <Stat label="P/E (TTM)" value={formatNumber(quote.trailingPE)} />
          <Stat label="Fwd P/E" value={formatNumber(quote.forwardPE)} />
          <Stat label="EPS (TTM)" value={formatNumber(quote.epsTrailingTwelveMonths)} />
        </div>
      </section>

      <StockChart symbol={quote.symbol} initialRange="6mo" />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-accent" /> Investment Signal
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <SignalBadge signal={analysis.signal} />
            <div className="flex-1 min-w-[200px]">
              <div className="h-2 bg-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-down via-yellow-400 to-up transition-all"
                  style={{ width: `${analysis.normalized}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Bearish</span><span>Neutral</span><span>Bullish</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Risk</div>
              <div className="font-semibold">{analysis.riskLevel}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">{analysis.summary}</p>

          <div className="mt-5 space-y-2">
            {analysis.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${r.score > 0 ? "bg-up" : r.score < 0 ? "bg-down" : "bg-muted"}`} />
                <div>
                  <div className="font-medium">{r.label}</div>
                  <div className="text-muted">{r.detail}</div>
                </div>
              </div>
            ))}
            {analysis.reasons.length === 0 && <div className="text-sm text-muted">Limited fundamental data for this instrument.</div>}
          </div>

          {analysis.fairValue && (
            <div className="mt-5 p-3 rounded-lg bg-panel border border-border text-sm">
              <div className="text-muted text-xs mb-1">Simple fair-value estimate (EPS × 18):</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold tabular-nums">{formatCurrency(analysis.fairValue, quote.currency)}</span>
                <span className={`tabular-nums ${analysis.upside! >= 0 ? "up" : "down"}`}>
                  {analysis.upside! >= 0 ? "+" : ""}{analysis.upside!.toFixed(1)}% vs price
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-accent" /> Company
          </h2>
          <div className="space-y-2 text-sm">
            {profile?.sector && <Row k="Sector" v={profile.sector} />}
            {profile?.industry && <Row k="Industry" v={profile.industry} />}
            {profile?.country && <Row k="Country" v={profile.country} />}
            {profile?.fullTimeEmployees && <Row k="Employees" v={formatNumber(profile.fullTimeEmployees, { maximumFractionDigits: 0 })} />}
            {fd?.returnOnEquity && <Row k="ROE" v={`${(fd.returnOnEquity * 100).toFixed(2)}%`} />}
            {fd?.profitMargins && <Row k="Profit Margin" v={`${(fd.profitMargins * 100).toFixed(2)}%`} />}
            {fd?.revenueGrowth && <Row k="Revenue Growth" v={`${(fd.revenueGrowth * 100).toFixed(2)}%`} />}
            {sd?.dividendYield && <Row k="Div Yield" v={`${(sd.dividendYield * (sd.dividendYield < 1 ? 100 : 1)).toFixed(2)}%`} />}
            {stats?.beta && <Row k="Beta" v={formatNumber(stats.beta)} />}
          </div>
          {profile?.website && (
            <a href={profile.website} target="_blank" rel="noreferrer" className="btn btn-ghost border-border mt-4 w-full text-sm">
              Visit website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </section>

      {profile?.longBusinessSummary && (
        <section className="card p-5">
          <h2 className="font-semibold mb-2">About {quote.shortName || quote.symbol}</h2>
          <p className="text-sm text-muted leading-relaxed">{profile.longBusinessSummary}</p>
        </section>
      )}

      {earnings?.earningsChart?.quarterly?.length > 0 && (
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Recent Quarterly EPS (Estimate vs Actual)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {earnings.earningsChart.quarterly.slice(-4).map((q: any) => (
              <div key={q.date} className="p-3 rounded-lg border border-border">
                <div className="text-xs text-muted">{q.date}</div>
                <div className="mt-1 text-sm">Est <span className="font-semibold">{q.estimate?.raw?.toFixed(2) ?? "—"}</span></div>
                <div className="text-sm">Act <span className="font-semibold">{q.actual?.raw?.toFixed(2) ?? "—"}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{k}</span>
      <span className="font-medium">{String(v)}</span>
    </div>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const map: Record<string, string> = {
    "STRONG BUY": "bg-up/15 up border-up/40",
    "BUY": "bg-up/10 up border-up/30",
    "HOLD": "bg-border/40 text-fg border-border",
    "SELL": "bg-down/10 down border-down/30",
    "STRONG SELL": "bg-down/15 down border-down/40",
  };
  return (
    <span className={`px-3 py-1.5 rounded-lg border text-sm font-bold tracking-wide ${map[signal]}`}>
      {signal}
    </span>
  );
}
