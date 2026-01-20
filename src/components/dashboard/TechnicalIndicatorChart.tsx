import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComposedChart,
  Line,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { OHLCVData } from '@/hooks/useYahooFinance';
import { Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TechnicalIndicatorChartProps {
  data: OHLCVData[];
  symbol: string;
}

interface IndicatorData {
  date: string;
  close: number;
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
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

export function TechnicalIndicatorChart({ data, symbol }: TechnicalIndicatorChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  const closes = data.map(d => d.close);
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
  
  // Pad signal to match data length
  const signalPadded: (number | null)[] = new Array(macd.length - macdValues.length).fill(null).concat(signal);
  
  const histogram = macd.map((val, i) => {
    if (val === null || signalPadded[i] === null) return null;
    return val - signalPadded[i]!;
  });

  const indicatorData: IndicatorData[] = data.slice(-90).map((d, i) => {
    const idx = data.length - 90 + i;
    return {
      date: d.date,
      close: d.close,
      sma20: sma20[idx],
      sma50: sma50[idx],
      ema12: ema12[idx],
      ema26: ema26[idx],
      rsi: rsi[idx],
      macd: macd[idx],
      signal: signalPadded[idx],
      histogram: histogram[idx],
    };
  });

  const formatCurrency = (value: number) => `${Math.round(value)} kr`;

  const latestRSI = indicatorData[indicatorData.length - 1]?.rsi;
  const rsiStatus = latestRSI ? (latestRSI > 70 ? 'Overbought' : latestRSI < 30 ? 'Oversold' : 'Neutral') : '';

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {symbol} Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ma" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="ma" className="text-xs">Moving Avg</TabsTrigger>
            <TabsTrigger value="rsi" className="text-xs">RSI</TabsTrigger>
            <TabsTrigger value="macd" className="text-xs">MACD</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ma">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={indicatorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short' })}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={formatCurrency}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number | null, name: string) => {
                      if (value === null) return ['N/A', name];
                      return [formatCurrency(value), name];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE')}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="close" name="Price" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} connectNulls />
                  <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="rsi">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">RSI (14)</span>
              <span className={`text-xs font-medium ${
                latestRSI && latestRSI > 70 ? 'text-loss' : 
                latestRSI && latestRSI < 30 ? 'text-profit' : 'text-muted-foreground'
              }`}>
                {latestRSI?.toFixed(1)} - {rsiStatus}
              </span>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={indicatorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short' })}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    domain={[0, 100]}
                    ticks={[0, 30, 50, 70, 100]}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number | null) => value !== null ? [value.toFixed(2), 'RSI'] : ['N/A', 'RSI']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE')}
                  />
                  <ReferenceLine y={70} stroke="hsl(var(--loss))" strokeDasharray="3 3" opacity={0.7} />
                  <ReferenceLine y={30} stroke="hsl(var(--profit))" strokeDasharray="3 3" opacity={0.7} />
                  <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} />
                  <Area
                    type="monotone"
                    dataKey="rsi"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.2}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="macd">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={indicatorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short' })}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number | null, name: string) => value !== null ? [value.toFixed(2), name] : ['N/A', name]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE')}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
                  <Line type="monotone" dataKey="macd" name="MACD" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} connectNulls />
                  <Line type="monotone" dataKey="signal" name="Signal" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
