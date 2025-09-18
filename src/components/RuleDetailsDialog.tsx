import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Rule } from '@/lib/score-drilldown/types';
import { RuleMarkdown } from './RuleMarkdown';

interface RuleDetailsDialogProps {
  rule: Rule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RuleDetailsDialog({ rule, open, onOpenChange }: RuleDetailsDialogProps) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rule Details: {rule.id}</DialogTitle>
        </DialogHeader>
        <RuleMarkdown rule={rule} className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  );
}

export default RuleDetailsDialog;