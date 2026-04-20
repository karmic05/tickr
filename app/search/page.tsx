"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type Result = { symbol: string; shortname?: string; longname?: string; exchDisp?: string; typeDisp?: string };

export default function Page() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-muted">Loading…</div>}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const sp = useSearchParams();
  const initial = sp.get("q") || "";
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setResults(d.results || []);
      } finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="w-6 h-6 text-accent" /> Search</h1>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Company, symbol, ETF, index…"
        className="w-full bg-panel border border-border rounded-lg px-4 h-12 text-lg outline-none focus:border-accent"
      />
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-muted">Searching…</div>
        ) : results.length === 0 ? (
          <div className="p-6 text-sm text-muted text-center">Type to search thousands of tickers worldwide.</div>
        ) : (
          results.map((r) => (
            <Link
              key={r.symbol}
              href={`/stock/${encodeURIComponent(r.symbol)}`}
              className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-panel"
            >
              <div className="w-20 font-mono font-semibold text-accent">{r.symbol}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{r.longname || r.shortname || r.symbol}</div>
                <div className="text-xs text-muted">{r.exchDisp} · {r.typeDisp}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
