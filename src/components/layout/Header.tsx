import { Activity, LineChart, Github, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 border border-primary/30">
            <LineChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">
              SwingTrader<span className="text-primary">AI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Swedish Equities Backtester
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-profit/10 border border-profit/30">
            <Activity className="h-3 w-3 text-profit animate-pulse" />
            <span className="text-xs font-medium text-profit">System Online</span>
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
