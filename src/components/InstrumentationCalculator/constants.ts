/**
 * UI constants for the InstrumentationCalculator component
 *
 * Includes colors, sorting, and display configuration for priorities and signals.
 * These are UI-only concerns - the scoring engine has its own business logic.
 */

import type { Priority } from '@/lib/scoring-engine/types';

/**
 * Signal types for instrumentation rules
 */
export type Signal = 'resources' | 'spans' | 'metrics' | 'logs' | 'sdk';

/**
 * Priority order for sorting (lower number = higher priority)
 */
export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  important: 1,
  normal: 2,
  low: 3,
} as const;

/**
 * Priority weights for display purposes
 * Note: These are for UI display only. The scoring engine gets weights from the spec.
 */
export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 40,
  important: 30,
  normal: 20,
  low: 10,
} as const;

/**
 * Priority colors for buttons and interactive elements
 * Format: Tailwind CSS classes for background and hover states
 */
export const PRIORITY_BUTTON_COLORS: Record<Priority, string> = {
  critical: 'bg-critical hover:bg-critical/90',
  important: 'bg-important hover:bg-important/90',
  normal: 'bg-normal hover:bg-normal/90',
  low: 'bg-low hover:bg-low/90',
} as const;

/**
 * Priority colors for badges with text and border
 * Format: Tailwind CSS classes for background, text, and border
 */
export const PRIORITY_BADGE_COLORS: Record<Priority, string> = {
  critical: 'bg-critical text-critical-foreground border border-black/60',
  important: 'bg-important text-important-foreground border border-black/60',
  normal: 'bg-normal text-normal-foreground border border-black/60',
  low: 'bg-low text-low-foreground border border-black/60',
} as const;

/**
 * Signal colors for badges
 * Format: Tailwind CSS classes
 */
export const SIGNAL_COLORS: Record<Signal, string> = {
  resources: 'bg-blue-500 text-white',
  spans: 'bg-purple-500 text-white',
  metrics: 'bg-green-500 text-white',
  logs: 'bg-yellow-500 text-black',
  sdk: 'bg-orange-500 text-white',
} as const;

/**
 * Maximum possible score
 */
export const MAX_SCORE = 100;

/**
 * Score category thresholds and labels
 */
export const SCORE_CATEGORIES = [
  { min: 90, label: 'Excellent', color: 'text-normal' },
  { min: 75, label: 'Good', color: 'text-primary' },
  { min: 50, label: 'Needs Improvement', color: 'text-important' },
  { min: 0, label: 'Poor', color: 'text-critical' },
] as const;

/**
 * Helper function to get score category based on score value
 */
export function getScoreCategory(score: number): { label: string; color: string } {
  const category = SCORE_CATEGORIES.find(cat => score >= cat.min);
  return category || SCORE_CATEGORIES[SCORE_CATEGORIES.length - 1];
}
