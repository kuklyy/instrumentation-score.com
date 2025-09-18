import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rule } from '@/lib/score-drilldown/types';

interface RuleMarkdownProps {
  rule: Rule;
  className?: string;
}

const priorityColors = {
  critical: 'bg-red-500 text-white',
  important: 'bg-orange-500 text-white',
  normal: 'bg-blue-500 text-white',
  low: 'bg-gray-500 text-white',
};

const signalColors = {
  traces: 'bg-purple-500 text-white',
  metrics: 'bg-green-500 text-white',
  logs: 'bg-yellow-500 text-black',
};

export function RuleMarkdown({ rule, className }: RuleMarkdownProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{rule.id}</CardTitle>
          <div className="flex gap-2">
            <Badge className={priorityColors[rule.priority]}>
              {rule.priority}
            </Badge>
            <Badge className={signalColors[rule.signal]}>
              {rule.signal}
            </Badge>
            <Badge variant="outline">
              {rule.group}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{rule.name}</p>
      </CardHeader>

      <CardContent>
        {rule.markdownContent ? (
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {rule.markdownContent}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-4">
            {rule.rationale && (
              <div>
                <h4 className="font-medium mb-2">Rationale</h4>
                <p className="text-sm text-muted-foreground">{rule.rationale}</p>
              </div>
            )}

            {rule.criteria && (
              <div>
                <h4 className="font-medium mb-2">Criteria</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {rule.criteria}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {!rule.rationale && !rule.criteria && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground italic mb-2">
                  No detailed documentation available for this rule.
                </p>
                <p className="text-xs text-muted-foreground">
                  Rule ID: <code className="bg-muted px-1 rounded">{rule.id}</code>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RuleMarkdown;