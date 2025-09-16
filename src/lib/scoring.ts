// Re-export types and functions from the new library
export type {
  Priority,
  Rule,
  Spec,
  ScoreResult,
  DrilldownResult
} from './score-drilldown';

export { InstrumentationScoreCalculator } from './score-drilldown';

// Legacy compatibility functions - wrap the new calculator
import { InstrumentationScoreCalculator } from './score-drilldown';
import type { Spec, Rule, ScoreResult } from './score-drilldown';

export type Preset = {
  id: string;
  name: string;
  description: string;
  enabledRuleIds: string[];
};

export function computeScore(spec: Spec, enabled: Set<string>): ScoreResult {
  const calculator = new InstrumentationScoreCalculator(spec);

  // Set the enabled rules
  calculator.disableAllRules();
  enabled.forEach(ruleId => calculator.enableRule(ruleId));

  return calculator.calculateScore();
}

export function getRulesBySignal(rules: Rule[]) {
  const calculator = new InstrumentationScoreCalculator();
  return calculator.getRulesBySignal();
}

export function getRulesByGroup(rules: Rule[]) {
  const calculator = new InstrumentationScoreCalculator();
  return calculator.getRulesByGroup();
}

export function getTopImpactDisabledRules(
  rules: Rule[],
  enabled: Set<string>,
  magnitudes: Map<string, number>,
  limit: number = 3
): Rule[] {
  const calculator = new InstrumentationScoreCalculator();

  // Set the enabled rules
  calculator.disableAllRules();
  enabled.forEach(ruleId => calculator.enableRule(ruleId));

  return calculator.getTopImpactDisabledRules(limit);
}