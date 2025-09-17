import React from 'react';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { PriorityBreakdown } from '@/components/PriorityBreakdown';
import { InstrumentationCalculator } from '@/components/calculator/InstrumentationCalculator';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative container mx-auto px-4 py-8">
        <InstrumentationCalculator
          showScoreDisplay={true}
          showPriorityBreakdown={true}
          ScoreDisplayComponent={ScoreDisplay}
          PriorityBreakdownComponent={PriorityBreakdown}
          title="Score Calculator"
          description="Interactive tool to calculate your instrumentation score"
        />
      </div>
    </div>
  );
};

export default Calculator;