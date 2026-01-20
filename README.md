# SwingTrader AI - Swedish Equities Backtesting System

A professional web-based interface for an AI-Ready Swing Trading Backtesting System focused on Swedish equities. This frontend application provides a comprehensive dashboard for configuring strategies, visualizing backtest results, and analyzing trade performance.

![Dashboard Preview](https://img.shields.io/badge/Status-Frontend_Ready-brightgreen) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## 🎯 Features

### Dashboard Components
- **Metrics Overview** - Key performance indicators (Total Return, Win Rate, Sharpe Ratio, Max Drawdown)
- **Equity Curve Chart** - Interactive visualization of portfolio value over time
- **Trade History Table** - Detailed trade log with entry/exit prices, P&L, and signal types
- **Strategy Configuration Panel** - Real-time parameter adjustment for backtesting
- **Phase Indicator** - Visual pipeline showing backtest execution stages

### Strategy Configuration
- **Moving Averages** - Configurable short (5-30) and long (20-200) MA periods
- **RSI Settings** - Adjustable period (7-21), oversold (15-40), and overbought (60-85) thresholds
- **Risk Management** - Stop loss (1-10%) and take profit (3-20%) parameters
- **AI Decision Support** - Toggle AI assistance with confidence threshold (50-95%)

### Design
- Professional dark trading terminal aesthetic
- Color-coded profit/loss indicators
- Responsive layout for desktop and tablet
- Swedish locale formatting (SEK currency, sv-SE dates)

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Build | Vite |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── EquityChart.tsx      # Portfolio equity visualization
│   │   ├── MetricCard.tsx       # KPI display cards
│   │   ├── PhaseIndicator.tsx   # Pipeline phase visualization
│   │   ├── StockSelector.tsx    # Stock info display
│   │   ├── StrategyPanel.tsx    # Strategy configuration controls
│   │   └── TradeTable.tsx       # Trade history table
│   ├── layout/
│   │   └── Header.tsx           # App header with navigation
│   └── ui/                      # shadcn/ui components
├── data/
│   └── mockData.ts              # Sample data for development
├── pages/
│   └── Index.tsx                # Main dashboard page
└── types/
    └── trading.ts               # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd swingtrader-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔌 Backend Integration

This frontend is designed to connect to a Python backend. Replace the mock data in `src/data/mockData.ts` with API calls to your backend.

### Expected API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/backtest` | POST | Run backtest with strategy config |
| `/api/trades` | GET | Fetch trade history |
| `/api/metrics` | GET | Get performance metrics |
| `/api/equity-curve` | GET | Get equity curve data |
| `/api/stocks` | GET | List available Swedish stocks |

### TypeScript Interfaces

All data types are defined in `src/types/trading.ts`:

```typescript
interface Trade {
  id: string;
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  signal: 'MA_CROSS' | 'RSI' | 'AI_SIGNAL' | 'COMBINED';
  aiConfidence?: number;
}

interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
}

interface StrategyConfig {
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

interface EquityCurvePoint {
  date: string;
  equity: number;
  benchmark?: number;
}
```

## 🐍 Python Backend Tasks

The following modules need to be implemented in your Python backend:

### 1. Data Pipeline
- [ ] Fetch OHLCV data from Swedish market APIs (Avanza, Nordnet, Yahoo Finance)
- [ ] Data validation and cleaning
- [ ] Database storage (PostgreSQL/SQLite)

### 2. Technical Indicators
- [ ] Moving Average calculations (SMA, EMA)
- [ ] RSI implementation
- [ ] Additional indicators (MACD, Bollinger Bands)

### 3. Signal Generation
- [ ] MA crossover detection
- [ ] RSI oversold/overbought signals
- [ ] Combined signal logic

### 4. Backtesting Engine
- [ ] Position sizing and portfolio management
- [ ] Trade execution simulation
- [ ] Performance metrics calculation
- [ ] Equity curve generation

### 5. AI Integration (Optional)
- [ ] Model training pipeline
- [ ] Signal prediction endpoint
- [ ] Confidence scoring

## 📊 Sample API Response Formats

### POST /api/backtest
```json
{
  "config": {
    "shortMA": 10,
    "longMA": 50,
    "rsiPeriod": 14,
    "stopLoss": 3,
    "takeProfit": 8,
    "useAI": true,
    "aiConfidenceThreshold": 70
  },
  "symbol": "SAAB-B.ST",
  "startDate": "2024-01-01",
  "endDate": "2025-01-01"
}
```

### GET /api/metrics Response
```json
{
  "totalReturn": 24.5,
  "annualizedReturn": 18.2,
  "sharpeRatio": 1.85,
  "maxDrawdown": -8.3,
  "winRate": 62.5,
  "totalTrades": 48,
  "profitFactor": 2.1,
  "averageWin": 3200,
  "averageLoss": -1520
}
```

## 🎨 Customization

### Theme Colors
Edit `src/index.css` to modify the trading terminal theme:
- `--profit` / `--loss` - Trade outcome colors
- `--chart-*` - Chart visualization colors
- `--trading-*` - Terminal accent colors

### Adding New Metrics
1. Update `BacktestMetrics` interface in `types/trading.ts`
2. Add new `MetricCard` in `pages/Index.tsx`
3. Update mock data or API integration

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-indicator`)
3. Commit changes (`git commit -m 'Add MACD indicator'`)
4. Push to branch (`git push origin feature/new-indicator`)
5. Open a Pull Request
