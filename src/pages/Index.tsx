import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { UnifiedChart } from '@/components/dashboard/UnifiedChart';
import { TradeTable } from '@/components/dashboard/TradeTable';
import { StrategyPanel } from '@/components/dashboard/StrategyPanel';
import { PhaseIndicator } from '@/components/dashboard/PhaseIndicator';
import { StockSelector } from '@/components/dashboard/StockSelector';
import { TickerSelector } from '@/components/dashboard/TickerSelector';
import { mockTrades, mockMetrics, mockEquityCurve, defaultStrategyConfig } from '@/data/mockData';
import { StrategyConfig, Phase } from '@/types/trading';
import { useYahooFinance } from '@/hooks/useYahooFinance';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Percent, 
  Activity,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>(defaultStrategyConfig);
  const [currentPhase] = useState<Phase>('rule-based');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('SAAB-B.ST');
  const [selectedRange, setSelectedRange] = useState<'1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'>('1y');
  const [selectedInterval, setSelectedInterval] = useState<'1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo'>('1d');

  // Fetch real Yahoo Finance data
  const { data: yahooData, loading, error, refetch } = useYahooFinance({
    symbol: selectedSymbol,
    range: selectedRange,
    interval: selectedInterval,
  });

  const handleRunBacktest = () => {
    setIsRunning(true);
    // Simulate backtest running - in real app, this would call your Python backend
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  // Use Yahoo Finance data if available, fallback to mock data
  const equityCurve = yahooData?.equityCurve?.length ? yahooData.equityCurve : mockEquityCurve;
  const stockQuote = yahooData?.quote;

  // Calculate metrics from real data if available
  const calculatedMetrics = yahooData?.equityCurve?.length ? {
    ...mockMetrics,
    totalReturn: yahooData.equityCurve.length > 1 
      ? Math.round(((yahooData.equityCurve[yahooData.equityCurve.length - 1].equity - yahooData.equityCurve[0].equity) / yahooData.equityCurve[0].equity) * 1000) / 10
      : mockMetrics.totalReturn,
    maxDrawdown: Math.max(...yahooData.equityCurve.map(p => p.drawdown)) || mockMetrics.maxDrawdown,
  } : mockMetrics;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Phase Indicator */}
        <PhaseIndicator currentPhase={currentPhase} />

        {/* Data Source Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading Yahoo Finance data...
            </span>
          ) : error ? (
            <span className="text-destructive">
              ⚠️ Error loading data: {error} (using mock data)
            </span>
          ) : yahooData ? (
            <span className="text-profit">
              ✓ Live data from Yahoo Finance • {yahooData.meta?.dataPoints} data points • Updated: {new Date(yahooData.meta?.fetchedAt || '').toLocaleString('sv-SE')}
            </span>
          ) : null}
        </div>

        {/* Stock Selector */}
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <StockSelector 
            symbol={stockQuote?.symbol || selectedSymbol}
            name={stockQuote?.name || "Saab AB Series B"}
            price={stockQuote?.price || 892.70}
            change={stockQuote?.change || 12.40}
            changePercent={stockQuote?.changePercent || 1.41}
          />
        )}

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Total Return"
            value={`${calculatedMetrics.totalReturn}%`}
            subtitle="Since inception"
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            title="Win Rate"
            value={`${calculatedMetrics.winRate}%`}
            subtitle={`${calculatedMetrics.totalTrades} total trades`}
            icon={Target}
            trend="up"
          />
          <MetricCard
            title="Max Drawdown"
            value={`${calculatedMetrics.maxDrawdown.toFixed(1)}%`}
            subtitle="Peak to trough"
            icon={AlertTriangle}
            trend="down"
          />
          <MetricCard
            title="Expectancy"
            value={`${calculatedMetrics.expectancy}R`}
            subtitle="Per trade avg"
            icon={BarChart3}
            trend="up"
          />
          <MetricCard
            title="Sharpe Ratio"
            value={calculatedMetrics.sharpeRatio.toFixed(2)}
            subtitle="Risk-adjusted"
            icon={Percent}
          />
          <MetricCard
            title="Profit Factor"
            value={calculatedMetrics.profitFactor.toFixed(2)}
            subtitle="Wins / Losses"
            icon={Activity}
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart & Table Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticker Selector above chart */}
            <div className="flex items-center justify-between">
              <TickerSelector
                selectedSymbol={selectedSymbol}
                onSymbolChange={setSelectedSymbol}
                currentPrice={stockQuote?.price}
                priceChange={stockQuote?.change}
                changePercent={stockQuote?.changePercent}
                loading={loading}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refetch}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <UnifiedChart 
                ohlcv={yahooData?.ohlcv || []} 
                equityCurve={equityCurve}
                symbol={selectedSymbol}
                selectedRange={selectedRange}
                selectedInterval={selectedInterval}
                onRangeChange={setSelectedRange}
                onIntervalChange={setSelectedInterval}
              />
            )}
            <TradeTable trades={mockTrades} />
          </div>

          {/* Strategy Panel Column */}
          <div className="lg:col-span-1">
            <StrategyPanel 
              config={strategyConfig}
              onConfigChange={setStrategyConfig}
              onRunBacktest={handleRunBacktest}
              isRunning={isRunning}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>
              SwingTrader AI • AI-Ready Backtesting System for Swedish Equities
            </p>
            <p>
              Data: Yahoo Finance (15min delay) | Project Owner: Ahmed Abdelghany
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
