import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, X, ArrowUpDown, Info } from 'lucide-react';
import { InstrumentationScoreCalculator } from '../lib/calculator';
import { loadOfficialSpec } from '../../score-drilldown/spec-parser';
import type { Rule as SpecRule } from '../lib/types';
import { RuleDetailsDialog } from '@/components/RuleDetailsDialog';

interface FilterTabsProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  ruleCounts: Record<string, number>;
  priorityColors: Record<string, string>;
}

const FilterTabs = React.memo(({ activeFilter, setActiveFilter, ruleCounts, priorityColors }: FilterTabsProps) => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant={activeFilter === "all" ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveFilter("all")}
      className="text-xs"
    >
      All ({ruleCounts.all})
    </Button>
    {Object.keys(priorityColors).map((priority) => (
      <Button
        key={priority}
        variant={activeFilter === priority ? "default" : "outline"}
        size="sm"
        onClick={() => setActiveFilter(priority)}
        className={`text-xs ${
          activeFilter === priority
            ? priorityColors[priority as keyof typeof priorityColors]
            : "hover:bg-muted"
        }`}
      >
        {priority} ({ruleCounts[priority as keyof typeof ruleCounts]})
      </Button>
    ))}
  </div>
));

interface RuleItemProps {
  rule: Rule;
  priorityColors: Record<string, string>;
  onShowRuleDetails: (rule: SpecRule) => void;
}

