import React from 'react';
import { Card } from '@/components/ui/card';

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  rulesEnabled: number;
  totalRules: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore,
  rulesEnabled,
  totalRules,
}) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const getScoreCategory = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-normal' };
    if (score >= 60) return { label: 'Good', color: 'text-primary' };
    if (score >= 40) return { label: 'Fair', color: 'text-important' };
    return { label: 'Poor', color: 'text-critical' };
  };

  const category = getScoreCategory(percentage);

  return (
    <Card className="bg-gradient-card border-border/50 shadow-strong p-8">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            Instrumentation Score
          </h2>
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-6xl font-bold text-foreground">{score}</span>
            <span className="text-2xl text-muted-foreground">/ {maxScore}</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-medium text-muted-foreground">
              {score.toFixed(1)} / {maxScore.toFixed(1)} points
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">0</span>
            <span className={`font-medium ${category.color}`}>
              {percentage}% - {category.label}
            </span>
            <span className="text-muted-foreground">100</span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          with {rulesEnabled}/{totalRules} rules enabled
        </div>
      </div>
    </Card>
  );
};