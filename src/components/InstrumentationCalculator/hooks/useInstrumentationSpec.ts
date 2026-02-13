import { useState, useEffect } from 'react';
import { InstrumentationScoreCalculator } from '@/lib/scoring-engine/calculator';
import { loadOfficialSpec } from '@/lib/scoring-engine/spec-parser';
import type { Spec } from '@/lib/scoring-engine/types';

export interface UseInstrumentationSpecResult {
  calculator: InstrumentationScoreCalculator | null;
  spec: Spec | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Custom hook to load and manage the instrumentation specification
 *
 * Fetches the official spec from the remote repository and creates a calculator instance.
 * Handles loading states, errors, and provides a retry mechanism.
 *
 * @returns Object containing calculator, spec, loading state, error, and retry function
 *
 * @example
 * ```tsx
 * const { calculator, loading, error, retry } = useInstrumentationSpec();
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={retry} />;
 * if (!calculator) return null;
 *
 * // Use calculator...
 * ```
 */
export function useInstrumentationSpec(): UseInstrumentationSpecResult {
  const [calculator, setCalculator] = useState<InstrumentationScoreCalculator | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadSpec = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedSpec = await loadOfficialSpec();
        const calc = new InstrumentationScoreCalculator(loadedSpec);

        setSpec(loadedSpec);
        setCalculator(calc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load specification');
        console.error('Error loading spec:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpec();
  }, [retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    calculator,
    spec,
    loading,
    error,
    retry
  };
}
