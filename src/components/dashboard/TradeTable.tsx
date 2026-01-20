import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types/trading';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Brain, Activity, ArrowRightLeft } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
}

const signalConfig = {
  MA_PULLBACK: { label: 'MA Pullback', icon: ArrowRightLeft, variant: 'default' as const },
  RSI_OVERSOLD: { label: 'RSI Oversold', icon: Activity, variant: 'secondary' as const },
  AI_ENHANCED: { label: 'AI Enhanced', icon: Brain, variant: 'outline' as const },
};

export function TradeTable({ trades }: TradeTableProps) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <Card variant="trading" className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Entry</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Exit</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">P&L</TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade, index) => {
                const signal = signalConfig[trade.signal];
                const SignalIcon = signal.icon;
                const isProfitable = trade.pnl >= 0;
                
                return (
                  <TableRow 
                    key={trade.id} 
                    className="border-border/50 hover:bg-secondary/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-xs">
                      <div className="flex flex-col">
                        <span>{trade.entryDate}</span>
                        <span className="text-muted-foreground">→ {trade.exitDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">{trade.symbol}</TableCell>
                    <TableCell className="font-mono text-sm text-right">{trade.entryPrice.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm text-right">{trade.exitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isProfitable ? (
                          <TrendingUp className="h-3.5 w-3.5 text-profit" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-loss" />
                        )}
                        <div className={cn(
                          "flex flex-col items-end font-mono text-sm",
                          isProfitable ? "text-profit" : "text-loss"
                        )}>
                          <span>{formatCurrency(trade.pnl)}</span>
                          <span className="text-xs">{formatPercent(trade.pnlPercent)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={signal.variant} className="gap-1 font-normal">
                        <SignalIcon className="h-3 w-3" />
                        {signal.label}
                        {trade.aiConfidence && (
                          <span className="ml-1 text-primary">{(trade.aiConfidence * 100).toFixed(0)}%</span>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
