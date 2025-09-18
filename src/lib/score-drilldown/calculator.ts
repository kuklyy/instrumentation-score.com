import { Rule, Priority, ScoreResult, DrilldownResult, Spec } from './types';
import officialSpec from './official-spec.json';

export class InstrumentationScoreCalculator {
  private spec: Spec;
  private satisfiedRules: Set<string>;

  constructor(customSpec?: Spec) {
    // Use official spec by default, or allow custom spec
    this.spec = customSpec || (officialSpec as Spec);
    // Start with all rules satisfied by default
    this.satisfiedRules = new Set(this.spec.rules.map(r => r.id));
  }

  /**
   * Get all available rules from the loaded spec
   */
  getAllRules(): Rule[] {
    return [...this.spec.rules];
  }

  /**
   * Get currently satisfied rules
   */
  getSatisfiedRules(): Rule[] {
    return this.spec.rules.filter(rule => this.satisfiedRules.has(rule.id));
  }

  /**
   * Get currently violated rules
   */
  getViolatedRules(): Rule[] {
    return this.spec.rules.filter(rule => !this.satisfiedRules.has(rule.id));
  }

  /**
   * Mark a specific rule as satisfied by ID
   */
  setRuleSatisfied(ruleId: string): boolean {
    if (this.spec.rules.some(r => r.id === ruleId)) {
      this.satisfiedRules.add(ruleId);
      return true;
    }
    return false;
  }

  /**
   * Mark a specific rule as violated by ID
   */
  setRuleViolated(ruleId: string): boolean {
    if (this.spec.rules.some(r => r.id === ruleId)) {
      this.satisfiedRules.delete(ruleId);
      return true;
    }
    return false;
  }

  /**
   * Set multiple rules as satisfied/violated
   * @param ruleStates Object mapping rule IDs to boolean satisfied state
   */
  setRuleStates(ruleStates: Record<string, boolean>): void {
    for (const [ruleId, satisfied] of Object.entries(ruleStates)) {
      if (satisfied) {
        this.setRuleSatisfied(ruleId);
      } else {
        this.setRuleViolated(ruleId);
      }
    }
  }

  /**
   * Mark all rules as satisfied
   */
  setAllRulesSatisfied(): void {
    this.satisfiedRules = new Set(this.spec.rules.map(r => r.id));
  }

  /**
   * Mark all rules as violated
   */
  setAllRulesViolated(): void {
    this.satisfiedRules.clear();
  }

  /**
   * Check if a rule is satisfied
   */
  isRuleSatisfied(ruleId: string): boolean {
    return this.satisfiedRules.has(ruleId);
  }

  /**
   * Calculate the instrumentation score based on currently satisfied rules
   * This follows the official formula from the spec:
   * Score = (Σ(Pi × Wi) / Σ(Ti × Wi)) × 90 + 10
   * Range is 10-100 as per official specification
   */
  calculateScore(): ScoreResult {
    const w = this.spec.priorityWeights;
    const satisfiedRuleIds = this.satisfiedRules;

    // Calculate max possible score (sum of all rule weights)
    const maxScore = this.spec.rules.reduce(
      (acc, r) => acc + (w[r.priority] * (r.maxPoints || 1)),
      0
    );

    // Calculate current raw score (sum of satisfied rule weights)
    const raw = this.spec.rules.reduce(
      (acc, r) => acc + (satisfiedRuleIds.has(r.id) ? w[r.priority] * (r.maxPoints || 1) : 0),
      0
    );

    // Calculate final score (10-100 range as per spec)
    // Formula: (percentage * 90) + 10 to map 0-100% to 10-100 score
    const percentage = maxScore === 0 ? 0 : raw / maxScore;
    const total = Math.round((percentage * 90) + 10);

    // Calculate magnitude (contribution) per rule
    const magnitudes = new Map<string, number>();
    for (const r of this.spec.rules) {
      const pts = w[r.priority] * (r.maxPoints || 1);
      magnitudes.set(r.id, maxScore === 0 ? 0 : (90 * pts) / maxScore);
    }

    // Calculate breakdown by priority
    const breakdown = {
      critical: { satisfied: 0, total: 0, points: 0 },
      important: { satisfied: 0, total: 0, points: 0 },
      normal: { satisfied: 0, total: 0, points: 0 },
      low: { satisfied: 0, total: 0, points: 0 }
    };

    for (const rule of this.spec.rules) {
      const priority = rule.priority;
      const rulePoints = w[priority] * (rule.maxPoints || 1);

      breakdown[priority].total += 1;
      if (satisfiedRuleIds.has(rule.id)) {
        breakdown[priority].satisfied += 1;
        breakdown[priority].points += rulePoints;
      }
    }

    return { total, raw, maxScore, magnitudes, breakdown };
  }

  /**
   * Get rules grouped by signal type
   */
  getRulesBySignal(): { resources: Rule[]; spans: Rule[]; metrics: Rule[]; logs: Rule[]; sdk: Rule[] } {
    const signals = {
      resources: this.spec.rules.filter(r => r.signal === "resources"),
      spans: this.spec.rules.filter(r => r.signal === "spans"),
      metrics: this.spec.rules.filter(r => r.signal === "metrics"),
      logs: this.spec.rules.filter(r => r.signal === "logs"),
      sdk: this.spec.rules.filter(r => r.signal === "sdk")
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
   * Get top impact violated rules (highest contribution rules that are violated)
   */
  getTopImpactViolatedRules(limit: number = 3): Rule[] {
    const scoreResult = this.calculateScore();
    const magnitudes = scoreResult.magnitudes;

    return this.spec.rules
      .filter(rule => !this.satisfiedRules.has(rule.id))
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
    const topImpactViolatedRules = this.getTopImpactViolatedRules();
    const satisfiedRules = this.getSatisfiedRules();
    const violatedRules = this.getViolatedRules();

    return {
      score,
      rulesBySignal,
      rulesByGroup,
      topImpactViolatedRules,
      satisfiedRules,
      violatedRules
    };
  }

  /**
   * Get the loaded specification details
   */
  getSpecInfo(): { version: string; totalRules: number; priorityWeights: Record<Priority, number> } {
    return {
      version: this.spec.version,
      totalRules: this.spec.rules.length,
      priorityWeights: this.spec.priorityWeights
    };
  }
}