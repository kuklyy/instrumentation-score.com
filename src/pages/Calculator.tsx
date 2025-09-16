import React, { useState, useMemo } from 'react';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { PriorityBreakdown } from '@/components/PriorityBreakdown';
import { RuleItem } from '@/components/RuleItem';
import { FilterTabs } from '@/components/FilterTabs';
import { Card } from '@/components/ui/card';
import { sampleRules, Rule } from '@/data/sampleRules';

const Calculator = () => {
  const [rules, setRules] = useState<Rule[]>(sampleRules);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate scores and stats
  const stats = useMemo(() => {
    const enabledRules = rules.filter(rule => rule.enabled);
    const totalScore = enabledRules.reduce((sum, rule) => {
      const multiplier = {
        critical: 4,
        important: 2,
        normal: 1,
        low: 0.5
      }[rule.priority];
      return sum + (rule.impact * multiplier);
    }, 0);

    const maxPossibleScore = rules.reduce((sum, rule) => {
      const multiplier = {
        critical: 4,
        important: 2,
        normal: 1,
        low: 0.5
      }[rule.priority];
      return sum + (rule.impact * multiplier);
    }, 0);

    const priorityBreakdown = {
      critical: { count: 0, points: 0 },
      important: { count: 0, points: 0 },
      normal: { count: 0, points: 0 },
      low: { count: 0, points: 0 },
    };

    enabledRules.forEach(rule => {
      const multiplier = {
        critical: 4,
        important: 2,
        normal: 1,
        low: 0.5
      }[rule.priority];
      priorityBreakdown[rule.priority].count++;
      priorityBreakdown[rule.priority].points += rule.impact * multiplier;
    });

    const ruleCounts = {
      all: rules.length,
      critical: rules.filter(r => r.priority === 'critical').length,
      important: rules.filter(r => r.priority === 'important').length,
      normal: rules.filter(r => r.priority === 'normal').length,
      low: rules.filter(r => r.priority === 'low').length,
    };

    return {
      totalScore,
      maxPossibleScore,
      enabledRules: enabledRules.length,
      totalRules: rules.length,
      priorityBreakdown,
      ruleCounts,
    };
  }, [rules]);

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
        rule.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rules, activeFilter, searchQuery]);

  const handleRuleToggle = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  // Group filtered rules by category
  const rulesByCategory = useMemo(() => {
    const grouped: Record<string, Rule[]> = {};
    filteredRules.forEach(rule => {
      if (!grouped[rule.category]) {
        grouped[rule.category] = [];
      }
      grouped[rule.category].push(rule);
    });
    return grouped;
  }, [filteredRules]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Instrumentation{' '}
            <span className="text-primary">Score</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            A standardized, vendor-neutral metric for assessing OpenTelemetry instrumentation quality.
          </p>
          <p className="text-lg text-primary font-medium">
            From 0 to 100. Objective. Actionable. Community-driven.
          </p>
          <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
            Calculated using weighted scoring based on rule criticality against OpenTelemetry semantic
            conventions and community best practices.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Score & Breakdown */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start space-y-6">
            <ScoreDisplay
              score={Math.round(stats.totalScore)}
              maxScore={Math.round(stats.maxPossibleScore)}
              rulesEnabled={stats.enabledRules}
              totalRules={stats.totalRules}
            />
            <PriorityBreakdown data={stats.priorityBreakdown} />
          </div>

          {/* Main Content - Rules */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-border/50 shadow-strong p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-foreground">Score Calculator</h2>
                  <span className="text-sm text-muted-foreground">
                    Interactive tool to calculate your instrumentation score
                  </span>
                </div>
                <FilterTabs
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  ruleCounts={stats.ruleCounts}
                />
              </div>

              {/* Rules by Category */}
              <div className="space-y-8">
                {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {category} ({categoryRules.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {categoryRules.map(rule => (
                        <RuleItem
                          key={rule.id}
                          rule={rule}
                          onToggle={handleRuleToggle}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {filteredRules.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No rules found matching your current filters.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;