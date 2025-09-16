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

export type Preset = {
  id: string;
  name: string;
  description: string;
  enabledRuleIds: string[];
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

export function computeScore(spec: Spec, enabled: Set<string>): ScoreResult {
  const w = spec.priority_weights;

  // Calculate max possible score
  const maxScore = spec.rules.reduce(
    (acc, r) => acc + (w[r.priority] * (r.max_points ?? 1)),
    0
  );

  // Calculate current raw score
  const raw = spec.rules.reduce(
    (acc, r) => acc + (enabled.has(r.id) ? w[r.priority] * (r.max_points ?? 1) : 0),
    0
  );

  // Calculate final score (0-100)
  const total = maxScore === 0 ? 0 : Math.round((100 * raw) / maxScore);

  // Calculate magnitude (contribution) per rule
  const magnitudes = new Map<string, number>();
  for (const r of spec.rules) {
    const pts = w[r.priority] * (r.max_points ?? 1);
    magnitudes.set(r.id, maxScore === 0 ? 0 : (100 * pts) / maxScore);
  }

  // Calculate breakdown by priority
  const breakdown = {
    critical: { enabled: 0, total: 0, points: 0 },
    important: { enabled: 0, total: 0, points: 0 },
    normal: { enabled: 0, total: 0, points: 0 },
    low: { enabled: 0, total: 0, points: 0 }
  };

  for (const rule of spec.rules) {
    const priority = rule.priority;
    const rulePoints = w[priority] * (rule.max_points ?? 1);

    breakdown[priority].total += 1;
    if (enabled.has(rule.id)) {
      breakdown[priority].enabled += 1;
      breakdown[priority].points += rulePoints;
    }
  }

  return { total, raw, maxScore, magnitudes, breakdown };
}

export function getRulesBySignal(rules: Rule[]) {
  const signals = {
    traces: rules.filter(r => r.signal === "traces"),
    metrics: rules.filter(r => r.signal === "metrics"),
    logs: rules.filter(r => r.signal === "logs")
  };
  return signals;
}

export function getRulesByGroup(rules: Rule[]) {
  const groups = new Map<string, Rule[]>();

  for (const rule of rules) {
    if (!groups.has(rule.group)) {
      groups.set(rule.group, []);
    }
    groups.get(rule.group)!.push(rule);
  }

  return groups;
}

export function getTopImpactDisabledRules(
  rules: Rule[],
  enabled: Set<string>,
  magnitudes: Map<string, number>,
  limit: number = 3
): Rule[] {
  return rules
    .filter(rule => !enabled.has(rule.id))
    .sort((a, b) => (magnitudes.get(b.id) || 0) - (magnitudes.get(a.id) || 0))
    .slice(0, limit);
}