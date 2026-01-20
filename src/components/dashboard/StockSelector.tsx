import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface StockSelectorProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockSelector({ symbol, name, price, change, changePercent }: StockSelectorProps) {
  const isPositive = change >= 0;

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-primary">SAAB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{symbol}</h2>
                <Badge variant="secondary" className="text-[10px]">Phase 1</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="font-mono text-xl font-bold">{price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">SEK</span>
            </div>
            <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-profit' : 'text-loss'}`}>
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span className="font-mono text-sm">
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 ml-8 pl-8 border-l border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume</p>
              <p className="font-mono text-sm">2.4M</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">52W High</p>
              <p className="font-mono text-sm text-profit">925.60</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">52W Low</p>
              <p className="font-mono text-sm text-loss">612.40</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Delayed 15min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
