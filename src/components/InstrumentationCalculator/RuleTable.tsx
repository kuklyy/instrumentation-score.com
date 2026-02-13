import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, ArrowUpDown } from "lucide-react";
import { type Rule, type Priority } from "@/lib/scoring-engine/types";
import { PRIORITY_BUTTON_COLORS } from './constants';
import {
  useFilteredAndSortedRules,
  groupRulesBy,
  type SortOption,
  type SortOrder
} from './hooks/useFilteredAndSortedRules';
import { RuleListItem } from './RuleListItem';

interface SignalTabProps {
  signal: string;
  rules: Rule[];
  onToggleRule: (ruleId: string) => void;
  magnitudes: Map<string, number>;
}

const SignalTab = React.memo<SignalTabProps>(({ signal, rules: signalRules, onToggleRule, magnitudes }) => {
  const rulesByGroup = groupRulesBy(signalRules, 'group');

  return (
    <div className="space-y-6">
      {Object.entries(rulesByGroup).map(([group, groupRules]) => (
        <Card key={group} className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg capitalize text-white">
              {group} ({groupRules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {groupRules.map(rule => (
              <RuleListItem
                key={rule.id}
                rule={rule}
                onToggle={onToggleRule}
                impact={magnitudes.get(rule.id) || 0}
                metadata={{
                  ruleCode: rule.ruleCode,
                  description: rule.rationale,
                  specUrl: rule.specUrl
                }}
                variant="compact"
                priorityColors={PRIORITY_BUTTON_COLORS}
              />
            ))}
          </CardContent>
        </Card>
      ))}

    </div>
  );
});

interface RuleTableProps {
  rules: Rule[];
  enabledRuleIds: Set<string>;
  onToggleRule: (ruleId: string) => void;
  magnitudes: Map<string, number>;
  priorityWeights: Record<Priority, number>;
}

export function RuleTable({ rules, enabledRuleIds, onToggleRule, magnitudes, priorityWeights }: RuleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [signalFilter, setSignalFilter] = useState<"all" | "resources" | "spans" | "metrics" | "logs" | "sdk">("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filter and sort rules using custom hook
  const filteredRules = useFilteredAndSortedRules(rules, {
    searchQuery: searchTerm,
    priorityFilter,
    signalFilter,
    sortBy,
    sortOrder
  });

  // Group by signal
  const rulesBySignal = useMemo(() => {
    const grouped = groupRulesBy(filteredRules, 'signal');
    return {
      resources: grouped.resources || [],
      spans: grouped.spans || [],
      metrics: grouped.metrics || [],
      logs: grouped.logs || [],
      sdk: grouped.sdk || []
    };
  }, [filteredRules]);

  // Memoize filtered rule counts
  const filteredRuleCounts = useMemo(() => ({
    resources: rulesBySignal.resources.length,
    spans: rulesBySignal.spans.length,
    metrics: rulesBySignal.metrics.length,
    logs: rulesBySignal.logs.length,
    sdk: rulesBySignal.sdk.length,
  }), [rulesBySignal]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* First Row: Search and Signal Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Signal Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 whitespace-nowrap">Signal:</span>
                <Select value={signalFilter} onValueChange={(value: "all" | "resources" | "spans" | "metrics" | "logs" | "sdk") => setSignalFilter(value)}>
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
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
              {/* Priority Filter */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-slate-300 whitespace-nowrap self-center">Priority:</span>
                <Button
                  variant={priorityFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter("all")}
                  className="text-xs"
                >
                  All
                </Button>
                {Object.keys(PRIORITY_BUTTON_COLORS).map((priority) => (
                  <Button
                    key={priority}
                    variant={priorityFilter === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriorityFilter(priority as Priority)}
                    className={`text-xs ${
                      priorityFilter === priority
                        ? PRIORITY_BUTTON_COLORS[priority as Priority]
                        : "hover:bg-slate-700"
                    }`}
                  >
                    {priority}
                  </Button>
                ))}
              </div>

              {/* Sorting Controls */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-300 whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-28 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="ml-1 text-xs">{sortOrder.toUpperCase()}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
          <TabsTrigger value="resources" className="data-[state=active]:bg-slate-700">
            Resources ({filteredRuleCounts.resources})
          </TabsTrigger>
          <TabsTrigger value="spans" className="data-[state=active]:bg-slate-700">
            Spans ({filteredRuleCounts.spans})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-700">
            Metrics ({filteredRuleCounts.metrics})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">
            Logs ({filteredRuleCounts.logs})
          </TabsTrigger>
          <TabsTrigger value="sdk" className="data-[state=active]:bg-slate-700">
            SDK ({filteredRuleCounts.sdk})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-6">
          <SignalTab
            signal="resources"
            rules={rulesBySignal.resources}
            onToggleRule={onToggleRule}
            magnitudes={magnitudes}
          />
        </TabsContent>

        <TabsContent value="spans" className="mt-6">
          <SignalTab
            signal="spans"
            rules={rulesBySignal.spans}
            onToggleRule={onToggleRule}
            magnitudes={magnitudes}
          />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <SignalTab
            signal="metrics"
            rules={rulesBySignal.metrics}
            onToggleRule={onToggleRule}
            magnitudes={magnitudes}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <SignalTab
            signal="logs"
            rules={rulesBySignal.logs}
            onToggleRule={onToggleRule}
            magnitudes={magnitudes}
          />
        </TabsContent>

        <TabsContent value="sdk" className="mt-6">
          <SignalTab
            signal="sdk"
            rules={rulesBySignal.sdk}
            onToggleRule={onToggleRule}
            magnitudes={magnitudes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}