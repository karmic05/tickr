import Link from "next/link";
import type { Quote } from "@/lib/yahoo";
import { formatCurrency, formatPercent, changeClass, formatCompact } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StockCard({ q, compact = false }: { q: Quote; compact?: boolean }) {
  const cls = changeClass(q.regularMarketChangePercent);
  const Icon = (q.regularMarketChangePercent ?? 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <Link
      href={`/stock/${encodeURIComponent(q.symbol)}`}
      className="card p-4 hover:border-accent/60 transition-colors block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono font-semibold">{q.symbol}</div>
          <div className="text-xs text-muted truncate">
            {q.shortName || q.longName || q.fullExchangeName}
          </div>
        </div>
        <div className={`chip ${cls} bg-${(q.regularMarketChangePercent ?? 0) >= 0 ? "up" : "down"}/10`}>
          <Icon className="w-3 h-3" />
          {formatPercent(q.regularMarketChangePercent)}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="text-xl font-semibold">
          {formatCurrency(q.regularMarketPrice, q.currency || "USD")}
        </div>
        {!compact && q.marketCap ? (
          <div className="text-xs text-muted">Cap {formatCompact(q.marketCap)}</div>
        ) : null}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span>V {formatCompact(q.regularMarketVolume)}</span>
          {q.fiftyTwoWeekLow && q.fiftyTwoWeekHigh ? (
            <span>52w {q.fiftyTwoWeekLow.toFixed(2)}–{q.fiftyTwoWeekHigh.toFixed(2)}</span>
          ) : null}
        </div>
      )}
    </Link>
  );
}
