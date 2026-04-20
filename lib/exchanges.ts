export type Exchange = {
  code: string;
  name: string;
  country: string;
  flag: string;
  index: string;
  indexSymbol: string;
  currency: string;
  region: "Americas" | "Europe" | "Asia-Pacific" | "Middle East & Africa";
  suffix?: string;
  popular: string[];
};

export const EXCHANGES: Exchange[] = [
  { code: "NYSE", name: "New York Stock Exchange", country: "United States", flag: "🇺🇸", index: "Dow Jones", indexSymbol: "^DJI", currency: "USD", region: "Americas", popular: ["AAPL", "MSFT", "JPM", "V", "WMT"] },
  { code: "NASDAQ", name: "NASDAQ", country: "United States", flag: "🇺🇸", index: "NASDAQ Composite", indexSymbol: "^IXIC", currency: "USD", region: "Americas", popular: ["NVDA", "GOOGL", "META", "AMZN", "TSLA"] },
  { code: "TSX", name: "Toronto Stock Exchange", country: "Canada", flag: "🇨🇦", index: "S&P/TSX Composite", indexSymbol: "^GSPTSE", currency: "CAD", region: "Americas", suffix: ".TO", popular: ["RY.TO", "TD.TO", "SHOP.TO", "ENB.TO", "BMO.TO"] },
  { code: "B3", name: "B3 (Brazil)", country: "Brazil", flag: "🇧🇷", index: "Bovespa", indexSymbol: "^BVSP", currency: "BRL", region: "Americas", suffix: ".SA", popular: ["PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBDC4.SA"] },

  { code: "LSE", name: "London Stock Exchange", country: "United Kingdom", flag: "🇬🇧", index: "FTSE 100", indexSymbol: "^FTSE", currency: "GBP", region: "Europe", suffix: ".L", popular: ["HSBA.L", "SHEL.L", "AZN.L", "BP.L", "ULVR.L"] },
  { code: "XETRA", name: "Deutsche Börse Xetra", country: "Germany", flag: "🇩🇪", index: "DAX", indexSymbol: "^GDAXI", currency: "EUR", region: "Europe", suffix: ".DE", popular: ["SAP.DE", "SIE.DE", "ALV.DE", "BMW.DE", "VOW3.DE"] },
  { code: "EPA", name: "Euronext Paris", country: "France", flag: "🇫🇷", index: "CAC 40", indexSymbol: "^FCHI", currency: "EUR", region: "Europe", suffix: ".PA", popular: ["MC.PA", "OR.PA", "TTE.PA", "AIR.PA", "BNP.PA"] },
  { code: "SIX", name: "SIX Swiss Exchange", country: "Switzerland", flag: "🇨🇭", index: "SMI", indexSymbol: "^SSMI", currency: "CHF", region: "Europe", suffix: ".SW", popular: ["NESN.SW", "ROG.SW", "NOVN.SW", "UBSG.SW"] },
  { code: "AEX", name: "Euronext Amsterdam", country: "Netherlands", flag: "🇳🇱", index: "AEX", indexSymbol: "^AEX", currency: "EUR", region: "Europe", suffix: ".AS", popular: ["ASML.AS", "INGA.AS", "PHIA.AS", "HEIA.AS"] },

  { code: "TSE", name: "Tokyo Stock Exchange", country: "Japan", flag: "🇯🇵", index: "Nikkei 225", indexSymbol: "^N225", currency: "JPY", region: "Asia-Pacific", suffix: ".T", popular: ["7203.T", "6758.T", "9984.T", "6861.T", "8306.T"] },
  { code: "SSE", name: "Shanghai Stock Exchange", country: "China", flag: "🇨🇳", index: "SSE Composite", indexSymbol: "000001.SS", currency: "CNY", region: "Asia-Pacific", suffix: ".SS", popular: ["600519.SS", "601318.SS", "600036.SS"] },
  { code: "HKEX", name: "Hong Kong Stock Exchange", country: "Hong Kong", flag: "🇭🇰", index: "Hang Seng", indexSymbol: "^HSI", currency: "HKD", region: "Asia-Pacific", suffix: ".HK", popular: ["0700.HK", "0005.HK", "0941.HK", "9988.HK"] },
  { code: "KRX", name: "Korea Exchange", country: "South Korea", flag: "🇰🇷", index: "KOSPI", indexSymbol: "^KS11", currency: "KRW", region: "Asia-Pacific", suffix: ".KS", popular: ["005930.KS", "000660.KS", "051910.KS"] },
  { code: "NSE", name: "National Stock Exchange of India", country: "India", flag: "🇮🇳", index: "Nifty 50", indexSymbol: "^NSEI", currency: "INR", region: "Asia-Pacific", suffix: ".NS", popular: ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"] },
  { code: "BSE", name: "Bombay Stock Exchange", country: "India", flag: "🇮🇳", index: "SENSEX", indexSymbol: "^BSESN", currency: "INR", region: "Asia-Pacific", suffix: ".BO", popular: ["RELIANCE.BO", "TCS.BO", "HDFCBANK.BO"] },
  { code: "ASX", name: "Australian Securities Exchange", country: "Australia", flag: "🇦🇺", index: "ASX 200", indexSymbol: "^AXJO", currency: "AUD", region: "Asia-Pacific", suffix: ".AX", popular: ["CBA.AX", "BHP.AX", "CSL.AX", "WBC.AX"] },
  { code: "SGX", name: "Singapore Exchange", country: "Singapore", flag: "🇸🇬", index: "STI", indexSymbol: "^STI", currency: "SGD", region: "Asia-Pacific", suffix: ".SI", popular: ["D05.SI", "O39.SI", "U11.SI"] },

  { code: "TADAWUL", name: "Saudi Exchange", country: "Saudi Arabia", flag: "🇸🇦", index: "Tadawul All Share", indexSymbol: "^TASI.SR", currency: "SAR", region: "Middle East & Africa", suffix: ".SR", popular: ["2222.SR", "1120.SR", "1180.SR"] },
  { code: "JSE", name: "Johannesburg Stock Exchange", country: "South Africa", flag: "🇿🇦", index: "FTSE/JSE All Share", indexSymbol: "^J203.JO", currency: "ZAR", region: "Middle East & Africa", suffix: ".JO", popular: ["NPN.JO", "BHP.JO", "AGL.JO"] },
];

export const WORLD_INDICES = [
  { symbol: "^GSPC", name: "S&P 500", region: "US" },
  { symbol: "^DJI", name: "Dow Jones", region: "US" },
  { symbol: "^IXIC", name: "NASDAQ", region: "US" },
  { symbol: "^RUT", name: "Russell 2000", region: "US" },
  { symbol: "^VIX", name: "VIX", region: "US" },
  { symbol: "^FTSE", name: "FTSE 100", region: "UK" },
  { symbol: "^GDAXI", name: "DAX", region: "DE" },
  { symbol: "^FCHI", name: "CAC 40", region: "FR" },
  { symbol: "^N225", name: "Nikkei 225", region: "JP" },
  { symbol: "^HSI", name: "Hang Seng", region: "HK" },
  { symbol: "^NSEI", name: "Nifty 50", region: "IN" },
  { symbol: "^AXJO", name: "ASX 200", region: "AU" },
];
