import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate realistic stock data based on symbol and date range
function generateStockData(symbol: string, range: string) {
  const now = new Date();
  const points: number[] = [];
  
  // Determine number of days based on range
  const rangeDays: Record<string, number> = {
    '1mo': 22,
    '3mo': 66,
    '6mo': 132,
    '1y': 252,
    '2y': 504,
    '5y': 1260,
  };
  
  const days = rangeDays[range] || 252;
  
  // Base prices for Swedish stocks (realistic ranges)
  const stockPrices: Record<string, { base: number; volatility: number; trend: number }> = {
    'SAAB-B.ST': { base: 850, volatility: 0.018, trend: 0.0004 },
    'VOLV-B.ST': { base: 280, volatility: 0.015, trend: 0.0002 },
    'ERIC-B.ST': { base: 75, volatility: 0.02, trend: 0.0001 },
    'HM-B.ST': { base: 165, volatility: 0.022, trend: -0.0001 },
    'SEB-A.ST': { base: 145, volatility: 0.016, trend: 0.0003 },
    'SWED-A.ST': { base: 210, volatility: 0.017, trend: 0.0002 },
    'ASSA-B.ST': { base: 310, volatility: 0.014, trend: 0.0003 },
    'ATCO-A.ST': { base: 185, volatility: 0.016, trend: 0.0004 },
    'INVE-B.ST': { base: 265, volatility: 0.015, trend: 0.0003 },
    'SAND.ST': { base: 225, volatility: 0.018, trend: 0.0002 },
  };
  
  const stockInfo = stockPrices[symbol] || { base: 100, volatility: 0.02, trend: 0.0002 };
  let price = stockInfo.base * 0.85; // Start from lower price for uptrend effect
  
  // Generate price series using geometric Brownian motion
  const ohlcv = [];
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  
  // Seed random based on symbol for consistency
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let rand = seed;
  const random = () => {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff;
    return rand / 0x7fffffff;
  };
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random walk with drift
    const dailyReturn = stockInfo.trend + stockInfo.volatility * (random() - 0.5) * 2;
    price = price * (1 + dailyReturn);
    
    // Generate OHLC from close
    const volatilityIntraday = stockInfo.volatility * 0.5;
    const open = price * (1 + (random() - 0.5) * volatilityIntraday);
    const high = Math.max(open, price) * (1 + random() * volatilityIntraday);
    const low = Math.min(open, price) * (1 - random() * volatilityIntraday);
    
    ohlcv.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume: Math.round(500000 + random() * 2000000),
    });
  }
  
  return ohlcv;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'SAAB-B.ST';
    const range = url.searchParams.get('range') || '1y';
    const interval = url.searchParams.get('interval') || '1d';

    console.log(`Generating market data for ${symbol}, range: ${range}`);

    // First try Yahoo Finance
    let ohlcv;
    let dataSource = 'simulated';
    
    try {
      const chartUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
      const chartResponse = await fetch(chartUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });

      if (chartResponse.ok) {
        const chartData = await chartResponse.json();
        const result = chartData?.chart?.result?.[0];
        
        if (result?.timestamp?.length > 0) {
          const timestamps = result.timestamp;
          const quotes = result.indicators?.quote?.[0] || {};
          
          ohlcv = timestamps.map((ts: number, i: number) => ({
            date: new Date(ts * 1000).toISOString().split('T')[0],
            open: quotes.open?.[i] || 0,
            high: quotes.high?.[i] || 0,
            low: quotes.low?.[i] || 0,
            close: quotes.close?.[i] || 0,
            volume: quotes.volume?.[i] || 0,
          })).filter((d: { close: number }) => d.close > 0);
          
          if (ohlcv.length > 0) {
            dataSource = 'yahoo';
            console.log(`Yahoo Finance returned ${ohlcv.length} data points`);
          }
        }
      }
    } catch (yahooError) {
      console.log('Yahoo Finance unavailable, using simulated data');
    }
    
    // Fallback to simulated data
    if (!ohlcv || ohlcv.length === 0) {
      ohlcv = generateStockData(symbol, range);
      console.log(`Generated ${ohlcv.length} simulated data points`);
    }

    // Build equity curve
    const initialCapital = 100000;
    const startPrice = ohlcv[0]?.close || 1;
    const equityCurve = ohlcv.map((point: { date: string; close: number }) => {
      const priceChange = (point.close - startPrice) / startPrice;
      return {
        date: point.date,
        equity: Math.round(initialCapital * (1 + priceChange * 1.15)),
        benchmark: Math.round(initialCapital * (1 + priceChange)),
      };
    });

    const currentPrice = ohlcv[ohlcv.length - 1]?.close || 0;
    const previousClose = ohlcv[ohlcv.length - 2]?.close || currentPrice;

    // Stock names
    const stockNames: Record<string, string> = {
      'SAAB-B.ST': 'Saab AB Series B',
      'VOLV-B.ST': 'Volvo AB Series B',
      'ERIC-B.ST': 'Ericsson AB Series B',
      'HM-B.ST': 'H&M AB Series B',
      'SEB-A.ST': 'SEB AB Series A',
      'SWED-A.ST': 'Swedbank AB Series A',
      'ASSA-B.ST': 'Assa Abloy AB Series B',
      'ATCO-A.ST': 'Atlas Copco AB Series A',
      'INVE-B.ST': 'Investor AB Series B',
      'SAND.ST': 'Sandvik AB',
    };

    return new Response(JSON.stringify({
      quote: {
        symbol,
        name: stockNames[symbol] || symbol.replace('.ST', ''),
        price: currentPrice,
        change: Math.round((currentPrice - previousClose) * 100) / 100,
        changePercent: Math.round(((currentPrice - previousClose) / previousClose * 100) * 100) / 100,
        volume: ohlcv[ohlcv.length - 1]?.volume || 0,
        fiftyTwoWeekHigh: Math.max(...ohlcv.map((d: { high: number }) => d.high)),
        fiftyTwoWeekLow: Math.min(...ohlcv.map((d: { low: number }) => d.low)),
      },
      ohlcv,
      equityCurve,
      meta: { 
        symbol, 
        range, 
        interval, 
        dataPoints: ohlcv.length, 
        fetchedAt: new Date().toISOString(),
        dataSource,
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
