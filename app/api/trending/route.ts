import { NextResponse } from "next/server";
import { getTrending, getQuotes } from "@/lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "US";
  const symbols = await getTrending(region);
  const quotes = symbols.length ? await getQuotes(symbols) : [];
  return NextResponse.json({ region, quotes }, { headers: { "Cache-Control": "s-maxage=120, stale-while-revalidate=300" } });
}
