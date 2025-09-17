import React, { useState, useMemo } from 'react';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { PriorityBreakdown } from '@/components/PriorityBreakdown';
import { FilterTabs } from '@/components/FilterTabs';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';
import { InstrumentationScoreCalculator } from '@/lib/score-drilldown/calculator';
import type { Rule as SpecRule } from '@/lib/score-drilldown/types';

// Adapter interface to match the old design
interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'normal' | 'low';
  category: string;
  ruleCode: string;
  impact: number;
  enabled: boolean;
}

const Calculator = () => {
  const [calculator] = useState(() => new InstrumentationScoreCalculator());
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledRules, setEnabledRules] = useState(() => {
    const initialEnabled = new Set<string>();
    calculator.getAllRules().forEach(rule => {
      if (calculator.isRuleEnabled(rule.id)) {
        initialEnabled.add(rule.id);
      }
    });
    return initialEnabled;
  });

  const specInfo = calculator.getSpecInfo();

  // Convert spec rules to UI format
  const rules: Rule[] = useMemo(() => {
    // Calculate score to get magnitudes for impact display
    calculator.disableAllRules();
    enabledRules.forEach(ruleId => calculator.enableRule(ruleId));
    const scoreResult = calculator.calculateScore();

    return calculator.getAllRules().map((specRule: SpecRule) => ({
      id: specRule.id,
      name: specRule.name,
      description: specRule.rationale || specRule.criteria || 'No description available',
      priority: specRule.priority,
      category: specRule.group,
      ruleCode: specRule.id,
      impact: scoreResult.magnitudes.get(specRule.id) || 0,
      enabled: enabledRules.has(specRule.id)
    }));
  }, [calculator, specInfo, enabledRules]);

  // Calculate scores and stats
  const stats = useMemo(() => {
    // Update calculator state
    calculator.disableAllRules();
    enabledRules.forEach(ruleId => {
      calculator.enableRule(ruleId);
    });

    const scoreResult = calculator.calculateScore();
    const enabledRulesList = rules.filter(rule => rule.enabled);

    const priorityBreakdown = {
      critical: { count: 0, points: 0 },
      important: { count: 0, points: 0 },
      normal: { count: 0, points: 0 },
      low: { count: 0, points: 0 },
    };

    // Calculate breakdown using score contributions from magnitudes
    calculator.getAllRules().forEach(specRule => {
      if (enabledRules.has(specRule.id)) {
        const contribution = scoreResult.magnitudes.get(specRule.id) || 0;
        priorityBreakdown[specRule.priority].count++;
        priorityBreakdown[specRule.priority].points += contribution;
      }
    });

    const ruleCounts = {
      all: rules.length,
      critical: rules.filter(r => r.priority === 'critical').length,
      important: rules.filter(r => r.priority === 'important').length,
      normal: rules.filter(r => r.priority === 'normal').length,
      low: rules.filter(r => r.priority === 'low').length,
    };

    return {
      totalScore: scoreResult.total,
      maxPossibleScore: 100,
      enabledRules: enabledRulesList.length,
      totalRules: rules.length,
      priorityBreakdown,
      ruleCounts,
    };
  }, [rules, calculator, enabledRules]);

  // Filter rules based on active filter and search query
  const filteredRules = useMemo(() => {
    let filtered = rules;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(rule => rule.priority === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.category.toLowerCase().includes(query) ||
        rule.ruleCode.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rules, activeFilter, searchQuery]);

  const handleRuleToggle = (ruleId: string) => {
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

  // Group filtered rules by category
  const rulesByCategory = useMemo(() => {
    const groups: Record<string, Rule[]> = {};

    filteredRules.forEach(rule => {
      if (!groups[rule.category]) {
        groups[rule.category] = [];
      }
      groups[rule.category].push(rule);
    });

    return groups;
  }, [filteredRules]);

  const RuleItem = ({ rule }: { rule: Rule }) => {
    const priorityVariant = rule.priority as 'critical' | 'important' | 'normal' | 'low';

    return (
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 hover:border-border transition-colors">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-foreground">{rule.name}</h4>
            <span className="text-xs text-muted-foreground font-mono">
              {rule.ruleCode}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{rule.description}</p>

          <div className="flex items-center space-x-3">
            <Button variant={priorityVariant} size="sm" disabled>
              {rule.priority}
            </Button>
            <Button variant="secondary" size="sm" disabled>
              {rule.category}
            </Button>
            <span className="text-sm text-muted-foreground">—</span>
            <span className="text-sm font-medium text-foreground">
              {rule.impact.toFixed(1)}pts
            </span>
          </div>
        </div>

        <div className="ml-4">
          <Checkbox
            checked={rule.enabled}
            onCheckedChange={() => handleRuleToggle(rule.id)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Score and Breakdown - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <ScoreDisplay
                score={stats.totalScore}
                maxScore={stats.maxPossibleScore}
                rulesEnabled={stats.enabledRules}
                totalRules={stats.totalRules}
              />
              <PriorityBreakdown
                breakdown={stats.priorityBreakdown}
                totalCounts={{
                  critical: stats.ruleCounts.critical,
                  important: stats.ruleCounts.important,
                  normal: stats.ruleCounts.normal,
                  low: stats.ruleCounts.low
                }}
              />
            </div>
          </div>

          {/* Right Column - Rules */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border/50 shadow-strong">
              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Score Calculator</h2>
                  <p className="text-muted-foreground">
                    Interactive tool to calculate your instrumentation score
                  </p>
                </div>

                <FilterTabs
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  ruleCounts={stats.ruleCounts}
                />

                {/* Rules by Category */}
                <div className="space-y-6">
                  {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {category} ({categoryRules.length})
                      </h3>
                      <div className="space-y-3">
                        {categoryRules.map(rule => (
                          <RuleItem key={rule.id} rule={rule} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No rules found matching your criteria.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;