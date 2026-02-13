import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRIORITY_BADGE_COLORS, PRIORITY_WEIGHTS } from './constants';
import type { Priority } from '@/lib/scoring-engine/types';

interface PriorityItemData {
  count: number;
  points: number;
  maxPoints?: number;
}

interface PriorityData {
  critical: PriorityItemData;
  important: PriorityItemData;
  normal: PriorityItemData;
  low: PriorityItemData;
}

interface PriorityBreakdownProps {
  breakdown: PriorityData;
  totalCounts?: {
    critical: number;
    important: number;
    normal: number;
    low: number;
  };
  /**
   * Display variant:
   * - 'badge': Uses Badge component with colors (default, more informative)
   * - 'button': Uses Button component with variants (cleaner look)
   */
  variant?: 'badge' | 'button';
}

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({
  breakdown,
  totalCounts,
  variant = 'badge'
}) => {
  const priorityItems = [
    {
      key: 'critical' as Priority,
      label: 'Critical',
      weight: `x${PRIORITY_WEIGHTS.critical}`
    },
    {
      key: 'important' as Priority,
      label: 'Important',
      weight: `x${PRIORITY_WEIGHTS.important}`
    },
    {
      key: 'normal' as Priority,
      label: 'Normal',
      weight: `x${PRIORITY_WEIGHTS.normal}`
    },
    {
      key: 'low' as Priority,
      label: 'Low',
      weight: `x${PRIORITY_WEIGHTS.low}`
    },
  ];

  return (
    <Card className="bg-gradient-card border-border/50 shadow-soft p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Impact by Priority
        </h3>

        <div className="space-y-3">
          {priorityItems.map(({ key, label, weight }) => {
            const item = breakdown[key];
            const showMaxPoints = item.maxPoints !== undefined;

            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {variant === 'badge' ? (
                    <Badge className={`${PRIORITY_BADGE_COLORS[key]} text-xs px-2 py-1`}>
                      {label}
                    </Badge>
                  ) : (
                    <Button variant={key} size="sm" disabled>
                      {label}
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {item.count}/{totalCounts?.[key] || item.count} rules
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {showMaxPoints
                    ? `${Math.round(item.points)}/${Math.round(item.maxPoints!)}pts`
                    : `${Math.round(item.points)}pts`
                  }
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