import { NextResponse } from "next/server";
import { getChart, type ChartRange } from "@/lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: ChartRange[] = ["1d", "5d", "1mo", "3mo", "6mo", "ytd", "1y", "2y", "5y", "10y", "max"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const range = (searchParams.get("range") || "6mo") as ChartRange;
  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
  if (!VALID.includes(range)) return NextResponse.json({ error: "invalid range" }, { status: 400 });
  const points = await getChart(symbol, range);
  return NextResponse.json({ symbol, range, points }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
