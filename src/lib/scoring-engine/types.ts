export type Priority = "critical" | "important" | "normal" | "low";

export type Rule = {
  id: string;
  name: string;
  priority: Priority;
  signal: "resources" | "spans" | "metrics" | "logs" | "sdk";
  group: string;
  maxPoints?: number;
  specUrl?: string;
  rationale?: string;
  markdownContent?: string;
  criteria?: string;
};

export type Spec = {
  version: string;
  priorityWeights: Record<Priority, number>;
  rules: Rule[];
};

export type ScoreResult = {
  total: number;
  raw: number;
  maxScore: number;
  magnitudes: Map<string, number>;
  breakdown: {
    critical: { satisfied: number; total: number; points: number };
    important: { satisfied: number; total: number; points: number };
    normal: { satisfied: number; total: number; points: number };
    low: { satisfied: number; total: number; points: number };
  };
};

export type DrilldownResult = {
  score: ScoreResult;
  rulesBySignal: {
    resources: Rule[];
    spans: Rule[];
    metrics: Rule[];
    logs: Rule[];
    sdk: Rule[];
  };
  rulesByGroup: Map<string, Rule[]>;
  topImpactViolatedRules: Rule[];
  satisfiedRules: Rule[];
  violatedRules: Rule[];
};