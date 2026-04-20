import type { Quote } from "./yahoo";

export type Signal = "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL";

export type AnalysisReason = {
  label: string;
  detail: string;
  score: number; // -2..2
};

export type Analysis = {
  symbol: string;
  signal: Signal;
  score: number;         // -10..10
  normalized: number;    // 0..100
  reasons: AnalysisReason[];
  fairValue?: number;
  upside?: number;
  riskLevel: "Low" | "Medium" | "High";
  summary: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Heuristic business analysis combining:
 *  - valuation (P/E, P/B)
 *  - momentum (price vs 50/200-day MAs, 52w range position)
 *  - profitability / income (dividend yield, EPS)
 *  - quality (forward vs trailing P/E)
 *  - risk proxy (volatility of recent closes)
 */
export function analyzeQuote(q: Quote, closes?: number[]): Analysis {
  const reasons: AnalysisReason[] = [];
  let score = 0;

  const pe = q.trailingPE;
  if (pe && pe > 0) {
    if (pe < 12) { score += 2; reasons.push({ label: "Attractive P/E", detail: `Trailing P/E of ${pe.toFixed(1)} is below the market average (~18). Potentially undervalued.`, score: 2 }); }
    else if (pe < 20) { score += 1; reasons.push({ label: "Fair P/E", detail: `P/E of ${pe.toFixed(1)} suggests a fairly valued business.`, score: 1 }); }
    else if (pe < 35) { reasons.push({ label: "Elevated P/E", detail: `P/E of ${pe.toFixed(1)} — growth expectations are priced in.`, score: 0 }); }
    else { score -= 1; reasons.push({ label: "Rich valuation", detail: `P/E of ${pe.toFixed(1)} is high; sensitive to earnings surprises.`, score: -1 }); }
  }

  if (q.forwardPE && q.trailingPE && q.forwardPE > 0) {
    const delta = q.trailingPE - q.forwardPE;
    if (delta > 2) { score += 1; reasons.push({ label: "Earnings expansion expected", detail: `Forward P/E (${q.forwardPE.toFixed(1)}) is meaningfully below trailing (${q.trailingPE.toFixed(1)}).`, score: 1 }); }
    else if (delta < -2) { score -= 1; reasons.push({ label: "Earnings contraction expected", detail: `Forward P/E (${q.forwardPE.toFixed(1)}) exceeds trailing — analysts see earnings falling.`, score: -1 }); }
  }

  if (q.priceToBook && q.priceToBook > 0) {
    if (q.priceToBook < 1.5) { score += 1; reasons.push({ label: "Low price-to-book", detail: `P/B of ${q.priceToBook.toFixed(2)} suggests assets cover a large share of market value.`, score: 1 }); }
    else if (q.priceToBook > 8) { score -= 1; reasons.push({ label: "High price-to-book", detail: `P/B of ${q.priceToBook.toFixed(2)} — asset coverage is thin.`, score: -1 }); }
  }

  // Momentum: price vs 50/200 day
  const price = q.regularMarketPrice;
  if (price && q.fiftyDayAverage && q.twoHundredDayAverage) {
    const above50 = price > q.fiftyDayAverage;
    const above200 = price > q.twoHundredDayAverage;
    const ma50Above200 = q.fiftyDayAverage > q.twoHundredDayAverage;
    if (above50 && above200 && ma50Above200) { score += 2; reasons.push({ label: "Strong uptrend", detail: "Price trades above both 50- and 200-day moving averages, with 50-day above the 200-day.", score: 2 }); }
    else if (!above50 && !above200 && !ma50Above200) { score -= 2; reasons.push({ label: "Downtrend", detail: "Price is below both major moving averages; 50-day trending below the 200-day.", score: -2 }); }
    else if (above50 && !above200) { reasons.push({ label: "Mixed momentum", detail: "Recovering above the 50-day but still below the 200-day average.", score: 0 }); }
  }

  // 52-week range position
  if (price && q.fiftyTwoWeekHigh && q.fiftyTwoWeekLow && q.fiftyTwoWeekHigh > q.fiftyTwoWeekLow) {
    const pos = (price - q.fiftyTwoWeekLow) / (q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow);
    if (pos < 0.2) { score += 1; reasons.push({ label: "Near 52-week low", detail: `At ${(pos*100).toFixed(0)}% of the 52-week range — contrarian entry zone.`, score: 1 }); }
    else if (pos > 0.85) { score -= 1; reasons.push({ label: "Near 52-week high", detail: `At ${(pos*100).toFixed(0)}% of the 52-week range — limited margin of safety.`, score: -1 }); }
  }

  // Income
  if (q.dividendYield && q.dividendYield > 0) {
    const y = q.dividendYield * (q.dividendYield < 1 ? 100 : 1); // some payloads are fraction, some percent
    if (y > 4) { score += 1; reasons.push({ label: "High dividend yield", detail: `Yield of ${y.toFixed(2)}% offers meaningful income.`, score: 1 }); }
    else if (y > 1.5) { reasons.push({ label: "Steady dividend", detail: `Yield of ${y.toFixed(2)}% provides some income buffer.`, score: 0 }); }
  }

  // Profitability
  if (q.epsTrailingTwelveMonths !== undefined) {
    if (q.epsTrailingTwelveMonths > 0) { score += 1; reasons.push({ label: "Profitable", detail: `Positive trailing EPS of ${q.epsTrailingTwelveMonths.toFixed(2)}.`, score: 1 }); }
    else { score -= 2; reasons.push({ label: "Unprofitable (trailing)", detail: `Trailing EPS is negative — watch cash runway and path to profitability.`, score: -2 }); }
  }

  // Volatility / risk
  let riskLevel: "Low" | "Medium" | "High" = "Medium";
  if (closes && closes.length > 10) {
    const vol = stdevReturns(closes) * Math.sqrt(252) * 100;
    if (vol < 20) riskLevel = "Low";
    else if (vol > 45) riskLevel = "High";
  } else if (q.quoteType === "ETF" || q.quoteType === "MUTUALFUND") {
    riskLevel = "Low";
  }

  // Fair value estimate (very simple earnings-based model: eps * benchmark P/E 18)
  let fairValue: number | undefined;
  let upside: number | undefined;
  if (q.epsTrailingTwelveMonths && q.epsTrailingTwelveMonths > 0 && price) {
    fairValue = q.epsTrailingTwelveMonths * 18;
    upside = ((fairValue - price) / price) * 100;
  }

  score = clamp(score, -10, 10);
  const normalized = Math.round(((score + 10) / 20) * 100);

  let signal: Signal;
  if (score >= 6) signal = "STRONG BUY";
  else if (score >= 2) signal = "BUY";
  else if (score >= -1) signal = "HOLD";
  else if (score >= -5) signal = "SELL";
  else signal = "STRONG SELL";

  const summary = buildSummary(q, signal, reasons, fairValue, upside);

  return {
    symbol: q.symbol,
    signal,
    score,
    normalized,
    reasons,
    fairValue,
    upside,
    riskLevel,
    summary,
  };
}

function stdevReturns(closes: number[]): number {
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0) rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  return Math.sqrt(variance);
}

function buildSummary(q: Quote, signal: Signal, reasons: AnalysisReason[], fairValue?: number, upside?: number): string {
  const name = q.longName || q.shortName || q.symbol;
  const top = reasons.slice().sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 2).map(r => r.label.toLowerCase()).join(" and ");
  const fv = fairValue ? ` Fair-value estimate ~${fairValue.toFixed(2)} ${q.currency ?? ""} (${upside! >= 0 ? "+" : ""}${upside!.toFixed(1)}%).` : "";
  return `${name} rates ${signal}. Key drivers: ${top || "mixed signals across valuation and momentum"}.${fv}`;
}
