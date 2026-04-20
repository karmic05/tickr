"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

type Result = {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
};

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        setResults(data.results || []);
        setActive(0);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cmd/Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        (boxRef.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(symbol: string) {
    setOpen(false);
    setQ("");
    router.push(`/stock/${encodeURIComponent(symbol)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") {
      const r = results[active];
      if (r) go(r.symbol);
      else if (q.trim()) go(q.trim().toUpperCase());
    } else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 bg-panel border border-border rounded-lg px-3 h-10">
        <Search className="w-4 h-4 text-muted" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search stocks, ETFs, indices…"
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted"
        />
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-muted" /> : (
          <kbd className="hidden sm:inline-flex text-[10px] bg-border/50 px-1.5 py-0.5 rounded text-muted">⌘K</kbd>
        )}
      </div>

      {open && (results.length > 0 || q.trim()) && (
        <div className="absolute left-0 right-0 mt-2 card shadow-xl max-h-96 overflow-auto">
          {results.length === 0 && !loading && (
            <div className="p-4 text-sm text-muted">No matches. Press Enter to try "{q.toUpperCase()}".</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.symbol + i}
              onClick={() => go(r.symbol)}
              onMouseEnter={() => setActive(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-b border-border last:border-0 ${
                i === active ? "bg-accent/10" : "hover:bg-panel"
              }`}
            >
              <div className="w-12 text-mono font-semibold text-accent text-sm">{r.symbol}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{r.longname || r.shortname || r.symbol}</div>
                <div className="text-xs text-muted">{r.exchDisp} · {r.typeDisp}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
