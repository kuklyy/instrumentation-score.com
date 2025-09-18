# Instrumentation Calculator Library

A self-contained React library for calculating and displaying OpenTelemetry instrumentation scores.

## Structure

```
src/lib/instrumentation-calculator/
├── components/           # React components
│   ├── InstrumentationCalculator.tsx  # Main calculator component
│   ├── ScoreDisplay.tsx              # Score display widget
│   ├── PriorityBreakdown.tsx         # Priority breakdown widget
│   ├── RuleTable.tsx                # Rules table component
│   ├── ScoreCard.tsx               # Score card component
│   └── index.ts                   # Component exports
├── lib/                  # Core calculation engine
│   ├── calculator.ts     # Score calculation logic
│   ├── types.ts         # TypeScript definitions
│   ├── spec-parser.ts   # Specification parser
│   ├── official-spec.json # Official specification rules
│   └── index.ts         # Library exports
└── index.ts             # Main library entry point
```

## Usage

```tsx
import {
  InstrumentationCalculator,
  ScoreDisplay,
  PriorityBreakdown
} from '@/lib/instrumentation-calculator';

// Use as a complete calculator
<InstrumentationCalculator
  showScoreDisplay={true}
  showPriorityBreakdown={true}
  ScoreDisplayComponent={ScoreDisplay}
  PriorityBreakdownComponent={PriorityBreakdown}
  title="Score Calculator"
  description="Interactive tool to calculate your instrumentation score"
/>

// Or use individual components
<ScoreDisplay
  score={score}
  maxScore={100}
  rulesEnabled={enabledRules}
  totalRules={totalRules}
/>
```

## Dependencies

The library depends on:
- React
- UI components from `@/components/ui/*` (shadcn/ui)
- Lucide React icons
- Tailwind CSS for styling

## Features

- Interactive rule selection with filtering and sorting
- Real-time score calculation
- Priority-based breakdown
- Sticky score display widget
- Search and filter functionality
- Export capability
- Responsive design