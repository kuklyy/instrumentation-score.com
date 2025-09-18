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
  resources: 'bg-blue-500 text-white',
  spans: 'bg-purple-500 text-white',
  metrics: 'bg-green-500 text-white',
  logs: 'bg-yellow-500 text-black',
  sdk: 'bg-orange-500 text-white',
};

export function RuleMarkdown({ rule, className }: RuleMarkdownProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{rule.id}</CardTitle>
          <div className="flex gap-2">
            <Badge className={priorityColors[rule.priority] ?? 'bg-gray-500 text-white'}>
              {rule.priority}
            </Badge>
            <Badge className={signalColors[rule.signal] ?? 'bg-gray-500 text-white'}>
              {rule.group}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {rule.name.split(/(`[^`]*`)/).map((part, index) =>
            part.startsWith('`') && part.endsWith('`') ? (
              <code key={index} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                {part.slice(1, -1)}
              </code>
            ) : (
              part
            )
          )}
        </p>
      </CardHeader>

      <CardContent>
        {rule.markdownContent ? (
          <ScrollArea className="h-96 w-full rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
              <ReactMarkdown
                components={{
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <code className="block bg-muted p-2 rounded text-sm font-mono border" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border text-foreground" {...props}>
                        {children}
                      </code>
                    );
                  },
                  strong: ({ children, ...props }) => (
                    <strong className="font-semibold text-foreground" {...props}>
                      {children}
                    </strong>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="mb-4 leading-relaxed" {...props}>
                      {children}
                    </p>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="font-semibold text-foreground mt-6 mb-3 text-base" {...props}>
                      {children}
                    </h4>
                  ),
                }}
              >
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