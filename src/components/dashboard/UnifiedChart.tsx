import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { OHLCVData } from '@/hooks/useYahooFinance';
import { EquityCurvePoint } from '@/types/trading';
import { Activity, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max';
type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';

interface UnifiedChartProps {
  ohlcv: OHLCVData[];
  equityCurve: EquityCurvePoint[];
  symbol: string;
  selectedRange: TimeRange;
  selectedInterval: TimeInterval;
  onRangeChange: (range: TimeRange) => void;
  onIntervalChange: (interval: TimeInterval) => void;
}

interface TimeRangeOption {
  value: TimeRange;
  label: string;
  defaultInterval: TimeInterval;
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: '1d', label: '1D', defaultInterval: '5m' },
  { value: '5d', label: '5D', defaultInterval: '15m' },
  { value: '1mo', label: '1M', defaultInterval: '1h' },
  { value: '3mo', label: '3M', defaultInterval: '1d' },
  { value: '6mo', label: '6M', defaultInterval: '1d' },
  { value: '1y', label: '1Y', defaultInterval: '1d' },
  { value: '2y', label: '2Y', defaultInterval: '1wk' },
  { value: '5y', label: '5Y', defaultInterval: '1wk' },
  { value: 'max', label: 'MAX', defaultInterval: '1mo' },
];

interface ChartDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  equity: number;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  isGreen: boolean;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, index) => {
    if (index < period - 1) return null;
    const slice = data.slice(index - period + 1, index + 1);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  });
}

// Calculate Exponential Moving Average
function calculateEMA(data: number[], period: number): (number | null)[] {
  const multiplier = 2 / (period + 1);
  const ema: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      const sma = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
      ema.push(sma);
    } else {
      const prevEma = ema[i - 1];
      if (prevEma !== null) {
        ema.push((data[i] - prevEma) * multiplier + prevEma);
      } else {
        ema.push(null);
      }
    }
  }
  return ema;
}

