import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterTabsProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  ruleCounts: Record<string, number>;
  priorityColors: Record<string, string>;
}

/**
 * Filter tabs component for selecting priority levels
 *
 * Displays a row of buttons for filtering rules by priority level (All, Critical, Important, etc.)
 * Shows the count of rules for each priority level.
 */
export const FilterTabs = React.memo<FilterTabsProps>(({
  activeFilter,
  setActiveFilter,
  ruleCounts,
  priorityColors
}) => (
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

FilterTabs.displayName = 'FilterTabs';
