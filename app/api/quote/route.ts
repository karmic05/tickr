import { NextResponse } from "next/server";
import { getQuote } from "@/lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });
  const q = await getQuote(symbol);
  if (!q) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(q, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } });
}
