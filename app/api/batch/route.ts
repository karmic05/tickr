import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  if (!symbolsParam) return NextResponse.json({ error: "missing symbols" }, { status: 400 });
  const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50);
  const quotes = await getQuotes(symbols);
  return NextResponse.json({ quotes }, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } });
}
