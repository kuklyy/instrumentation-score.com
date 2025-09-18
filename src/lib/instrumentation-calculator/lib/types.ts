export type Priority = "critical" | "important" | "normal" | "low";

export type Rule = {
  id: string;
  name: string;
  priority: Priority;
  signal: "traces" | "metrics" | "logs";
  group: string;
  max_points?: number;
  spec_url?: string;
  rationale?: string;
};

export type Spec = {
  version: string;
  priority_weights: Record<Priority, number>;
  rules: Rule[];
};

export type ScoreResult = {
  total: number;
  raw: number;
  maxScore: number;
  magnitudes: Map<string, number>;
  breakdown: {
    critical: { enabled: number; total: number; points: number };
    important: { enabled: number; total: number; points: number };
    normal: { enabled: number; total: number; points: number };
    low: { enabled: number; total: number; points: number };
  };
};

export type DrilldownResult = {
  score: ScoreResult;
  rulesBySignal: {
    traces: Rule[];
    metrics: Rule[];
    logs: Rule[];
  };
  rulesByGroup: Map<string, Rule[]>;
  topImpactDisabledRules: Rule[];
  enabledRules: Rule[];
  disabledRules: Rule[];
};