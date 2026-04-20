import { NextResponse } from "next/server";
import { getQuote, getChart } from "@/lib/yahoo";
import { analyzeQuote } from "@/lib/analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });

  const [quote, chart] = await Promise.all([getQuote(symbol), getChart(symbol, "6mo")]);
  if (!quote) return NextResponse.json({ error: "not found" }, { status: 404 });

  const closes = chart.map((p) => p.close);
  const analysis = analyzeQuote(quote, closes);
  return NextResponse.json({ analysis, quote }, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}
