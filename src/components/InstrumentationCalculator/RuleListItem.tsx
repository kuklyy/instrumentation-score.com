import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { PRIORITY_BUTTON_COLORS } from './constants';
import type { Priority } from '@/lib/scoring-engine/types';

/**
 * Renders rule name with inline code highlighting
 */
function RuleNameWithCode({ name }: { name: string }) {
  return (
    <>
      {name.split(/(`[^`]*`)/).map((part, index) =>
        part.startsWith('`') && part.endsWith('`') ? (
          <code key={index} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

interface BaseRule {
  id: string;
  name: string;
  priority: Priority;
  enabled?: boolean;
}

export interface RuleListItemProps<T extends BaseRule = BaseRule> {
  rule: T;
  /**
   * Callback when rule is toggled
   */
  onToggle?: (ruleId: string) => void;
  /**
   * Callback when info button is clicked (for dialog mode)
   */
  onShowDetails?: (rule: T) => void;
  /**
   * Impact/magnitude value to display
   */
  impact?: number;
  /**
   * Maximum possible impact (for progress bars)
   */
  maxImpact?: number;
  /**
   * Additional metadata to display
   */
  metadata?: {
    /** Category or group name */
    category?: string;
    /** Rule code/ID to display */
    ruleCode?: string;
    /** Description or rationale */
    description?: string;
    /** Spec URL for external link */
    specUrl?: string;
  };
  /**
   * Display variant
   * - 'card': Full card with status dot, badges, and info button (default)
   * - 'compact': Compact row with progress bar and tooltip
   */
  variant?: 'card' | 'compact';
  /**
   * Custom priority colors override
   */
  priorityColors?: Record<Priority, string>;
}

/**
 * Shared rule list item component
 *
 * Displays a rule with configurable layout and interactions.
 * Supports both card-style (for InstrumentationCalculator) and
 * compact-style (for RuleTable) variants.
 */
export const RuleListItem = React.memo(<T extends BaseRule>({
  rule,
  onToggle,
  onShowDetails,
  impact = 0,
  maxImpact,
  metadata,
  variant = 'card',
  priorityColors = PRIORITY_BUTTON_COLORS
}: RuleListItemProps<T>) => {
  const isEnabled = rule.enabled ?? false;
  const showProgressBar = variant === 'compact' && maxImpact !== undefined;
  const clickable = !!onToggle;

  const handleClick = () => {
    if (clickable) {
      onToggle?.(rule.id);
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShowDetails?.(rule);
  };

  if (variant === 'card') {
    return (
      <div
        className={`flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 hover:border-border hover:shadow-sm transition-all ${
          clickable ? 'cursor-pointer' : ''
        }`}
        onClick={handleClick}
        title={clickable ? `Click to ${isEnabled ? 'mark as failing' : 'mark as passing'}` : undefined}
      >
        {/* Checkbox */}
        {clickable && (
          <Checkbox
            checked={isEnabled}
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="flex-1 space-y-2">
          {/* Title row */}
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-foreground">
              <RuleNameWithCode name={rule.name} />
            </h4>
            {metadata?.ruleCode && (
              <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {metadata.ruleCode}
              </code>
            )}
          </div>

          {/* Metadata row */}
          <div className="flex items-center space-x-3">
            <Badge className={`${priorityColors[rule.priority]} text-white border border-black/60 text-xs px-2 py-1`}>
              {rule.priority}
            </Badge>
            {metadata?.category && (
              <Badge variant="outline" className="text-xs">
                {metadata.category}
              </Badge>
            )}
            {impact > 0 && (
              <>
                <span className="text-sm text-muted-foreground">—</span>
                <span className="text-sm font-medium text-foreground">
                  {Math.round(impact)}pts
                </span>
              </>
            )}
          </div>
        </div>

        {/* Info button */}
        {onShowDetails && (
          <div className="ml-4 flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground z-10 relative"
              onClick={handleInfoClick}
              title="View rule details and description"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-all border-l-4 ${
        clickable ? 'cursor-pointer' : ''
      } ${
        isEnabled ? 'border-l-green-500' : 'border-l-red-500'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 flex-1">
        {/* Name and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white truncate">
              <RuleNameWithCode name={rule.name} />
            </span>
            <Badge className={`${priorityColors[rule.priority]} text-white border border-black/60 text-xs px-2 py-1`}>
              {rule.priority}
            </Badge>
            {metadata?.description && !onShowDetails && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm">
                  <div className="space-y-2">
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm">{metadata.description}</div>
                    {metadata.specUrl && (
                      <div className="text-xs text-blue-400">
                        <a href={metadata.specUrl} target="_blank" rel="noopener noreferrer">
                          View in specification →
                        </a>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {metadata?.ruleCode || rule.id} • Impact: {Math.round(impact)}
          </div>
        </div>
      </div>

      {/* Progress bar (compact variant) */}
      {showProgressBar && maxImpact && (
        <div className="w-24 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              {isEnabled ? `+${Math.round(impact)}` : "—"}
            </span>
            <span className="text-slate-400">
              {Math.round(maxImpact)}pts
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isEnabled ? 'bg-teal-500' : 'bg-slate-600'
              }`}
              style={{ width: `${(maxImpact / 90) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Info button (compact with dialog) */}
      {onShowDetails && metadata?.description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              onClick={handleInfoClick}
            >
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-sm">
            <div className="space-y-2">
              <div className="font-medium">{rule.name}</div>
              <div className="text-sm">{metadata.description}</div>
              {metadata.specUrl && (
                <div className="text-xs text-blue-400">
                  <a href={metadata.specUrl} target="_blank" rel="noopener noreferrer">
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
});

RuleListItem.displayName = 'RuleListItem';
