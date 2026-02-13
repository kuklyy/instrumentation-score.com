import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { Rule, Priority } from '@/lib/scoring-engine/types';
import { RuleDetailsDialog } from './RuleDetailsDialog';
import { PRIORITY_BUTTON_COLORS } from './constants';
import { useFilteredAndSortedRules, groupRulesBy, type SortOption, type SortOrder } from './hooks/useFilteredAndSortedRules';
import { useInstrumentationSpec } from './hooks/useInstrumentationSpec';
import { useRuleState } from './hooks/useRuleState';
import { RuleListItem } from './RuleListItem';
import { FilterTabs } from './FilterTabs';

interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  rulesEnabled: number;
  totalRules: number;
}

interface PriorityBreakdownProps {
  breakdown: {
    critical: { count: number; points: number };
    important: { count: number; points: number };
    normal: { count: number; points: number };
    low: { count: number; points: number };
  };
  totalCounts: {
    critical: number;
    important: number;
    normal: number;
    low: number;
  };
}

interface InstrumentationCalculatorProps {
  // Optional props for customization
  className?: string;
  showScoreDisplay?: boolean;
  showPriorityBreakdown?: boolean;
  title?: string;
  description?: string;
  // Optional external components
  ScoreDisplayComponent?: React.ComponentType<ScoreDisplayProps>;
  PriorityBreakdownComponent?: React.ComponentType<PriorityBreakdownProps>;
}

export function InstrumentationCalculator({
  className = "",
  showScoreDisplay = true,
  showPriorityBreakdown = true,
  title = "Score Calculator",
  description = "Interactive tool to calculate your instrumentation score",
  ScoreDisplayComponent,
  PriorityBreakdownComponent
}: InstrumentationCalculatorProps) {
  // Load specification and create calculator
  const { calculator, loading, error, retry } = useInstrumentationSpec();

  // Manage rule state and scoring
  const { enabledRules, scoreResult, toggleRule } = useRuleState(calculator);

  // UI state
  const [activeFilter, setActiveFilter] = useState<Priority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<"all" | "resources" | "spans" | "metrics" | "logs" | "sdk">("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Modal state for rule details
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get all rules from calculator
  const rules: Rule[] = useMemo(() => {
    if (!calculator) return [];
    return calculator.getAllRules();
  }, [calculator]);

  // Calculate scores and stats
  const stats = useMemo(() => {
    if (!calculator || !scoreResult) return {
      totalScore: 0,
      maxPossibleScore: 100,
      enabledRules: 0,
      totalRules: 0,
      priorityBreakdown: {
        critical: { count: 0, points: 0, maxPoints: 0 },
        important: { count: 0, points: 0, maxPoints: 0 },
        normal: { count: 0, points: 0, maxPoints: 0 },
        low: { count: 0, points: 0, maxPoints: 0 },
      },
      ruleCounts: { all: 0, critical: 0, important: 0, normal: 0, low: 0 },
      magnitudes: new Map(),
    };

    const enabledRulesList = rules.filter(rule => enabledRules.has(rule.id));

    const priorityBreakdown = {
      critical: { count: 0, points: 0, maxPoints: 0 },
      important: { count: 0, points: 0, maxPoints: 0 },
      normal: { count: 0, points: 0, maxPoints: 0 },
      low: { count: 0, points: 0, maxPoints: 0 },
    };

    // First pass: calculate max points for each priority
    calculator.getAllRules().forEach(specRule => {
      const maxContribution = scoreResult.magnitudes.get(specRule.id) || 0;
      priorityBreakdown[specRule.priority].maxPoints += maxContribution;
    });

    // Second pass: calculate current points for enabled rules
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
      magnitudes: scoreResult.magnitudes,
    };
  }, [rules, calculator, enabledRules, scoreResult]);

  // Filter and sort rules using custom hook
  const filteredRules = useFilteredAndSortedRules(rules, {
    searchQuery,
    priorityFilter: activeFilter,
    signalFilter,
    sortBy,
    sortOrder,
    searchFields: ['rationale', 'group', 'id']
  });

  // Group filtered rules by group
  const rulesByGroup = useMemo(
    () => groupRulesBy(filteredRules, 'group'),
    [filteredRules]
  );

  // Early returns after all hooks are defined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading specification from repository...</p>
        </div>
      </div>
    );
  }

  if (error || !calculator) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading specification</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            onClick={retry}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleShowRuleDetails = (rule: Rule) => {
    setSelectedRule(rule);
    setIsDialogOpen(true);
  };



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Score and Breakdown (if enabled and components provided) */}
      <div className="grid lg:grid-cols-4 gap-6">
        {(showScoreDisplay || showPriorityBreakdown) && (ScoreDisplayComponent || PriorityBreakdownComponent) && (
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start">
            {showScoreDisplay && ScoreDisplayComponent && (
              <ScoreDisplayComponent
                score={stats.totalScore}
                maxScore={stats.maxPossibleScore}
                rulesEnabled={stats.enabledRules}
                totalRules={stats.totalRules}
              />
            )}
            {showPriorityBreakdown && PriorityBreakdownComponent && (
              <PriorityBreakdownComponent
                breakdown={stats.priorityBreakdown}
                totalCounts={{
                  critical: stats.ruleCounts.critical,
                  important: stats.ruleCounts.important,
                  normal: stats.ruleCounts.normal,
                  low: stats.ruleCounts.low
                }}
              />
            )}
          </div>
        )}

        {/* Rules Section */}
        <div className={`${
          (showScoreDisplay || showPriorityBreakdown) && (ScoreDisplayComponent || PriorityBreakdownComponent)
            ? "lg:col-span-3"
            : "lg:col-span-4"
        }`}>
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 space-y-6">
              {/* Filters */}
              <div className="space-y-4">
                {/* First Row: Search and Signal Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Signal:</span>
                    <Select value={signalFilter} onValueChange={(value: "all" | "resources" | "spans" | "metrics" | "logs" | "sdk") => setSignalFilter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="resources">Resources</SelectItem>
                        <SelectItem value="spans">Spans</SelectItem>
                        <SelectItem value="metrics">Metrics</SelectItem>
                        <SelectItem value="logs">Logs</SelectItem>
                        <SelectItem value="sdk">SDK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Second Row: Priority Filter and Sorting */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <FilterTabs
                      activeFilter={activeFilter}
                      setActiveFilter={setActiveFilter}
                      ruleCounts={stats.ruleCounts}
                      priorityColors={PRIORITY_BUTTON_COLORS}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Sort:</span>
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="p-2"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="ml-1 text-xs">{sortOrder.toUpperCase()}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rules by Group */}
              <div className="space-y-6">
                {Object.entries(rulesByGroup).map(([group, groupRules]) => (
                  <div key={group} className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {group} ({groupRules.length})
                    </h3>
                    <div className="space-y-3">
                      {groupRules.map(rule => {
                        const isEnabled = enabledRules.has(rule.id);
                        const impact = stats.magnitudes.get(rule.id) || 0;
                        return (
                          <RuleListItem
                            key={rule.id}
                            rule={{ ...rule, enabled: isEnabled }}
                            onToggle={toggleRule}
                            onShowDetails={handleShowRuleDetails}
                            impact={impact}
                            metadata={{
                              category: rule.group,
                              ruleCode: rule.id,
                              description: rule.rationale,
                              specUrl: rule.specUrl
                            }}
                            variant="card"
                            priorityColors={PRIORITY_BUTTON_COLORS}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {filteredRules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No rules found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rule Details Dialog */}
      <RuleDetailsDialog
        rule={selectedRule}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}