import { describe, it, expect } from 'vitest';
import { InstrumentationScoreCalculator } from './calculator';
import type { Spec } from './types';

// Mock spec for testing
const mockSpec: Spec = {
  version: '0.1.0',
  priorityWeights: {
    critical: 40,
    important: 30,
    normal: 20,
    low: 10
  },
  rules: [
    {
      id: 'TEST-001',
      name: 'Test Rule 1',
      priority: 'critical',
      signal: 'resources',
      group: 'test',
      rationale: 'Test rationale',
      criteria: 'Test criteria',
      maxPoints: 1
    },
    {
      id: 'TEST-002',
      name: 'Test Rule 2',
      priority: 'important',
      signal: 'spans',
      group: 'test',
      rationale: 'Test rationale',
      criteria: 'Test criteria',
      maxPoints: 1
    },
    {
      id: 'TEST-003',
      name: 'Test Rule 3',
      priority: 'normal',
      signal: 'metrics',
      group: 'test',
      rationale: 'Test rationale',
      criteria: 'Test criteria',
      maxPoints: 1
    },
    {
      id: 'TEST-004',
      name: 'Test Rule 4',
      priority: 'low',
      signal: 'logs',
      group: 'test',
      rationale: 'Test rationale',
      criteria: 'Test criteria',
      maxPoints: 1
    }
  ]
};

describe('InstrumentationScoreCalculator', () => {
  it('should calculate score in 0-100 range', () => {
    const calculator = new InstrumentationScoreCalculator(mockSpec);

    // Test with all rules satisfied (should be 100)
    calculator.setAllRulesSatisfied();
    const allSatisfied = calculator.calculateScore();
    expect(allSatisfied.total).toBe(100);

    // Test with no rules satisfied (should be 0)
    calculator.setAllRulesViolated();
    const noneSatisfied = calculator.calculateScore();
    expect(noneSatisfied.total).toBe(0);

    // Test with partial rules satisfied
    const allRules = calculator.getAllRules();
    const halfCount = Math.floor(allRules.length / 2);
    calculator.setAllRulesViolated();
    for (let i = 0; i < halfCount; i++) {
      calculator.setRuleSatisfied(allRules[i].id);
    }
    const partialSatisfied = calculator.calculateScore();
    expect(partialSatisfied.total).toBeGreaterThanOrEqual(0);
    expect(partialSatisfied.total).toBeLessThanOrEqual(100);
  });

  it('should maintain score range boundaries', () => {
    const calculator = new InstrumentationScoreCalculator(mockSpec);

    // Minimum boundary
    calculator.setAllRulesViolated();
    const minScore = calculator.calculateScore();
    expect(minScore.total).toBe(0);

    // Maximum boundary
    calculator.setAllRulesSatisfied();
    const maxScore = calculator.calculateScore();
    expect(maxScore.total).toBe(100);
  });
});