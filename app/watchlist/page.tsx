"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, RefreshCw, Trash2, Search } from "lucide-react";
import { readWatchlist, writeWatchlist } from "@/components/WatchlistButton";
import { formatCurrency, formatPercent, changeClass, formatCompact } from "@/lib/format";
import type { Quote } from "@/lib/yahoo";

export default function WatchlistPage() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSymbols(readWatchlist());
    const h = () => setSymbols(readWatchlist());
    window.addEventListener("tickr:watchlist", h);
    return () => window.removeEventListener("tickr:watchlist", h);
  }, []);

  useEffect(() => {
    if (!symbols.length) { setQuotes([]); return; }
    refresh();
    const iv = setInterval(refresh, 30_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  async function refresh() {
    if (!symbols.length) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/batch?symbols=${symbols.join(",")}`);
      const d = await r.json();
      setQuotes(d.quotes || []);
    } finally {
      setLoading(false);
    }
  }

  function remove(s: string) {
    const next = symbols.filter((x) => x !== s);
    writeWatchlist(next);
    setSymbols(next);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-accent fill-accent" /> Your Watchlist
          </h1>
          <p className="text-sm text-muted">Tracking {symbols.length} {symbols.length === 1 ? "symbol" : "symbols"}. Auto-refreshes every 30s.</p>
        </div>
        <button onClick={refresh} disabled={loading || !symbols.length} className="btn btn-ghost border-border">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </header>

      {symbols.length === 0 ? (
        <div className="card p-10 text-center">
          <Star className="w-10 h-10 text-muted mx-auto" />
          <h2 className="text-lg font-semibold mt-3">Nothing here yet</h2>
          <p className="text-sm text-muted mt-1 max-w-md mx-auto">
            Search any stock and tap the ⭐ to track it. Prices refresh automatically while the page is open.
          </p>
          <Link href="/" className="btn btn-primary mt-4 inline-flex"><Search className="w-4 h-4" /> Browse markets</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel text-muted text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Symbol</th>
                <th className="text-left px-4 py-2 hidden md:table-cell">Name</th>
                <th className="text-right px-4 py-2">Price</th>
                <th className="text-right px-4 py-2">Change</th>
                <th className="text-right px-4 py-2 hidden sm:table-cell">Day Range</th>
                <th className="text-right px-4 py-2 hidden lg:table-cell">Volume</th>
                <th className="text-right px-4 py-2 hidden lg:table-cell">Market Cap</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {symbols.map((s) => {
                const q = quotes.find((x) => x.symbol === s);
                const cls = changeClass(q?.regularMarketChangePercent);
                return (
                  <tr key={s} className="border-t border-border hover:bg-panel/60">
                    <td className="px-4 py-3">
                      <Link href={`/stock/${encodeURIComponent(s)}`} className="font-mono font-semibold text-accent">
                        {s}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell truncate max-w-[260px]">{q?.shortName || q?.longName || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{q ? formatCurrency(q.regularMarketPrice, q.currency) : "…"}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${cls}`}>{formatPercent(q?.regularMarketChangePercent)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted hidden sm:table-cell">
                      {q?.regularMarketDayLow?.toFixed(2)}–{q?.regularMarketDayHigh?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted hidden lg:table-cell">{formatCompact(q?.regularMarketVolume)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted hidden lg:table-cell">{formatCompact(q?.marketCap)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(s)} className="text-muted hover:text-down" aria-label="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
