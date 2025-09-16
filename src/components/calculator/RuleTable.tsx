import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Search, X } from "lucide-react";
import { type Rule, getRulesBySignal, getRulesByGroup, type Priority } from "@/lib/scoring";

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

  const rulesBySignal = getRulesBySignal(rules);

  const priorityColors = {
    critical: "bg-red-500 hover:bg-red-600",
    important: "bg-amber-500 hover:bg-amber-600",
    normal: "bg-teal-500 hover:bg-teal-600",
    low: "bg-slate-500 hover:bg-slate-600"
  };

  const filterRules = (rulesArray: Rule[]) => {
    return rulesArray.filter(rule => {
      const matchesSearch = searchTerm === "" ||
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === "all" || rule.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  };

  const RuleRow = ({ rule }: { rule: Rule }) => {
    const magnitude = magnitudes.get(rule.id) || 0;
    const isEnabled = enabledRuleIds.has(rule.id);
    const points = isEnabled ? priorityWeights[rule.priority] * (rule.max_points || 1) : 0;

    return (
      <div className="flex items-center gap-4 p-3 border-b border-slate-700 hover:bg-slate-800/50 transition-colors">
        {/* Toggle Checkbox */}
        <Checkbox
          id={rule.id}
          checked={isEnabled}
          onCheckedChange={() => onToggleRule(rule.id)}
        />

        {/* Rule Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{rule.name}</span>
            <code className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
              {rule.id}
            </code>
          </div>
          {rule.rationale && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {rule.rationale}
            </p>
          )}
        </div>

        {/* Priority Badge */}
        <Badge
          className={`${priorityColors[rule.priority]} text-white border-transparent text-xs px-2 py-1`}
        >
          {rule.priority}
        </Badge>

        {/* Group Badge */}
        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
          {rule.group}
        </Badge>

        {/* Magnitude Bar */}
        <div className="w-24 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              {isEnabled ? `+${points.toFixed(1)}` : "—"}
            </span>
            <span className="text-slate-400">
              {magnitude.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isEnabled ? 'bg-teal-500' : 'bg-slate-600'
              }`}
              style={{ width: `${magnitude}%` }}
            />
          </div>
        </div>

        {/* Info Button */}
        {rule.rationale && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="space-y-2">
                <div className="font-medium">{rule.name}</div>
                <div className="text-sm">{rule.rationale}</div>
                {rule.spec_url && (
                  <div className="text-xs text-blue-400">
                    <a href={rule.spec_url} target="_blank" rel="noopener noreferrer">
                      View in specification →
                    </a>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const SignalTab = ({ signal, rules: signalRules }: { signal: string; rules: Rule[] }) => {
    const filteredRules = filterRules(signalRules);
    const rulesByGroup = getRulesByGroup(filteredRules);

    return (
      <div className="space-y-6">
        {Array.from(rulesByGroup.entries()).map(([group, groupRules]) => (
          <Card key={group} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg capitalize text-white">
                {group} ({groupRules.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {groupRules.map(rule => (
                <RuleRow key={rule.id} rule={rule} />
              ))}
            </CardContent>
          </Card>
        ))}

        {filteredRules.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No rules match your current filters
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
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

            {/* Priority Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={priorityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriorityFilter("all")}
                className="text-xs"
              >
                All
              </Button>
              {Object.keys(priorityColors).map((priority) => (
                <Button
                  key={priority}
                  variant={priorityFilter === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter(priority as Priority)}
                  className={`text-xs ${
                    priorityFilter === priority
                      ? priorityColors[priority as Priority]
                      : "hover:bg-slate-700"
                  }`}
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="traces" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
          <TabsTrigger value="traces" className="data-[state=active]:bg-slate-700">
            Traces ({rulesBySignal.traces.length})
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-slate-700">
            Metrics ({rulesBySignal.metrics.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-slate-700">
            Logs ({rulesBySignal.logs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="traces" className="mt-6">
          <SignalTab signal="traces" rules={rulesBySignal.traces} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <SignalTab signal="metrics" rules={rulesBySignal.metrics} />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <SignalTab signal="logs" rules={rulesBySignal.logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}