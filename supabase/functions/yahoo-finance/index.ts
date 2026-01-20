import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'SAAB-B.ST';
    const range = url.searchParams.get('range') || '1y';
    const interval = url.searchParams.get('interval') || '1d';

    console.log(`Fetching Yahoo Finance data for ${symbol}, range: ${range}, interval: ${interval}`);

    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const chartResponse = await fetch(chartUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    if (!chartResponse.ok) {
      throw new Error(`Yahoo API returned ${chartResponse.status}`);
    }

    const chartData = await chartResponse.json();
    const result = chartData?.chart?.result?.[0];
    const meta = result?.meta;
    const timestamps = result?.timestamp || [];
    const quotes = result?.indicators?.quote?.[0] || {};

    const ohlcv = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      open: quotes.open?.[i] || 0,
      high: quotes.high?.[i] || 0,
      low: quotes.low?.[i] || 0,
      close: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0,
    })).filter((d: { close: number }) => d.close > 0);

    const initialCapital = 100000;
    const startPrice = ohlcv[0]?.close || 1;
    const equityCurve = ohlcv.map((point: { date: string; close: number }) => {
      const priceChange = (point.close - startPrice) / startPrice;
      return {
        date: point.date,
        equity: Math.round(initialCapital * (1 + priceChange * 1.2)),
        benchmark: Math.round(initialCapital * (1 + priceChange)),
      };
    });

    return new Response(JSON.stringify({
      quote: {
        symbol: meta?.symbol || symbol,
        name: meta?.shortName || meta?.longName || symbol,
        price: meta?.regularMarketPrice || ohlcv[ohlcv.length - 1]?.close || 0,
        change: meta?.regularMarketPrice - meta?.previousClose || 0,
        changePercent: ((meta?.regularMarketPrice - meta?.previousClose) / meta?.previousClose * 100) || 0,
        volume: meta?.regularMarketVolume || 0,
        fiftyTwoWeekHigh: meta?.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: meta?.fiftyTwoWeekLow || 0,
      },
      ohlcv,
      equityCurve,
      meta: { symbol, range, interval, dataPoints: ohlcv.length, fetchedAt: new Date().toISOString() }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
