import React from 'react';
import { Card } from '@/components/ui/card';
import { getScoreCategory } from './constants';

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
  // Score is already in 0-100 range from calculator
  const instrumentationScore = score;
  const category = getScoreCategory(instrumentationScore);

  return (
    <Card className="bg-gradient-card border-border/50 shadow-strong p-8">
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-2">
            Instrumentation Score
          </h2>
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-6xl font-bold text-foreground">{instrumentationScore}</span>
            <span className="text-2xl text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">0</span>
            <span className={`font-medium ${category.color}`}>
              {category.label}
            </span>
            <span className="text-muted-foreground">100</span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${instrumentationScore}%` }}
            />
          </div>
        </div>

      </div>
    </Card>
  );
};