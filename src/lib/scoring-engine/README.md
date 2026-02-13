# Scoring Engine

TypeScript library for calculating OpenTelemetry instrumentation scores based on the [official spec](https://github.com/instrumentation-score/spec).

## Features

- Loads rules dynamically from the official spec repository
- Implements the official scoring formula (0-100 range)
- Supports rule state management (satisfied/violated)
- Provides detailed score breakdowns and drilldowns

## Usage

```typescript
import { InstrumentationScoreCalculator, loadOfficialSpec } from './lib/scoring-engine';

// Load official spec from GitHub
const spec = await loadOfficialSpec();

// Create calculator
const calculator = new InstrumentationScoreCalculator(spec);

// Calculate score (all rules satisfied by default)
const score = calculator.calculateScore();
console.log(`Score: ${score.total}/100`);

// Mark rules as violated/satisfied
calculator.setRuleViolated('RES-001');
calculator.setRuleSatisfied('SPA-003');

// Get detailed analysis
const drilldown = calculator.getScoreDrilldown();
```

## API

### Core Methods

- `calculateScore(): ScoreResult` - Calculate instrumentation score
- `getScoreDrilldown(): DrilldownResult` - Get detailed score analysis
- `setRuleViolated(ruleId: string)` - Mark rule as violated
- `setRuleSatisfied(ruleId: string)` - Mark rule as satisfied
- `setRuleStates(states: Record<string, boolean>)` - Set multiple rule states
- `getAllRules(): Rule[]` - Get all rules
- `getRulesBySignal()` - Group rules by signal type
- `getTopImpactViolatedRules(limit?: number)` - Get highest impact violations

### Score Formula

```
Score = (Σ(Pi × Wi) / Σ(Ti × Wi)) × 100

Pi = Satisfied rules at priority i
Ti = Total rules at priority i
Wi = Weight (Critical: 40, Important: 30, Normal: 20, Low: 10)
```

See the [official spec](https://github.com/instrumentation-score/spec) for complete documentation.
