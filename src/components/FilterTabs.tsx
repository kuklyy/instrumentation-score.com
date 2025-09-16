import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ruleCounts: {
    all: number;
    critical: number;
    important: number;
    normal: number;
    low: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  ruleCounts,
}) => {
  const filters = [
    { key: 'all', label: 'All', count: ruleCounts.all },
    { key: 'critical', label: 'Critical', count: ruleCounts.critical },
    { key: 'important', label: 'Important', count: ruleCounts.important },
    { key: 'normal', label: 'Normal', count: ruleCounts.normal },
    { key: 'low', label: 'Low', count: ruleCounts.low },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rules..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-muted border-border/50 focus:border-primary"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filters.map(({ key, label, count }) => (
          <Button
            key={key}
            variant={activeFilter === key ? "default" : "secondary"}
            size="sm"
            onClick={() => onFilterChange(key)}
            className="whitespace-nowrap"
          >
            {label}
            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
              {count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};