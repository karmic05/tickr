"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { formatCurrency, formatPercent, changeClass } from "@/lib/format";
import type { Analysis } from "@/lib/analysis";
import type { Quote } from "@/lib/yahoo";

const PRESETS = ["AAPL", "NVDA", "MSFT", "TSLA", "GOOGL", "AMZN", "META", "JPM", "V", "BRK-B", "LLY", "WMT"];

export default function AnalysisPage() {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ analysis: Analysis; quote: Quote } | null>(null);

  async function run(s?: string) {
    const target = (s || symbol).trim().toUpperCase();
    if (!target) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`/api/analysis?symbol=${encodeURIComponent(target)}`);
      if (!r.ok) throw new Error((await r.json()).error || "Failed to fetch");
      setResult(await r.json());
      setSymbol(target);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" /> Investment Analysis
        </h1>
        <p className="text-sm text-muted mt-1">
          Get a BUY / HOLD / SELL signal based on valuation, momentum, profitability, income, and risk — combined into a composite score.
        </p>
      </header>

      <div className="card p-5">
        <div className="flex flex-wrap gap-2">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Enter a ticker (e.g. AAPL, RELIANCE.NS, 7203.T)"
            className="flex-1 min-w-[240px] bg-bg border border-border rounded-lg px-3 h-10 outline-none focus:border-accent"
          />
          <button onClick={() => run()} disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted mr-1">Try:</span>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => run(p)} className="chip bg-panel border border-border hover:border-accent/60 text-xs">
              {p}
            </button>
          ))}
        </div>

        {error && <div className="mt-3 p-3 rounded-lg bg-down/10 down text-sm">{error}</div>}
      </div>

      {result && (
        <div className="card p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted">{result.quote.fullExchangeName}</div>
              <div className="text-2xl font-bold font-mono">{result.quote.symbol}</div>
              <div className="text-muted">{result.quote.longName || result.quote.shortName}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">
                {formatCurrency(result.quote.regularMarketPrice, result.quote.currency)}
              </div>
              <div className={`tabular-nums text-sm ${changeClass(result.quote.regularMarketChangePercent)}`}>
                {formatPercent(result.quote.regularMarketChangePercent)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Signal signal={result.analysis.signal} />
            <div className="flex-1 min-w-[220px]">
              <div className="h-2 bg-border/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-down via-yellow-400 to-up" style={{ width: `${result.analysis.normalized}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Score {result.analysis.score}/10</span>
                <span>Risk {result.analysis.riskLevel}</span>
              </div>
            </div>
            <Link href={`/stock/${encodeURIComponent(result.quote.symbol)}`} className="btn btn-ghost border-border">
              Full profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-sm">{result.analysis.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {result.analysis.reasons.map((r, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-panel flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${r.score > 0 ? "bg-up" : r.score < 0 ? "bg-down" : "bg-muted"}`} />
                <div>
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-muted text-xs mt-0.5">{r.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {result.analysis.fairValue && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-transparent border border-border">
              <div className="text-xs text-muted mb-1">Simple earnings-based fair value</div>
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <span className="text-2xl font-bold tabular-nums">
                  {formatCurrency(result.analysis.fairValue, result.quote.currency)}
                </span>
                <span className={`tabular-nums font-semibold ${result.analysis.upside! >= 0 ? "up" : "down"}`}>
                  {result.analysis.upside! >= 0 ? "+" : ""}{result.analysis.upside!.toFixed(1)}% upside
                </span>
              </div>
              <p className="text-xs text-muted mt-2">
                Heuristic based on EPS × market-average multiple (18×). Treat as a sanity check, not a price target.
              </p>
            </div>
          )}

          <div className="text-xs text-muted pt-2 border-t border-border">
            This signal is generated algorithmically from public data and is for educational purposes. Not investment advice.
          </div>
        </div>
      )}
    </div>
  );
}

function Signal({ signal }: { signal: string }) {
  const map: Record<string, string> = {
    "STRONG BUY": "bg-up/15 up border-up/40",
    "BUY": "bg-up/10 up border-up/30",
    "HOLD": "bg-border/40 text-fg border-border",
    "SELL": "bg-down/10 down border-down/30",
    "STRONG SELL": "bg-down/15 down border-down/40",
  };
  return (
    <span className={`px-4 py-2 rounded-lg border font-bold tracking-wide ${map[signal]}`}>
      {signal}
    </span>
  );
}
