export interface Trade {
  id: string;
  entryDate: string;
  exitDate: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  shares: number;
  pnl: number;
  pnlPercent: number;
  signal: 'MA_PULLBACK' | 'RSI_OVERSOLD' | 'AI_ENHANCED';
  aiConfidence?: number;
}

export interface BacktestMetrics {
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  expectancy: number;
  sharpeRatio: number;
  profitFactor: number;
  totalReturn: number;
}

export interface StrategyConfig {
  shortMA: number;
  longMA: number;
  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;
  stopLoss: number;
  takeProfit: number;
  useAI: boolean;
  aiConfidenceThreshold: number;
}

export interface EquityCurvePoint {
  date: string;
  equity: number;
  drawdown: number;
}

export interface BacktestResult {
  metrics: BacktestMetrics;
  trades: Trade[];
  equityCurve: EquityCurvePoint[];
  strategyConfig: StrategyConfig;
}

export type Phase = 'rule-based' | 'feature-engineering' | 'ai-support' | 'validation';
