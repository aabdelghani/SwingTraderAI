import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EquityChart } from '@/components/dashboard/EquityChart';
import { TradeTable } from '@/components/dashboard/TradeTable';
import { StrategyPanel } from '@/components/dashboard/StrategyPanel';
import { PhaseIndicator } from '@/components/dashboard/PhaseIndicator';
import { StockSelector } from '@/components/dashboard/StockSelector';
import { mockTrades, mockMetrics, mockEquityCurve, defaultStrategyConfig } from '@/data/mockData';
import { StrategyConfig, Phase } from '@/types/trading';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Percent, 
  Activity 
} from 'lucide-react';

const Index = () => {
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>(defaultStrategyConfig);
  const [currentPhase] = useState<Phase>('rule-based');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = () => {
    setIsRunning(true);
    // Simulate backtest running - in real app, this would call your Python backend
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Phase Indicator */}
        <PhaseIndicator currentPhase={currentPhase} />

        {/* Stock Selector */}
        <StockSelector 
          symbol="SAAB-B.ST"
          name="Saab AB Series B"
          price={892.70}
          change={12.40}
          changePercent={1.41}
        />

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Total Return"
            value={`${mockMetrics.totalReturn}%`}
            subtitle="Since inception"
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            title="Win Rate"
            value={`${mockMetrics.winRate}%`}
            subtitle={`${mockMetrics.totalTrades} total trades`}
            icon={Target}
            trend="up"
          />
          <MetricCard
            title="Max Drawdown"
            value={`${mockMetrics.maxDrawdown}%`}
            subtitle="Peak to trough"
            icon={AlertTriangle}
            trend="down"
          />
          <MetricCard
            title="Expectancy"
            value={`${mockMetrics.expectancy}R`}
            subtitle="Per trade avg"
            icon={BarChart3}
            trend="up"
          />
          <MetricCard
            title="Sharpe Ratio"
            value={mockMetrics.sharpeRatio.toFixed(2)}
            subtitle="Risk-adjusted"
            icon={Percent}
          />
          <MetricCard
            title="Profit Factor"
            value={mockMetrics.profitFactor.toFixed(2)}
            subtitle="Wins / Losses"
            icon={Activity}
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart & Table Column */}
          <div className="lg:col-span-2 space-y-6">
            <EquityChart data={mockEquityCurve} />
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
              Project Owner: Ahmed Abdelghany | Quantitative Systems
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
