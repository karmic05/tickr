# Tickr — Global Stock Market Tracker

A fully-loaded financial markets tracker with live quotes, historical charts across
every major exchange, symbol search, an algorithmic BUY/HOLD/SELL analyzer, and a
persistent watchlist.

## Features

- **Live market dashboard** — world indices, sector ETFs, top gainers/losers, most active
- **Individual stock pages** — price, 52-week range, market cap, P/E, EPS, earnings
- **Interactive charts** — 1D through MAX history, area chart with tooltips
- **Global search** — fuzzy autocomplete across stocks, ETFs, and indices worldwide (⌘K / Ctrl K)
- **World exchanges** — 19+ exchanges across Americas, Europe, Asia-Pacific, MEA with index snapshots and popular tickers
- **Investment analysis** — composite score from valuation (P/E, P/B), momentum (vs 50/200-day MA, 52w range position), profitability (EPS), income (div yield), and risk (volatility)
- **Watchlist** — localStorage-persisted, auto-refreshes every 30s
- **Dark mode** — on by default, toggleable

## Tech

Next.js 15 App Router · TypeScript · Tailwind · Recharts · yahoo-finance2 (free, no API key)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notes

- Data comes from Yahoo Finance via the `yahoo-finance2` package. Aggressive traffic may get
  temporarily rate-limited (HTTP 429) — the server retries with backoff.
- This tool is for informational and educational purposes only. Not investment advice.
