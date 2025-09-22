import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PriorityData {
  critical: { count: number; points: number; maxPoints: number };
  important: { count: number; points: number; maxPoints: number };
  normal: { count: number; points: number; maxPoints: number };
  low: { count: number; points: number; maxPoints: number };
}

interface PriorityBreakdownProps {
  breakdown: PriorityData;
  totalCounts?: {
    critical: number;
    important: number;
    normal: number;
    low: number;
  };
}

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({ breakdown, totalCounts }) => {
  const priorityItems = [
    {
      key: 'critical' as keyof PriorityData,
      label: 'Critical',
      className: 'bg-critical hover:bg-critical/90 text-critical-foreground border border-black/60',
      weight: 'x40'
    },
    {
      key: 'important' as keyof PriorityData,
      label: 'Important',
      className: 'bg-important hover:bg-important/90 text-important-foreground border border-black/60',
      weight: 'x30'
    },
    {
      key: 'normal' as keyof PriorityData,
      label: 'Normal',
      className: 'bg-normal hover:bg-normal/90 text-normal-foreground border border-black/60',
      weight: 'x20'
    },
    {
      key: 'low' as keyof PriorityData,
      label: 'Low',
      className: 'bg-low hover:bg-low/90 text-low-foreground border border-black/60',
      weight: 'x10'
    },
  ];

  return (
    <Card className="bg-gradient-card border-border/50 shadow-soft p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Impact by Priority
        </h3>

        <div className="space-y-3">
          {priorityItems.map(({ key, label, className, weight }) => {
            const item = breakdown[key];
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={`${className} text-xs px-2 py-1`}>
                    {label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.count}/{totalCounts?.[key] || item.count} rules
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {Math.round(item.points)}/{Math.round(item.maxPoints)}pts
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Priority Weights
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {priorityItems.map(({ key, label, weight }) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-mono text-foreground">{weight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};