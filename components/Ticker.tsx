"use client";
import Link from "next/link";
import type { Quote } from "@/lib/yahoo";
import { formatPercent, changeClass } from "@/lib/format";

export default function Ticker({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null;
  const items = [...quotes, ...quotes];
  return (
    <div className="overflow-hidden bg-panel border-y border-border">
      <div className="marquee py-2">
        {items.map((q, i) => (
          <Link
            key={q.symbol + i}
            href={`/stock/${encodeURIComponent(q.symbol)}`}
            className="flex items-center gap-2 px-5 text-sm whitespace-nowrap border-r border-border/60"
          >
            <span className="font-mono font-semibold">{q.symbol.replace("^", "")}</span>
            <span className="tabular-nums">
              {q.regularMarketPrice?.toFixed(2)}
            </span>
            <span className={`tabular-nums ${changeClass(q.regularMarketChangePercent)}`}>
              {formatPercent(q.regularMarketChangePercent)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