// Calculate RSI
function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }
    
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
    
    if (i < period) {
      rsi.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((sum, val) => sum + val, 0) / period;
      const avgLoss = losses.slice(-period).reduce((sum, val) => sum + val, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  return rsi;
}

type IndicatorKey = 'price' | 'equity' | 'sma20' | 'sma50' | 'ema12' | 'ema26' | 'volume' | 'rsi' | 'macd';

interface IndicatorConfig {
  key: IndicatorKey;
  label: string;
  color: string;
  defaultEnabled: boolean;
  group: 'price' | 'oscillator';
}

const INDICATORS: IndicatorConfig[] = [
  { key: 'price', label: 'Price', color: 'hsl(var(--foreground))', defaultEnabled: true, group: 'price' },
  { key: 'equity', label: 'Equity Curve', color: 'hsl(var(--chart-5))', defaultEnabled: false, group: 'price' },
  { key: 'sma20', label: 'SMA 20', color: 'hsl(var(--chart-1))', defaultEnabled: true, group: 'price' },
  { key: 'sma50', label: 'SMA 50', color: 'hsl(var(--chart-2))', defaultEnabled: true, group: 'price' },
  { key: 'ema12', label: 'EMA 12', color: 'hsl(var(--chart-3))', defaultEnabled: false, group: 'price' },
  { key: 'ema26', label: 'EMA 26', color: 'hsl(var(--chart-4))', defaultEnabled: false, group: 'price' },
  { key: 'volume', label: 'Volume', color: 'hsl(var(--muted-foreground))', defaultEnabled: true, group: 'price' },
  { key: 'rsi', label: 'RSI (14)', color: 'hsl(var(--profit))', defaultEnabled: false, group: 'oscillator' },
  { key: 'macd', label: 'MACD', color: 'hsl(var(--chart-1))', defaultEnabled: false, group: 'oscillator' },
];

export function UnifiedChart({ 
  ohlcv, 
  equityCurve, 
  symbol, 
  selectedRange, 
  selectedInterval,
  onRangeChange,
  onIntervalChange,
}: UnifiedChartProps) {
  const [enabledIndicators, setEnabledIndicators] = useState<Set<IndicatorKey>>(
    new Set(INDICATORS.filter(i => i.defaultEnabled).map(i => i.key))
  );

  const handleRangeChange = (range: TimeRange) => {
    const rangeOption = TIME_RANGES.find(r => r.value === range);
    if (rangeOption) {
      onRangeChange(range);
      onIntervalChange(rangeOption.defaultInterval);
    }
  };

  const toggleIndicator = (key: IndicatorKey) => {
    setEnabledIndicators(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (!ohlcv || ohlcv.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Unified Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  // Calculate all indicators
  const closes = ohlcv.map(d => d.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const rsi = calculateRSI(closes, 14);

  // Calculate MACD
  const macd = ema12.map((val, i) => {
    if (val === null || ema26[i] === null) return null;
    return val - ema26[i]!;
  });
  const macdValues = macd.filter((v): v is number => v !== null);
  const signal = calculateEMA(macdValues, 9);
  const signalPadded: (number | null)[] = new Array(macd.length - macdValues.length).fill(null).concat(signal);

  // Use all data (already filtered by range from API)
  const chartData: ChartDataPoint[] = ohlcv.map((d, i) => {
    const equityPoint = equityCurve[i] || equityCurve[equityCurve.length - 1];
    return {
      date: d.date,
      close: d.close,
      open: d.open,
      high: d.high,
      low: d.low,
      volume: d.volume,
      equity: equityPoint?.equity || 100000,
      sma20: sma20[i],
      sma50: sma50[i],
      ema12: ema12[i],
      ema26: ema26[i],
      rsi: rsi[i],
      macd: macd[i],
      signal: signalPadded[i],
      isGreen: d.close >= d.open,
    };
  });

  const formatCurrency = (value: number) => `${Math.round(value)} kr`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Calculate Y-axis domains
  const prices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const pricePadding = (maxPrice - minPrice) * 0.1;

  // Format date based on interval
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (['1m', '5m', '15m', '30m', '1h'].includes(selectedInterval)) {
      return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    }
    if (['1d', '5d', '1mo'].includes(selectedRange)) {
      return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString('sv-SE', { month: 'short', year: '2-digit' });
  };

  const showOscillator = enabledIndicators.has('rsi') || enabledIndicators.has('macd');
  const showVolume = enabledIndicators.has('volume');

  const latestRSI = chartData[chartData.length - 1]?.rsi;

  // Generate Yahoo Finance chart URL
  const yahooChartUrl = `https://finance.yahoo.com/chart/${encodeURIComponent(symbol)}`;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {symbol}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRangeChange(range.value)}
                    className={cn(
                      "h-7 px-2.5 text-xs font-medium transition-colors",
                      selectedRange === range.value 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              
              {/* Advanced Chart Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs gap-1.5"
                onClick={() => window.open(yahooChartUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
                Advanced Chart
              </Button>
            </div>
          </div>
          
          {/* Indicator Toggles */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {INDICATORS.map((indicator) => (
              <div key={indicator.key} className="flex items-center space-x-2">
                <Checkbox
                  id={indicator.key}
                  checked={enabledIndicators.has(indicator.key)}
                  onCheckedChange={() => toggleIndicator(indicator.key)}
                  className="h-3.5 w-3.5"
                />
                <Label 
                  htmlFor={indicator.key} 
                  className="text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: indicator.color }}
                  />
                  {indicator.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Main Price Chart */}
          <div className={showOscillator ? "h-72" : "h-96"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickFormatter={formatDate}
                  interval="preserveStartEnd"
                  minTickGap={60}
                />
                <YAxis 
                  yAxisId="price"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickFormatter={formatCurrency}
                  domain={[minPrice - pricePadding, maxPrice + pricePadding]}
                  width={55}
                  orientation="right"
                />
                {showVolume && (
                  <YAxis 
                    yAxisId="volume"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    tickFormatter={formatVolume}
                    orientation="left"
                    width={45}
                    domain={[0, (dataMax: number) => dataMax * 3]}
                  />
                )}
                {enabledIndicators.has('equity') && (
                  <YAxis 
                    yAxisId="equity"
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  formatter={(value: number | null, name: string) => {
                    if (value === null) return ['N/A', name];
                    if (name === 'volume') return [formatVolume(value), 'Volume'];
                    if (name === 'equity') return [formatCurrency(value), 'Equity'];
                    return [formatCurrency(value), name.toUpperCase()];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                />
                
                {/* Volume Bars */}
                {showVolume && (
                  <Bar yAxisId="volume" dataKey="volume" opacity={0.4} radius={[1, 1, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`vol-${index}`}
                        fill={entry.isGreen ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                      />
                    ))}
                  </Bar>
                )}

                {/* Price Area */}
                {enabledIndicators.has('price') && (
                  <Area
                    yAxisId="price"
                    type="monotone"
                    dataKey="close"
                    name="price"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                  />
                )}

                {/* Equity Curve */}
                {enabledIndicators.has('equity') && (
                  <Area
                    yAxisId="equity"
                    type="monotone"
                    dataKey="equity"
                    name="equity"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                  />
                )}

                {/* Moving Averages */}
                {enabledIndicators.has('sma20') && (
                  <Line yAxisId="price" type="monotone" dataKey="sma20" name="sma20" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} connectNulls />
                )}
                {enabledIndicators.has('sma50') && (
                  <Line yAxisId="price" type="monotone" dataKey="sma50" name="sma50" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} connectNulls />
                )}
                {enabledIndicators.has('ema12') && (
                  <Line yAxisId="price" type="monotone" dataKey="ema12" name="ema12" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} connectNulls />
                )}
                {enabledIndicators.has('ema26') && (
                  <Line yAxisId="price" type="monotone" dataKey="ema26" name="ema26" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={false} connectNulls />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* RSI Panel */}
          {enabledIndicators.has('rsi') && (
            <div className="h-28 border-t border-border pt-2">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-xs text-muted-foreground">RSI (14)</span>
                <span className={`text-xs font-medium ${
                  latestRSI && latestRSI > 70 ? 'text-loss' : 
                  latestRSI && latestRSI < 30 ? 'text-profit' : 'text-muted-foreground'
                }`}>
                  {latestRSI?.toFixed(1)} {latestRSI && latestRSI > 70 ? '• Overbought' : latestRSI && latestRSI < 30 ? '• Oversold' : ''}
                </span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    domain={[0, 100]}
                    ticks={[30, 70]}
                    width={25}
                    orientation="right"
                  />
                  <ReferenceLine y={70} stroke="hsl(var(--loss))" strokeDasharray="2 2" opacity={0.5} />
                  <ReferenceLine y={30} stroke="hsl(var(--profit))" strokeDasharray="2 2" opacity={0.5} />
                  <Area
                    type="monotone"
                    dataKey="rsi"
                    stroke="hsl(var(--profit))"
                    strokeWidth={1.5}
                    fill="hsl(var(--profit))"
                    fillOpacity={0.1}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Panel */}
          {enabledIndicators.has('macd') && (
            <div className="h-28 border-t border-border pt-2">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-xs text-muted-foreground">MACD (12, 26, 9)</span>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    width={35}
                    orientation="right"
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" opacity={0.5} />
                  <Line type="monotone" dataKey="macd" name="MACD" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} connectNulls />
                  <Line type="monotone" dataKey="signal" name="Signal" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
