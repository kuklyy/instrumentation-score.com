# Instrumentation Score Calculator Library

A TypeScript library for calculating OpenTelemetry instrumentation scores based on the official [Instrumentation Score Specification](https://github.com/instrumentation-score/spec).

## Features

- ✅ **Official Spec Compliance**: Uses the official rules and weights from the instrumentation-score spec repository
- ✅ **19 Official Rules**: Includes all current rules (LOG-001 through SPA-005)
- ✅ **Proper Weighting**: Critical (40), Important (30), Normal (20), Low (10) weights
- ✅ **Rule Management**: Enable/disable individual rules or sets of rules
- ✅ **Score Calculation**: Implements the official scoring formula
- ✅ **Detailed Drilldown**: Get rule contributions, breakdowns by priority, and recommendations

## Installation

This library is part of the instrumentation score website. To use it in other projects:

```bash
# For local development (npm link approach)
cd /path/to/instrumentation-score.com
npm link

cd /path/to/your-project
npm link instrumentation-score-website
```

## Usage

### Basic Usage

```typescript
import { InstrumentationScoreCalculator } from 'instrumentation-score-website/src/lib/score-drilldown';

// Create calculator with official spec
const calculator = new InstrumentationScoreCalculator();

// Calculate score with all rules enabled (default)
const score = calculator.calculateScore();
console.log(`Score: ${score.total}/100`);

// Get detailed breakdown
console.log('Breakdown by priority:', score.breakdown);
```

### Rule Management

```typescript
// Disable specific rules
calculator.disableRule('RES-001');
calculator.disableRule('MET-002');

// Enable rules
calculator.enableRule('SPA-003');

// Check if rule is enabled
if (calculator.isRuleEnabled('RES-005')) {
  console.log('service.name rule is enabled');
}

// Set multiple rule states at once
calculator.setRuleStates({
  'RES-001': true,
  'RES-002': false,
  'MET-001': true
});

// Enable/disable all rules
calculator.enableAllRules();
calculator.disableAllRules();
```

### Get Rule Information

```typescript
// Get all available rules
const allRules = calculator.getAllRules();
console.log(`Total rules: ${allRules.length}`);

// Get enabled vs disabled rules
const enabledRules = calculator.getEnabledRules();
const disabledRules = calculator.getDisabledRules();

// Group rules by signal type
const bySignal = calculator.getRulesBySignal();
console.log(`Traces: ${bySignal.traces.length} rules`);
console.log(`Metrics: ${bySignal.metrics.length} rules`);
console.log(`Logs: ${bySignal.logs.length} rules`);

// Group rules by category
const byGroup = calculator.getRulesByGroup();
byGroup.forEach((rules, group) => {
  console.log(`${group}: ${rules.length} rules`);
});
```

### Score Analysis

```typescript
// Get complete score drilldown
const drilldown = calculator.getScoreDrilldown();

console.log('Score:', drilldown.score.total);
console.log('Enabled rules:', drilldown.enabledRules.length);
console.log('Rules by signal:', drilldown.rulesBySignal);

// Get top impact missing rules (highest value rules that are disabled)
const topMissing = calculator.getTopImpactDisabledRules(3);
topMissing.forEach((rule, i) => {
  const impact = drilldown.score.magnitudes.get(rule.id);
  console.log(`${i + 1}. ${rule.id}: ${impact?.toFixed(1)}% impact`);
});
```

### Custom Spec

```typescript
import { InstrumentationScoreCalculator, Spec } from 'instrumentation-score-website/src/lib/score-drilldown';

// Use custom spec (optional)
const customSpec: Spec = {
  version: "1.0.0",
  priority_weights: {
    critical: 50,
    important: 30,
    normal: 15,
    low: 5
  },
  rules: [
    {
      id: "CUSTOM-001",
      name: "Custom rule",
      priority: "critical",
      signal: "traces",
      group: "custom",
      max_points: 1,
      rationale: "This is a custom rule"
    }
  ]
};

const customCalculator = new InstrumentationScoreCalculator(customSpec);
```

## API Reference

### InstrumentationScoreCalculator

#### Constructor
- `new InstrumentationScoreCalculator(customSpec?: Spec)` - Creates calculator with official or custom spec

#### Rule Management
- `getAllRules(): Rule[]` - Get all available rules
- `getEnabledRules(): Rule[]` - Get currently enabled rules
- `getDisabledRules(): Rule[]` - Get currently disabled rules
- `enableRule(ruleId: string): boolean` - Enable a specific rule
- `disableRule(ruleId: string): boolean` - Disable a specific rule
- `setRuleStates(states: Record<string, boolean>): void` - Set multiple rule states
- `enableAllRules(): void` - Enable all rules
- `disableAllRules(): void` - Disable all rules
- `isRuleEnabled(ruleId: string): boolean` - Check if rule is enabled

#### Score Calculation
- `calculateScore(): ScoreResult` - Calculate instrumentation score
- `getScoreDrilldown(): DrilldownResult` - Get complete score analysis

#### Rule Organization
- `getRulesBySignal(): {traces: Rule[], metrics: Rule[], logs: Rule[]}` - Group by signal
- `getRulesByGroup(): Map<string, Rule[]>` - Group by category
- `getTopImpactDisabledRules(limit?: number): Rule[]` - Get highest impact disabled rules

#### Utility
- `getSpecInfo(): {version: string, totalRules: number, priorityWeights: Record<Priority, number>}` - Get spec details

### Types

```typescript
type Priority = "critical" | "important" | "normal" | "low";

type Rule = {
  id: string;
  name: string;
  priority: Priority;
  signal: "traces" | "metrics" | "logs";
  group: string;
  max_points?: number;
  spec_url?: string;
  rationale?: string;
  criteria?: string;
};

type ScoreResult = {
  total: number;           // Final score 0-100
  raw: number;            // Raw points earned
  maxScore: number;       // Maximum possible points
  magnitudes: Map<string, number>; // Rule contribution percentages
  breakdown: {            // Breakdown by priority
    critical: { enabled: number; total: number; points: number };
    important: { enabled: number; total: number; points: number };
    normal: { enabled: number; total: number; points: number };
    low: { enabled: number; total: number; points: number };
  };
};
```

## Official Rules (v0.1.0)

The library includes all 19 official rules from the spec:

### Critical (1 rule)
- **RES-005**: `service.name` is present

### Important (12 rules)
- **LOG-001**: Debug-level logs are not enabled in production environments for longer than 14 days
- **LOG-002**: Log records have their `severityNumber` set
- **MET-001**: Metric attributes have bound cardinality
- **MET-002**: Metrics have useful metric units
- **MET-003**: Metric names are consistently associated with the same metric unit
- **MET-006**: Metric names do not equal semantic convention attribute keys
- **RES-002**: `service.instance.id` is unique across logical resources within a given `service.name`
- **RES-003**: `k8s.pod.uid` is present in telemetry collected from applications running on a Kubernetes cluster
- **RES-004**: Semantic conventions attributes are used at the right level
- **SPA-003**: Span names have bound cardinality
- **SPA-004**: Root spans are not `CLIENT` spans
- **SPA-005**: Traces do not contain a high number of short duration spans

### Normal (5 rules)
- **MET-004**: Histogram metrics consistently use the same histogram buckets per metric name
- **MET-005**: Metric names do not contain the name of the metric unit
- **RES-001**: `service.instance.id` is present
- **SPA-001**: Traces contain a limited number of `INTERNAL` spans per service
- **SPA-002**: Traces do not contain orphan spans

### Low (1 rule)
- **SDK-001**: Dependencies (language and runtime) are supported by the SDK

## Score Calculation Formula

The official formula from the spec:

```
Score = (Σ(Pi × Wi) / Σ(Ti × Wi)) × 100

Where:
- Pi = Number of passed rules for priority level i
- Ti = Total number of rules for priority level i
- Wi = Weight for priority level i (Critical: 40, Important: 30, Normal: 20, Low: 10)
```