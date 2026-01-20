import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComposedChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Line,
} from 'recharts';
import { OHLCVData } from '@/hooks/useYahooFinance';
import { CandlestickChart as CandlestickIcon } from 'lucide-react';

interface CandlestickChartProps {
  data: OHLCVData[];
  symbol: string;
}

interface CandleData extends OHLCVData {
  isGreen: boolean;
  bodyBottom: number;
  bodyHeight: number;
}

export function CandlestickChart({ data, symbol }: CandlestickChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CandlestickIcon className="h-4 w-4" />
            Candlestick Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  // Transform data for candlestick visualization
  const candleData: CandleData[] = data.slice(-60).map((d) => {
    const isGreen = d.close >= d.open;
    return {
      ...d,
      isGreen,
      bodyBottom: Math.min(d.open, d.close),
      bodyHeight: Math.abs(d.close - d.open),
    };
  });

  const prices = candleData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.05;

  const formatCurrency = (value: number) => `${Math.round(value)} kr`;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CandlestickIcon className="h-4 w-4" />
          {symbol} Candlestick (Last 60 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
                }}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={formatCurrency}
                domain={[minPrice - padding, maxPrice + padding]}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    high: 'High',
                    low: 'Low',
                    open: 'Open',
                    close: 'Close',
                  };
                  return [formatCurrency(value), labels[name] || name];
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE')}
              />
              {/* Wick (high-low line) */}
              <Line
                type="monotone"
                dataKey="high"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                dot={false}
                opacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                dot={false}
                opacity={0.5}
              />
              {/* Candle bodies */}
              <Bar dataKey="bodyHeight" stackId="candle" barSize={6}>
                {candleData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isGreen ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
