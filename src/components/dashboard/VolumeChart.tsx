import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { OHLCVData } from '@/hooks/useYahooFinance';
import { BarChart3 } from 'lucide-react';

interface VolumeChartProps {
  data: OHLCVData[];
  symbol: string;
}

export function VolumeChart({ data, symbol }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  // Use last 60 days of data
  const volumeData = data.slice(-60).map((d) => ({
    ...d,
    isGreen: d.close >= d.open,
  }));

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const avgVolume = volumeData.reduce((sum, d) => sum + d.volume, 0) / volumeData.length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {symbol} Volume
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Avg: {formatVolume(avgVolume)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
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
                tickFormatter={formatVolume}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [formatVolume(value), 'Volume']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('sv-SE')}
              />
              <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isGreen ? 'hsl(var(--profit))' : 'hsl(var(--loss))'}
                    opacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
