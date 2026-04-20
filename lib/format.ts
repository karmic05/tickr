export function formatNumber(n: number | undefined | null, opts: Intl.NumberFormatOptions = {}): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, ...opts }).format(n);
}

export function formatCurrency(n: number | undefined | null, currency = "USD"): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatCompact(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export function formatPercent(n: number | undefined | null, digits = 2): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function changeClass(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "";
  return n >= 0 ? "up" : "down";
}

export function tsToLabel(ts: number, range: string): string {
  const d = new Date(ts * 1000);
  if (range === "1d" || range === "5d") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  if (range === "1mo" || range === "3mo" || range === "6mo" || range === "ytd" || range === "1y") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
