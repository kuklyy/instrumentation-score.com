import { useState, useEffect, useMemo } from 'react';
import type { InstrumentationScoreCalculator } from '@/lib/scoring-engine/calculator';
import type { ScoreResult } from '@/lib/scoring-engine/types';

export interface UseRuleStateResult {
  enabledRules: Set<string>;
  scoreResult: ScoreResult | null;
  toggleRule: (ruleId: string) => void;
  enableAll: () => void;
  disableAll: () => void;
  setEnabledRules: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Custom hook to manage rule enabled/disabled state and calculate scores
 *
 * Manages which rules are enabled, keeps calculator in sync, and provides
 * the latest score calculation results.
 *
 * @param calculator - The instrumentation score calculator instance
 * @param initialEnabled - Optional set of initially enabled rule IDs
 * @returns Object containing enabled rules state, score result, and control functions
 *
 * @example
 * ```tsx
 * const { calculator } = useInstrumentationSpec();
 * const {
 *   enabledRules,
 *   scoreResult,
 *   toggleRule,
 *   enableAll,
 *   disableAll
 * } = useRuleState(calculator);
 *
 * // Toggle a specific rule
 * <button onClick={() => toggleRule('RES-001')}>Toggle Rule</button>
 *
 * // Enable/disable all rules
 * <button onClick={enableAll}>Enable All</button>
 * <button onClick={disableAll}>Disable All</button>
 * ```
 */
export function useRuleState(
  calculator: InstrumentationScoreCalculator | null,
  initialEnabled?: Set<string>
): UseRuleStateResult {
  const [enabledRules, setEnabledRules] = useState<Set<string>>(
    initialEnabled || new Set()
  );

  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  // Initialize enabled rules when calculator loads (if not provided via initialEnabled)
  useEffect(() => {
    if (!calculator || initialEnabled) return;

    const allRuleIds = new Set(calculator.getAllRules().map(r => r.id));
    setEnabledRules(allRuleIds);
  }, [calculator, initialEnabled]);

  // Update calculator state and recalculate score when enabled rules change
  useEffect(() => {
    if (!calculator) return;

    // Set all rules to violated first
    calculator.setAllRulesViolated();

    // Then satisfy only the enabled rules
    enabledRules.forEach(ruleId => {
      calculator.setRuleSatisfied(ruleId);
    });

    // Calculate and store the new score
    const result = calculator.calculateScore();
    setScoreResult(result);
  }, [calculator, enabledRules]);

  const toggleRule = (ruleId: string) => {
    setEnabledRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  };

  const enableAll = () => {
    if (!calculator) return;
    const allRuleIds = new Set(calculator.getAllRules().map(r => r.id));
    setEnabledRules(allRuleIds);
  };

  const disableAll = () => {
    setEnabledRules(new Set());
  };

  return {
    enabledRules,
    scoreResult,
    toggleRule,
    enableAll,
    disableAll,
    setEnabledRules
  };
}
