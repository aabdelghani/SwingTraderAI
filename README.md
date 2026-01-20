# SwingTrader AI - Swedish Equities Backtesting System

A professional web-based interface for an AI-Ready Swing Trading Backtesting System focused on Swedish equities. This frontend application provides a comprehensive dashboard for configuring strategies, visualizing backtest results, and analyzing trade performance.

![Dashboard Preview](https://img.shields.io/badge/Status-Frontend_Ready-brightgreen) ![React](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## 🎯 Current Frontend Capabilities

### ✅ Implemented Features

#### Dashboard Overview
- **Header Navigation** - Professional trading terminal header with branding
- **Responsive Layout** - Optimized for desktop and tablet viewing

#### Performance Metrics Display
- **Total Return** - Portfolio performance percentage with trend indicators
- **Win Rate** - Trade success rate visualization
- **Sharpe Ratio** - Risk-adjusted return metric
- **Max Drawdown** - Largest peak-to-trough decline display

#### Equity Curve Visualization
- **Interactive Area Chart** - Time-series portfolio value using Recharts
- **Reference Line** - Initial equity baseline indicator
- **SEK Formatting** - Swedish locale currency display (sv-SE)
- **Responsive Tooltips** - Hover details with formatted dates/values

#### Trade History Table
- **Scrollable Trade Log** - Paginated list of historical trades
- **Trade Details** - Entry/exit prices, P&L, quantities
- **Signal Badges** - Visual indicators (MA_CROSS, RSI, AI_SIGNAL, COMBINED)
- **AI Confidence Display** - Percentage confidence for AI-generated signals
- **Profit/Loss Coloring** - Green/red visual indicators

#### Strategy Configuration Panel
- **Moving Average Settings**
  - Short MA Period (5-30, step: 1)
  - Long MA Period (20-200, step: 5)
- **RSI Configuration**
  - RSI Period (7-21)
  - Oversold Threshold (15-40)
  - Overbought Threshold (60-85)
- **Risk Management**
  - Stop Loss (1-10%)
  - Take Profit (3-20%)
- **AI Decision Support Toggle**
  - Enable/disable AI assistance
  - Confidence Threshold slider (50-95%)

#### Phase Indicator Pipeline
- **Visual Progress Tracker** - Multi-step backtest execution stages
- **Completion Indicators** - Checkmarks for completed phases
- **Current Phase Highlight** - Active step visualization

#### Stock Selector Display
- **Stock Information Card** - Symbol, name, current price
- **Price Change Indicators** - Up/down arrows with percentage
- **Market Data** - Volume, 52-week high/low (UI ready)

### ⚠️ Current Limitations (Frontend-Only)

| Feature | Status | Notes |
|---------|--------|-------|
| Run Backtest | UI Only | Button triggers mock simulation |
| Live Data | Mock | Uses static sample data |
| Trade Execution | Not Implemented | Requires backend |
| Data Persistence | None | No database connected |
| User Authentication | Not Implemented | Requires backend |
| Real-time Updates | Not Implemented | Requires WebSocket/API |

### 🎨 Design Features
- Professional dark trading terminal aesthetic
- Color-coded profit/loss indicators (green/red)
- Responsive layout for desktop and tablet
- Swedish locale formatting (SEK currency, sv-SE dates)
- Custom trading-themed UI components
- Smooth animations and transitions

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Build | Vite |
| Icons | Lucide React |
| State | React useState/useCallback |

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
- [ ] Fetch OHLCV data from Swedish market APIs
- [ ] Data validation and cleaning
- [ ] Database storage (PostgreSQL/SQLite)

#### Swedish Market Data Sources

| Source | API Type | Coverage | Notes |
|--------|----------|----------|-------|
| **Yahoo Finance** | REST (yfinance) | Global + OMX Stockholm | Free, suffix `.ST` for Swedish stocks (e.g., `SAAB-B.ST`) |
| **Avanza** | Unofficial API | OMX Stockholm, First North | No official API; scraping/reverse-engineering required |
| **Nordnet** | Unofficial API | Nordic markets | Similar to Avanza; unofficial endpoints |
| **Nasdaq Nordic** | REST | OMX Stockholm official | Official exchange data |
| **Alpha Vantage** | REST | Global markets | Free tier available, requires API key |

#### Yahoo Finance Implementation (Recommended)

```python
import yfinance as yf
from datetime import datetime, timedelta

def fetch_swedish_stock(symbol: str, period: str = "1y") -> pd.DataFrame:
    """
    Fetch OHLCV data for Swedish stocks.
    
    Args:
        symbol: Stock symbol with .ST suffix (e.g., 'SAAB-B.ST', 'VOLV-B.ST')
        period: Data period ('1mo', '3mo', '6mo', '1y', '2y', '5y', 'max')
    
    Returns:
        DataFrame with columns: Open, High, Low, Close, Volume, Adj Close
    """
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period)
    return df

# Example usage
saab_data = fetch_swedish_stock("SAAB-B.ST", period="1y")
volvo_data = fetch_swedish_stock("VOLV-B.ST", period="2y")

# Popular Swedish stocks
SWEDISH_STOCKS = [
    "SAAB-B.ST",    # Saab
    "VOLV-B.ST",    # Volvo
    "ERIC-B.ST",    # Ericsson
    "HM-B.ST",      # H&M
    "SEB-A.ST",     # SEB
    "SWED-A.ST",    # Swedbank
    "ASSA-B.ST",    # Assa Abloy
    "ATCO-A.ST",    # Atlas Copco
    "INVE-B.ST",    # Investor
    "SAND.ST",      # Sandvik
]
```

#### Data Validation

```python
def validate_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and clean OHLCV data."""
    # Remove rows with missing values
    df = df.dropna()
    
    # Ensure OHLC consistency (High >= Low, etc.)
    df = df[df['High'] >= df['Low']]
    df = df[df['High'] >= df['Open']]
    df = df[df['High'] >= df['Close']]
    df = df[df['Low'] <= df['Open']]
    df = df[df['Low'] <= df['Close']]
    
    # Remove zero/negative volumes
    df = df[df['Volume'] > 0]
    
    return df
```

#### Database Schema

```sql
CREATE TABLE ohlcv_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open DECIMAL(12, 4) NOT NULL,
    high DECIMAL(12, 4) NOT NULL,
    low DECIMAL(12, 4) NOT NULL,
    close DECIMAL(12, 4) NOT NULL,
    volume BIGINT NOT NULL,
    adj_close DECIMAL(12, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

CREATE INDEX idx_ohlcv_symbol_date ON ohlcv_data(symbol, date);
```

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
