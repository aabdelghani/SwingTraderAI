import { Phase } from '@/types/trading';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

const phases: { id: Phase; label: string; description: string }[] = [
  { id: 'rule-based', label: 'Rule-Based', description: 'MA Pullback Strategy' },
  { id: 'feature-engineering', label: 'Features', description: 'Technical Indicators' },
  { id: 'ai-support', label: 'AI Support', description: 'ML Decision Filter' },
  { id: 'validation', label: 'Validation', description: 'Performance Analysis' },
];

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {phases.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = phase.id === currentPhase;
        const isLast = index === phases.length - 1;

        return (
          <div key={phase.id} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
              isCurrent && "bg-primary/10 border border-primary/30",
              isCompleted && "bg-profit/5",
              !isCurrent && !isCompleted && "opacity-50"
            )}>
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-profit shrink-0" />
              ) : (
                <Circle className={cn(
                  "h-4 w-4 shrink-0",
                  isCurrent ? "text-primary fill-primary/20" : "text-muted-foreground"
                )} />
              )}
              <div className="min-w-0">
                <p className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isCurrent && "text-primary",
                  isCompleted && "text-profit"
                )}>
                  {phase.label}
                </p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
                  {phase.description}
                </p>
              </div>
            </div>
            {!isLast && (
              <ArrowRight className={cn(
                "h-4 w-4 mx-1 shrink-0",
                index < currentIndex ? "text-profit" : "text-muted-foreground/30"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
