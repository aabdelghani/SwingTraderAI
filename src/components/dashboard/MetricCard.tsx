import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card variant="trading" className={cn("animate-fade-in", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className={cn(
              "text-2xl font-bold font-mono tracking-tight",
              trend === 'up' && "text-profit",
              trend === 'down' && "text-loss",
              !trend && "text-foreground"
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            trend === 'up' && "bg-profit/10 text-profit",
            trend === 'down' && "bg-loss/10 text-loss",
            !trend && "bg-primary/10 text-primary"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
