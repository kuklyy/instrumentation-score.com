import { describe, it, expect } from 'vitest';
import { InstrumentationScoreCalculator } from './calculator';

describe('InstrumentationScoreCalculator', () => {
  it('should calculate score in 10-100 range', () => {
    const calculator = new InstrumentationScoreCalculator();

    // Test with all rules enabled (should be 100)
    calculator.enableAllRules();
    const allEnabled = calculator.calculateScore();
    expect(allEnabled.total).toBe(100);

    // Test with no rules enabled (should be 10)
    calculator.disableAllRules();
    const noneEnabled = calculator.calculateScore();
    expect(noneEnabled.total).toBe(10);

    // Test with partial rules enabled
    const allRules = calculator.getAllRules();
    const halfCount = Math.floor(allRules.length / 2);
    calculator.disableAllRules();
    for (let i = 0; i < halfCount; i++) {
      calculator.enableRule(allRules[i].id);
    }
    const partialEnabled = calculator.calculateScore();
    expect(partialEnabled.total).toBeGreaterThanOrEqual(10);
    expect(partialEnabled.total).toBeLessThanOrEqual(100);
  });

  it('should maintain score range boundaries', () => {
    const calculator = new InstrumentationScoreCalculator();

    // Minimum boundary
    calculator.disableAllRules();
    const minScore = calculator.calculateScore();
    expect(minScore.total).toBe(10);

    // Maximum boundary
    calculator.enableAllRules();
    const maxScore = calculator.calculateScore();
    expect(maxScore.total).toBe(100);
  });
});