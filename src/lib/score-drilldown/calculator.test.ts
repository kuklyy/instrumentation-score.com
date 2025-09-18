import { describe, it, expect } from 'vitest';
import { InstrumentationScoreCalculator } from './calculator';

describe('InstrumentationScoreCalculator', () => {
  it('should calculate score in 10-100 range', () => {
    const calculator = new InstrumentationScoreCalculator();

    // Test with all rules satisfied (should be 100)
    calculator.setAllRulesSatisfied();
    const allSatisfied = calculator.calculateScore();
    expect(allSatisfied.total).toBe(100);

    // Test with no rules satisfied (should be 10)
    calculator.setAllRulesViolated();
    const noneSatisfied = calculator.calculateScore();
    expect(noneSatisfied.total).toBe(10);

    // Test with partial rules satisfied
    const allRules = calculator.getAllRules();
    const halfCount = Math.floor(allRules.length / 2);
    calculator.setAllRulesViolated();
    for (let i = 0; i < halfCount; i++) {
      calculator.setRuleSatisfied(allRules[i].id);
    }
    const partialSatisfied = calculator.calculateScore();
    expect(partialSatisfied.total).toBeGreaterThanOrEqual(10);
    expect(partialSatisfied.total).toBeLessThanOrEqual(100);
  });

  it('should maintain score range boundaries', () => {
    const calculator = new InstrumentationScoreCalculator();

    // Minimum boundary
    calculator.setAllRulesViolated();
    const minScore = calculator.calculateScore();
    expect(minScore.total).toBe(10);

    // Maximum boundary
    calculator.setAllRulesSatisfied();
    const maxScore = calculator.calculateScore();
    expect(maxScore.total).toBe(100);
  });
});