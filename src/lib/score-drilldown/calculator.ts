import { Rule, Priority, ScoreResult, DrilldownResult, Spec } from './types';
import officialSpec from './official-spec.json';

export class InstrumentationScoreCalculator {
  private spec: Spec;
  private enabledRules: Set<string>;

  constructor(customSpec?: Spec) {
    // Use official spec by default, or allow custom spec
    this.spec = customSpec || (officialSpec as Spec);
    // Start with all rules enabled by default
    this.enabledRules = new Set(this.spec.rules.map(r => r.id));
  }

  /**
   * Get all available rules from the loaded spec
   */
  getAllRules(): Rule[] {
    return [...this.spec.rules];
  }

  /**
   * Get currently enabled rules
   */
  getEnabledRules(): Rule[] {
    return this.spec.rules.filter(rule => this.enabledRules.has(rule.id));
  }

  /**
   * Get currently disabled rules
   */
  getDisabledRules(): Rule[] {
    return this.spec.rules.filter(rule => !this.enabledRules.has(rule.id));
  }

  /**
   * Enable a specific rule by ID
   */
  enableRule(ruleId: string): boolean {
    if (this.spec.rules.some(r => r.id === ruleId)) {
      this.enabledRules.add(ruleId);
      return true;
    }
    return false;
  }

  /**
   * Disable a specific rule by ID
   */
  disableRule(ruleId: string): boolean {
    if (this.spec.rules.some(r => r.id === ruleId)) {
      this.enabledRules.delete(ruleId);
      return true;
    }
    return false;
  }

  /**
   * Set multiple rules as enabled/disabled
   * @param ruleStates Object mapping rule IDs to boolean enabled state
   */
  setRuleStates(ruleStates: Record<string, boolean>): void {
    for (const [ruleId, enabled] of Object.entries(ruleStates)) {
      if (enabled) {
        this.enableRule(ruleId);
      } else {
        this.disableRule(ruleId);
      }
    }
  }

  /**
   * Enable all rules
   */
  enableAllRules(): void {
    this.enabledRules = new Set(this.spec.rules.map(r => r.id));
  }

  /**
   * Disable all rules
   */
  disableAllRules(): void {
    this.enabledRules.clear();
  }

  /**
   * Check if a rule is enabled
   */
  isRuleEnabled(ruleId: string): boolean {
    return this.enabledRules.has(ruleId);
  }

  /**
   * Calculate the instrumentation score based on currently enabled rules
   * This follows the official formula from the spec:
   * Score = (Σ(Pi × Wi) / Σ(Ti × Wi)) × 100
   */
  calculateScore(): ScoreResult {
    const w = this.spec.priority_weights;
    const enabledRuleIds = this.enabledRules;

    // Calculate max possible score (sum of all rule weights)
    const maxScore = this.spec.rules.reduce(
      (acc, r) => acc + (w[r.priority] * (r.max_points || 1)),
      0
    );

    // Calculate current raw score (sum of enabled rule weights)
    const raw = this.spec.rules.reduce(
      (acc, r) => acc + (enabledRuleIds.has(r.id) ? w[r.priority] * (r.max_points || 1) : 0),
      0
    );

    // Calculate final score (0-100)
    const total = maxScore === 0 ? 0 : Math.round((100 * raw) / maxScore);

    // Calculate magnitude (contribution) per rule
    const magnitudes = new Map<string, number>();
    for (const r of this.spec.rules) {
      const pts = w[r.priority] * (r.max_points || 1);
      magnitudes.set(r.id, maxScore === 0 ? 0 : (100 * pts) / maxScore);
    }

    // Calculate breakdown by priority
    const breakdown = {
      critical: { enabled: 0, total: 0, points: 0 },
      important: { enabled: 0, total: 0, points: 0 },
      normal: { enabled: 0, total: 0, points: 0 },
      low: { enabled: 0, total: 0, points: 0 }
    };

    for (const rule of this.spec.rules) {
      const priority = rule.priority;
      const rulePoints = w[priority] * (rule.max_points || 1);

      breakdown[priority].total += 1;
      if (enabledRuleIds.has(rule.id)) {
        breakdown[priority].enabled += 1;
        breakdown[priority].points += rulePoints;
      }
    }

    return { total, raw, maxScore, magnitudes, breakdown };
  }

  /**
   * Get rules grouped by signal type
   */
  getRulesBySignal(): { traces: Rule[]; metrics: Rule[]; logs: Rule[] } {
    const signals = {
      traces: this.spec.rules.filter(r => r.signal === "traces"),
      metrics: this.spec.rules.filter(r => r.signal === "metrics"),
      logs: this.spec.rules.filter(r => r.signal === "logs")
    };
    return signals;
  }

  /**
   * Get rules grouped by their group attribute
   */
  getRulesByGroup(): Map<string, Rule[]> {
    const groups = new Map<string, Rule[]>();

    for (const rule of this.spec.rules) {
      if (!groups.has(rule.group)) {
        groups.set(rule.group, []);
      }
      groups.get(rule.group)!.push(rule);
    }

    return groups;
  }

  /**
   * Get top impact disabled rules (highest contribution rules that are not enabled)
   */
  getTopImpactDisabledRules(limit: number = 3): Rule[] {
    const scoreResult = this.calculateScore();
    const magnitudes = scoreResult.magnitudes;

    return this.spec.rules
      .filter(rule => !this.enabledRules.has(rule.id))
      .sort((a, b) => (magnitudes.get(b.id) || 0) - (magnitudes.get(a.id) || 0))
      .slice(0, limit);
  }

  /**
   * Get complete instrumentation score drilldown with all details
   */
  getScoreDrilldown(): DrilldownResult {
    const score = this.calculateScore();
    const rulesBySignal = this.getRulesBySignal();
    const rulesByGroup = this.getRulesByGroup();
    const topImpactDisabledRules = this.getTopImpactDisabledRules();
    const enabledRules = this.getEnabledRules();
    const disabledRules = this.getDisabledRules();

    return {
      score,
      rulesBySignal,
      rulesByGroup,
      topImpactDisabledRules,
      enabledRules,
      disabledRules
    };
  }

  /**
   * Get the loaded specification details
   */
  getSpecInfo(): { version: string; totalRules: number; priorityWeights: Record<Priority, number> } {
    return {
      version: this.spec.version,
      totalRules: this.spec.rules.length,
      priorityWeights: this.spec.priority_weights
    };
  }
}