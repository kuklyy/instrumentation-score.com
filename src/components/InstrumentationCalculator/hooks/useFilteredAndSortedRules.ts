import { useMemo } from 'react';
import { PRIORITY_ORDER } from '../constants';
import type { Priority } from '@/lib/scoring-engine/types';

/**
 * Generic rule interface that can work with Rule types
 */
export interface FilterableRule {
  id: string;
  name: string;
  priority: Priority;
  signal: 'resources' | 'spans' | 'metrics' | 'logs' | 'sdk';
  group?: string;
  rationale?: string;
  [key: string]: string | number | boolean | undefined;
}

export type SortOption = 'priority' | 'name' | 'group' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  searchQuery?: string;
  priorityFilter?: Priority | 'all';
  signalFilter?: 'all' | 'resources' | 'spans' | 'metrics' | 'logs' | 'sdk';
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  /**
   * Additional search fields to include beyond name
   * Default: ['description', 'group', 'category']
   */
  searchFields?: string[];
}

/**
 * Custom hook to filter and sort rules based on various criteria
 *
 * @param rules - Array of rules to filter and sort
 * @param options - Filter and sort options
 * @returns Filtered and sorted array of rules
 *
 * @example
 * ```tsx
 * const filteredRules = useFilteredAndSortedRules(allRules, {
 *   searchQuery: 'service.name',
 *   priorityFilter: 'critical',
 *   signalFilter: 'resources',
 *   sortBy: 'priority',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export function useFilteredAndSortedRules<T extends FilterableRule>(
  rules: T[],
  options: FilterOptions = {}
): T[] {
  const {
    searchQuery = '',
    priorityFilter = 'all',
    signalFilter = 'all',
    sortBy = 'priority',
    sortOrder = 'asc',
    searchFields = ['description', 'group', 'category', 'rationale']
  } = options;

  return useMemo(() => {
    // Filter rules
    const filtered = rules.filter(rule => {
      // Search filter - check name and additional fields
      const matchesSearch = searchQuery === "" || (() => {
        const query = searchQuery.toLowerCase();

        // Always check name and id
        if (rule.name.toLowerCase().includes(query) ||
            rule.id.toLowerCase().includes(query)) {
          return true;
        }

        // Check additional search fields if they exist
        return searchFields.some(field => {
          const value = rule[field as keyof typeof rule];
          return value && typeof value === 'string' &&
                 value.toLowerCase().includes(query);
        });
      })();

      // Priority filter
      const matchesPriority = priorityFilter === 'all' ||
                              rule.priority === priorityFilter;

      // Signal filter
      const matchesSignal = signalFilter === 'all' ||
                           rule.signal === signalFilter;

      return matchesSearch && matchesPriority && matchesSignal;
    });

    // Sort the filtered rules
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
        case 'group': {
          // Support both 'category' and 'group' field names
          const aValue = String(a.group || '');
          const bValue = String(b.group || '');
          comparison = aValue.localeCompare(bValue);
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [rules, searchQuery, priorityFilter, signalFilter, sortBy, sortOrder, searchFields]);
}

/**
 * Helper function to group rules by a specific field
 *
 * @param rules - Array of rules to group
 * @param groupBy - Field name to group by (e.g., 'group', 'signal', 'priority')
 * @returns Object with grouped rules
 *
 * @example
 * ```tsx
 * const byGroup = groupRulesBy(rules, 'group');
 * const bySignal = groupRulesBy(rules, 'signal');
 * ```
 */
export function groupRulesBy<T extends FilterableRule>(
  rules: T[],
  groupBy: keyof T
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const rule of rules) {
    const key = String(rule[groupBy] || 'unknown');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(rule);
  }

  return groups;
}