const RuleItem = React.memo(({ rule, priorityColors, onShowRuleDetails }: RuleItemProps) => {
  return (
    <div
      className={`flex items-center justify-between p-4 bg-card rounded-lg border border-border/50 hover:border-border transition-all border-l-4 ${
        rule.enabled ? 'border-l-green-500' : 'border-l-red-500'
      }`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-3">
          <h4 className="font-medium text-foreground">{rule.name}</h4>
          <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
            {rule.ruleCode}
          </code>
        </div>

        <div className="flex items-center space-x-3">
          <Badge className={`${priorityColors[rule.priority]} text-white border-transparent text-xs px-2 py-1`}>
            {rule.priority}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {rule.category}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {rule.signal}
          </Badge>
          <span className="text-sm text-muted-foreground">—</span>
          <span className="text-sm font-medium text-foreground">
            {rule.impact.toFixed(1)}pts
          </span>
        </div>
      </div>

      <div className="ml-4 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground z-10 relative"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShowRuleDetails(rule.specRule);
          }}
          title="View rule details and description"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// Adapter interface for UI display
interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'normal' | 'low';
  category: string;
  signal: 'traces' | 'metrics' | 'logs';
  ruleCode: string;
  impact: number;
  enabled: boolean;
  specRule: SpecRule;
}

type SortOption = "priority" | "name" | "category";
type SortOrder = "asc" | "desc";

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
  const [calculator, setCalculator] = useState<InstrumentationScoreCalculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [signalFilter, setSignalFilter] = useState<"all" | "traces" | "metrics" | "logs">("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [enabledRules, setEnabledRules] = useState<Set<string>>(new Set());
  const [scoreResult, setScoreResult] = useState<any>(null);

  // Modal state for rule details
  const [selectedRule, setSelectedRule] = useState<SpecRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load spec from remote repository
  useEffect(() => {
    const loadSpec = async () => {
      try {
        setLoading(true);
        setError(null);
        const spec = await loadOfficialSpec();
        const calc = new InstrumentationScoreCalculator(spec);
        setCalculator(calc);

        // Initialize enabled rules
        const initialEnabled = new Set<string>();
        calc.getAllRules().forEach(rule => {
          if (calc.isRuleEnabled(rule.id)) {
            initialEnabled.add(rule.id);
          }
        });
        setEnabledRules(initialEnabled);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load specification');
        console.error('Error loading spec:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpec();
  }, []);

  // Update calculator state and score when enabled rules change
  useEffect(() => {
    if (!calculator) return;

    calculator.disableAllRules();
    enabledRules.forEach(ruleId => calculator.enableRule(ruleId));
    const result = calculator.calculateScore();
    setScoreResult(result);
  }, [calculator, enabledRules]);

  // Pre-calculate all memoized values to avoid hooks order violations
  const priorityOrder = { critical: 0, important: 1, normal: 2, low: 3 };
  const priorityColors = {
    critical: "bg-red-500 hover:bg-red-600",
    important: "bg-amber-500 hover:bg-amber-600",
    normal: "bg-teal-500 hover:bg-teal-600",
    low: "bg-slate-500 hover:bg-slate-600"
  };

  // Convert spec rules to UI format
  const rules: Rule[] = useMemo(() => {
    if (!calculator || !scoreResult) return [];

    return calculator.getAllRules().map((specRule: SpecRule) => ({
      id: specRule.id,
      name: specRule.name,
      description: specRule.rationale || 'No description available',
      priority: specRule.priority,
      category: specRule.group,
      signal: specRule.signal,
      ruleCode: specRule.id,
      impact: scoreResult.magnitudes.get(specRule.id) || 0,
      enabled: enabledRules.has(specRule.id),
      specRule
    }));
  }, [calculator, enabledRules, scoreResult]);

  // Calculate scores and stats
  const stats = useMemo(() => {
    if (!calculator || !scoreResult) return {
      totalScore: 0,
      maxPossibleScore: 100,
      enabledRules: 0,
      totalRules: 0,
      priorityBreakdown: {
        critical: { count: 0, points: 0 },
        important: { count: 0, points: 0 },
        normal: { count: 0, points: 0 },
        low: { count: 0, points: 0 },
      },
      ruleCounts: { all: 0, critical: 0, important: 0, normal: 0, low: 0 },
      magnitudes: new Map(),
    };

    const enabledRulesList = rules.filter(rule => rule.enabled);

    const priorityBreakdown = {
      critical: { count: 0, points: 0 },
      important: { count: 0, points: 0 },
      normal: { count: 0, points: 0 },
      low: { count: 0, points: 0 },
    };

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

  // Filter and sort rules
  const filteredRules = useMemo(() => {
    const filtered = rules.filter(rule => {
      const matchesSearch = searchQuery === "" ||
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.ruleCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = activeFilter === "all" || rule.priority === activeFilter;
      const matchesSignal = signalFilter === "all" || rule.signal === signalFilter;

      return matchesSearch && matchesPriority && matchesSignal;
    });

    // Sort the filtered rules
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "priority":
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [rules, activeFilter, searchQuery, signalFilter, sortBy, sortOrder, priorityOrder]);

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
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const specInfo = calculator.getSpecInfo();

  // TEMPORARILY DISABLED - no rule toggling allowed
  // const handleRuleToggle = (ruleId: string) => {
  //   setEnabledRules(prev => {
  //     const newSet = new Set(prev);
  //     if (newSet.has(ruleId)) {
  //       newSet.delete(ruleId);
  //     } else {
  //       newSet.add(ruleId);
  //     }
  //     return newSet;
  //   });
  // };

  const handleShowRuleDetails = (rule: SpecRule) => {
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
      <div className="grid lg:grid-cols-3 gap-6">
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
            ? "lg:col-span-2"
            : "lg:col-span-3"
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
                    <Select value={signalFilter} onValueChange={(value: "all" | "traces" | "metrics" | "logs") => setSignalFilter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="traces">Traces</SelectItem>
                        <SelectItem value="metrics">Metrics</SelectItem>
                        <SelectItem value="logs">Logs</SelectItem>
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
                      priorityColors={priorityColors}
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
                        <SelectItem value="category">Category</SelectItem>
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

              {/* Rules by Category */}
              <div className="space-y-6">
                {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground capitalize">
                      {category} ({categoryRules.length})
                    </h3>
                    <div className="space-y-3">
                      {categoryRules.map(rule => (
                        <RuleItem
                          key={rule.id}
                          rule={rule}
                          priorityColors={priorityColors}
                          onShowRuleDetails={handleShowRuleDetails}
                        />
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

export default InstrumentationCalculator;