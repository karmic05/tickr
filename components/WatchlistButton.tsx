"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

const KEY = "tickr:watchlist";

export function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeWatchlist(list: string[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("tickr:watchlist"));
}

export default function WatchlistButton({ symbol }: { symbol: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readWatchlist().includes(symbol));
    const h = () => setOn(readWatchlist().includes(symbol));
    window.addEventListener("tickr:watchlist", h);
    return () => window.removeEventListener("tickr:watchlist", h);
  }, [symbol]);

  function toggle() {
    const list = readWatchlist();
    const next = list.includes(symbol) ? list.filter((s) => s !== symbol) : [...list, symbol];
    writeWatchlist(next);
    setOn(next.includes(symbol));
  }

  return (
    <button onClick={toggle} className={clsx("btn", on ? "btn-primary" : "btn-ghost border-border")}>
      <Star className={clsx("w-4 h-4", on && "fill-current")} />
      {on ? "In watchlist" : "Add to watchlist"}
    </button>
  );
}
