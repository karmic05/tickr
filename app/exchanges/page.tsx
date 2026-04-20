import Link from "next/link";
import { EXCHANGES } from "@/lib/exchanges";
import { getQuotes } from "@/lib/yahoo";
import { formatPercent, changeClass, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function ExchangesPage() {
  const indexQuotes = await getQuotes(EXCHANGES.map((e) => e.indexSymbol));
  const byRegion: Record<string, typeof EXCHANGES> = {};
  EXCHANGES.forEach((e) => {
    (byRegion[e.region] ||= []).push(e);
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Stock Exchanges Around the World</h1>
        <p className="text-sm text-muted mt-1">
          Browse the major exchanges and their headline indices. Click any exchange to explore its popular tickers.
        </p>
      </header>

      {Object.entries(byRegion).map(([region, exchanges]) => (
        <section key={region}>
          <h2 className="text-lg font-semibold mb-3">{region}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exchanges.map((e) => {
              const idx = indexQuotes.find((q) => q.symbol === e.indexSymbol);
              const cls = changeClass(idx?.regularMarketChangePercent);
              return (
                <div key={e.code} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{e.flag}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{e.name}</div>
                      <div className="text-xs text-muted">{e.country} · {e.currency}</div>
                    </div>
                    <span className="chip bg-panel border border-border text-xs">{e.code}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted">{e.index}</div>
                      <div className="font-semibold tabular-nums">
                        {idx ? formatNumber(idx.regularMarketPrice, { maximumFractionDigits: 2 }) : "—"}
                      </div>
                    </div>
                    <div className={`text-sm tabular-nums ${cls}`}>
                      {formatPercent(idx?.regularMarketChangePercent)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-muted mb-1.5">Popular tickers</div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.popular.map((s) => (
                        <Link
                          key={s}
                          href={`/stock/${encodeURIComponent(s)}`}
                          className="chip bg-panel border border-border hover:border-accent/60 text-xs"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
