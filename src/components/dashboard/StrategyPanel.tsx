import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StrategyConfig } from '@/types/trading';
import { Settings2, Play, Brain, TrendingUp, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StrategyPanelProps {
  config: StrategyConfig;
  onConfigChange: (config: StrategyConfig) => void;
  onRunBacktest: () => void;
  isRunning?: boolean;
}

export function StrategyPanel({ config, onConfigChange, onRunBacktest, isRunning }: StrategyPanelProps) {
  const updateConfig = (key: keyof StrategyConfig, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <Card variant="trading" className="animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            Strategy Configuration
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Moving Averages */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            Moving Averages
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Short MA Period</Label>
                <span className="font-mono text-sm text-foreground">{config.shortMA}</span>
              </div>
              <Slider
                value={[config.shortMA]}
                onValueChange={([value]) => updateConfig('shortMA', value)}
                min={5}
                max={30}
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Long MA Period</Label>
                <span className="font-mono text-sm text-foreground">{config.longMA}</span>
              </div>
              <Slider
                value={[config.longMA]}
                onValueChange={([value]) => updateConfig('longMA', value)}
                min={20}
                max={200}
                step={5}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* RSI Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            RSI Configuration
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">RSI Period</Label>
                <span className="font-mono text-sm text-foreground">{config.rsiPeriod}</span>
              </div>
              <Slider
                value={[config.rsiPeriod]}
                onValueChange={([value]) => updateConfig('rsiPeriod', value)}
                min={7}
                max={21}
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Oversold</Label>
                  <span className="font-mono text-sm text-profit">{config.rsiOversold}</span>
                </div>
                <Slider
                  value={[config.rsiOversold]}
                  onValueChange={([value]) => updateConfig('rsiOversold', value)}
                  min={15}
                  max={40}
                  step={5}
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Overbought</Label>
                  <span className="font-mono text-sm text-loss">{config.rsiOverbought}</span>
                </div>
                <Slider
                  value={[config.rsiOverbought]}
                  onValueChange={([value]) => updateConfig('rsiOverbought', value)}
                  min={60}
                  max={85}
                  step={5}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Risk Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
            <Shield className="h-3.5 w-3.5" />
            Risk Management
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Stop Loss</Label>
                <span className="font-mono text-sm text-loss">{config.stopLoss}%</span>
              </div>
              <Slider
                value={[config.stopLoss]}
                onValueChange={([value]) => updateConfig('stopLoss', value)}
                min={1}
                max={10}
                step={0.5}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Take Profit</Label>
                <span className="font-mono text-sm text-profit">{config.takeProfit}%</span>
              </div>
              <Slider
                value={[config.takeProfit]}
                onValueChange={([value]) => updateConfig('takeProfit', value)}
                min={3}
                max={20}
                step={0.5}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* AI Decision Support */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Brain className="h-3.5 w-3.5" />
              AI Decision Support
            </div>
            <Switch
              checked={config.useAI}
              onCheckedChange={(checked) => updateConfig('useAI', checked)}
            />
          </div>
          
          {config.useAI && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Confidence Threshold</Label>
                <span className="font-mono text-sm text-foreground">{(config.aiConfidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[config.aiConfidenceThreshold * 100]}
                onValueChange={([value]) => updateConfig('aiConfidenceThreshold', value / 100)}
                min={50}
                max={95}
                step={5}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Only take trades when AI confidence exceeds this threshold
              </p>
            </div>
          )}
        </div>

        <Button 
          variant="trading" 
          className="w-full gap-2 mt-4" 
          onClick={onRunBacktest}
          disabled={isRunning}
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Running Backtest...' : 'Run Backtest'}
        </Button>
      </CardContent>
    </Card>
  );
}
