import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type ScoreResult, type Priority } from "@/lib/scoring";

interface ScoreCardProps {
  score: ScoreResult;
  enabledCount: number;
  totalCount: number;
  priorityWeights: Record<Priority, number>;
}

export function ScoreCard({ score, enabledCount, totalCount, priorityWeights }: ScoreCardProps) {
  const priorityColors = {
    critical: "bg-red-500",
    important: "bg-amber-500",
    normal: "bg-teal-500",
    low: "bg-slate-500"
  };


  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-white">Score</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <TrendingUp className="h-4 w-4" />
            vs spec default
          </div>
        </div>
        <CardDescription className="text-slate-300">
          Instrumentation Score
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Big Score Number */}
        <div className="text-center">
          <div className="text-6xl font-bold text-white mb-2">
            {score.total}
            <span className="text-3xl text-slate-400 ml-2">/ 100</span>
          </div>
          <div className="text-sm text-slate-400">
            with {enabledCount}/{totalCount} rules enabled
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress value={score.total} className="h-3 bg-slate-700" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0</span>
            <span>{score.total}%</span>
            <span>100</span>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Impact by Priority</h4>
          <div className="space-y-2">
            {Object.entries(score.breakdown).map(([priority, data]) => {
              const priorityKey = priority as Priority;

              return (
                <div key={priority} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${priorityColors[priorityKey]} text-white border-transparent text-xs px-2 py-0`}
                      >
                        {priority}
                      </Badge>
                      <span className="text-slate-400">
                        {data.enabled}/{data.total} rules
                      </span>
                    </div>
                    <span className="text-slate-300">
                      {Math.round(data.points)}pts
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${priorityColors[priorityKey]} transition-all duration-300`}
                      style={{ width: `${(data.points / score.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weight Legend */}
        <div className="space-y-2 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-medium text-slate-300">Priority Weights</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(priorityWeights).map(([priority, weight]) => (
              <div key={priority} className="flex justify-between">
                <span className="text-slate-400 capitalize">{priority}:</span>
                <span className="text-slate-300">×{weight}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}