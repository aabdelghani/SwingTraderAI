import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Ticker {
  symbol: string;
  name: string;
}

const SWEDISH_TICKERS: Ticker[] = [
  { symbol: 'SAAB-B.ST', name: 'Saab AB' },
  { symbol: '0P0001B1CC.F', name: 'Evli Silver and Gold B' },
  { symbol: '0P0001OYEE.F', name: 'AuAg Silver Bullet A' },
];

interface TickerSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  currentPrice?: number;
  priceChange?: number;
  changePercent?: number;
  loading?: boolean;
}

export function TickerSelector({ 
  selectedSymbol, 
  onSymbolChange,
  currentPrice,
  priceChange,
  changePercent,
  loading 
}: TickerSelectorProps) {
  const isPositive = (priceChange ?? 0) >= 0;
  const selectedTicker = SWEDISH_TICKERS.find(t => t.symbol === selectedSymbol);

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedSymbol} onValueChange={onSymbolChange}>
        <SelectTrigger className="w-[200px] bg-card border-border">
          <SelectValue placeholder="Select stock" />
        </SelectTrigger>
        <SelectContent>
          {SWEDISH_TICKERS.map((ticker) => (
            <SelectItem key={ticker.symbol} value={ticker.symbol}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{ticker.symbol.replace('.ST', '')}</span>
                <span className="text-muted-foreground text-xs">- {ticker.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!loading && currentPrice !== undefined && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-mono text-lg font-bold">{currentPrice.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">SEK</span>
          </div>
          <Badge 
            variant={isPositive ? "default" : "destructive"} 
            className={`flex items-center gap-1 ${isPositive ? 'bg-profit/20 text-profit border-profit/30' : 'bg-loss/20 text-loss border-loss/30'}`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="font-mono text-xs">
              {isPositive ? '+' : ''}{priceChange?.toFixed(2)} ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
            </span>
          </Badge>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading...</span>
        </div>
      )}
    </div>
  );
}
