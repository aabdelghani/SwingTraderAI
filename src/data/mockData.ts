import { Trade, BacktestMetrics, EquityCurvePoint, StrategyConfig } from '@/types/trading';

export const mockTrades: Trade[] = [
  { id: '1', entryDate: '2024-01-05', exitDate: '2024-01-12', symbol: 'SAAB-B.ST', entryPrice: 682.40, exitPrice: 715.80, shares: 50, pnl: 1670, pnlPercent: 4.89, signal: 'MA_PULLBACK' },
  { id: '2', entryDate: '2024-01-18', exitDate: '2024-01-24', symbol: 'SAAB-B.ST', entryPrice: 701.20, exitPrice: 688.50, shares: 50, pnl: -635, pnlPercent: -1.81, signal: 'RSI_OVERSOLD' },
  { id: '3', entryDate: '2024-02-01', exitDate: '2024-02-09', symbol: 'SAAB-B.ST', entryPrice: 695.00, exitPrice: 742.30, shares: 50, pnl: 2365, pnlPercent: 6.81, signal: 'MA_PULLBACK' },
  { id: '4', entryDate: '2024-02-15', exitDate: '2024-02-21', symbol: 'SAAB-B.ST', entryPrice: 738.60, exitPrice: 751.90, shares: 50, pnl: 665, pnlPercent: 1.80, signal: 'AI_ENHANCED', aiConfidence: 0.78 },
  { id: '5', entryDate: '2024-03-04', exitDate: '2024-03-11', symbol: 'SAAB-B.ST', entryPrice: 760.00, exitPrice: 745.20, shares: 50, pnl: -740, pnlPercent: -1.95, signal: 'MA_PULLBACK' },
  { id: '6', entryDate: '2024-03-18', exitDate: '2024-03-26', symbol: 'SAAB-B.ST', entryPrice: 752.40, exitPrice: 798.60, shares: 50, pnl: 2310, pnlPercent: 6.14, signal: 'AI_ENHANCED', aiConfidence: 0.85 },
  { id: '7', entryDate: '2024-04-02', exitDate: '2024-04-09', symbol: 'SAAB-B.ST', entryPrice: 805.00, exitPrice: 821.40, shares: 50, pnl: 820, pnlPercent: 2.04, signal: 'RSI_OVERSOLD' },
  { id: '8', entryDate: '2024-04-15', exitDate: '2024-04-23', symbol: 'SAAB-B.ST', entryPrice: 815.30, exitPrice: 802.10, shares: 50, pnl: -660, pnlPercent: -1.62, signal: 'MA_PULLBACK' },
  { id: '9', entryDate: '2024-05-06', exitDate: '2024-05-14', symbol: 'SAAB-B.ST', entryPrice: 810.00, exitPrice: 865.20, shares: 50, pnl: 2760, pnlPercent: 6.81, signal: 'AI_ENHANCED', aiConfidence: 0.91 },
  { id: '10', entryDate: '2024-05-20', exitDate: '2024-05-28', symbol: 'SAAB-B.ST', entryPrice: 858.40, exitPrice: 892.70, shares: 50, pnl: 1715, pnlPercent: 3.99, signal: 'MA_PULLBACK' },
];

export const mockMetrics: BacktestMetrics = {
  totalTrades: 47,
  winRate: 68.1,
  avgReturn: 2.84,
  maxDrawdown: 8.7,
  expectancy: 1.42,
  sharpeRatio: 1.87,
  profitFactor: 2.31,
  totalReturn: 34.6,
};

export const mockEquityCurve: EquityCurvePoint[] = [
  { date: '2024-01-01', equity: 100000, drawdown: 0 },
  { date: '2024-01-15', equity: 103500, drawdown: 0 },
  { date: '2024-02-01', equity: 102100, drawdown: 1.35 },
  { date: '2024-02-15', equity: 108400, drawdown: 0 },
  { date: '2024-03-01', equity: 111200, drawdown: 0 },
  { date: '2024-03-15', equity: 107800, drawdown: 3.06 },
  { date: '2024-04-01', equity: 115600, drawdown: 0 },
  { date: '2024-04-15', equity: 118900, drawdown: 0 },
  { date: '2024-05-01', equity: 114200, drawdown: 3.95 },
  { date: '2024-05-15', equity: 124800, drawdown: 0 },
  { date: '2024-06-01', equity: 128500, drawdown: 0 },
  { date: '2024-06-15', equity: 134600, drawdown: 0 },
];

export const defaultStrategyConfig: StrategyConfig = {
  shortMA: 10,
  longMA: 50,
  rsiPeriod: 14,
  rsiOversold: 30,
  rsiOverbought: 70,
  stopLoss: 3.0,
  takeProfit: 8.0,
  useAI: false,
  aiConfidenceThreshold: 0.7,
};
