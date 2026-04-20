import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "stocks";
  try {
    const r: any = await yahooFinance.search(q, { quotesCount: 0, newsCount: 12 });
    return NextResponse.json({ news: r?.news ?? [] }, {
      headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json({ news: [] });
  }
}
