"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import clsx from "clsx";
import { tsToLabel } from "@/lib/format";

type Point = { t: number; close: number };
type Range = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "ytd" | "1y" | "5y" | "max";
const RANGES: Range[] = ["1d", "5d", "1mo", "3mo", "6mo", "ytd", "1y", "5y", "max"];

export default function StockChart({ symbol, initialRange = "6mo" }: { symbol: string; initialRange?: Range }) {
  const [range, setRange] = useState<Range>(initialRange);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then((r) => r.json())
      .then((d) => { if (!cancel) setPoints(d.points || []); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [symbol, range]);

  const { up, first, last, min, max } = useMemo(() => {
    if (!points.length) return { up: true, first: 0, last: 0, min: 0, max: 0 };
    const f = points[0].close;
    const l = points[points.length - 1].close;
    const mn = Math.min(...points.map((p) => p.close));
    const mx = Math.max(...points.map((p) => p.close));
    return { up: l >= f, first: f, last: l, min: mn, max: mx };
  }, [points]);

  const color = up ? "rgb(var(--up))" : "rgb(var(--down))";
  const data = points.map((p) => ({ ...p, label: tsToLabel(p.t, range) }));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm text-muted">
          {points.length > 0 && (
            <>
              <span>H {max.toFixed(2)}</span>
              <span>L {min.toFixed(2)}</span>
              <span>Chg {(((last - first) / first) * 100).toFixed(2)}%</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={clsx(
                "px-2 py-1 text-xs rounded-md font-medium transition-colors",
                r === range ? "bg-accent text-white" : "text-muted hover:text-fg hover:bg-panel"
              )}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px]">
        {loading ? (
          <div className="skeleton h-full w-full" />
        ) : points.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "rgb(var(--muted))" }}
                tickLine={false}
                axisLine={false}
                width={60}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--panel))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any) => [Number(v).toFixed(2), "Close"]}
              />
              <ReferenceLine y={first} stroke="rgb(var(--muted))" strokeDasharray="3 3" opacity={0.4} />
              <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
