import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EquityCurvePoint } from '@/types/trading';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface YahooFinanceData {
  quote: StockQuote | null;
  ohlcv: OHLCVData[];
  equityCurve: EquityCurvePoint[];
  meta: {
    symbol: string;
    range: string;
    interval: string;
    dataPoints: number;
    fetchedAt: string;
  } | null;
}

interface UseYahooFinanceOptions {
  symbol?: string;
  range?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max';
  interval?: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
  autoFetch?: boolean;
}

export function useYahooFinance(options: UseYahooFinanceOptions = {}) {
  const {
    symbol = 'SAAB-B.ST',
    range = '1y',
    interval = '1d',
    autoFetch = true,
  } = options;

  const [data, setData] = useState<YahooFinanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching Yahoo Finance data for ${symbol}...`);
      
      const { data: responseData, error: fetchError } = await supabase.functions.invoke(
        'yahoo-finance',
        {
          body: null,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // The edge function uses query params, so we need to call it differently
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/yahoo-finance?symbol=${encodeURIComponent(symbol)}&range=${range}&interval=${interval}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Transform equity curve to include drawdown
      const equityCurve: EquityCurvePoint[] = (result.equityCurve || []).map((point: { date: string; equity: number; benchmark?: number }, index: number, arr: { date: string; equity: number }[]) => {
        // Calculate drawdown
        const maxEquitySoFar = Math.max(...arr.slice(0, index + 1).map(p => p.equity));
        const drawdown = maxEquitySoFar > 0 ? ((maxEquitySoFar - point.equity) / maxEquitySoFar) * 100 : 0;
        
        return {
          date: point.date,
          equity: point.equity,
          drawdown: Math.round(drawdown * 100) / 100,
        };
      });

      setData({
        quote: result.quote,
        ohlcv: result.ohlcv || [],
        equityCurve,
        meta: result.meta,
      });

      console.log(`Successfully fetched ${result.ohlcv?.length || 0} data points`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Error fetching Yahoo Finance data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbol, range, interval]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
