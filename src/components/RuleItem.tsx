import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { InfoIcon } from 'lucide-react';
import { Rule } from '@/data/sampleRules';

interface RuleItemProps {
  rule: Rule;
  onToggle: (ruleId: string) => void;
}

export const RuleItem: React.FC<RuleItemProps> = ({ rule, onToggle }) => {
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
            {rule.impact}%
          </span>
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="ml-4">
        <Switch
          checked={rule.enabled}
          onCheckedChange={() => onToggle(rule.id)}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};