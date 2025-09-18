# Instrumentation Score Calculator API

## Overview

The unified calculator provides a standardized API for computing instrumentation scores based on OpenTelemetry best practices. It uses priority-weighted scoring with official specification rules.

## Core Types

### Input Types

```typescript
export type Priority = "critical" | "important" | "normal" | "low";

export type Rule = {
  id: string;                    // Unique rule identifier (e.g., "RES-005")
  name: string;                  // Human readable name
  priority: Priority;            // Rule priority level
  signal: "resources" | "spans" | "metrics" | "logs" | "sdk";
  group: string;                 // Category grouping
  maxPoints?: number;            // Max points (default 1)
  rationale?: string;            // Why this rule matters
  criteria?: string;             // How to evaluate
  markdownContent?: string;      // Full documentation
};

export type Spec = {
  version: string;
  priorityWeights: Record<Priority, number>;  // critical: 40, important: 30, etc.
  rules: Rule[];
};
```

### Output Types

```typescript
export type ScoreResult = {
  total: number;              // Final score (10-100 range)
  raw: number;               // Raw weighted sum
  maxScore: number;          // Maximum possible score
  magnitudes: Map<string, number>;  // Per-rule impact values
  breakdown: {               // Score breakdown by priority
    critical: { satisfied: number; total: number; points: number };
    important: { satisfied: number; total: number; points: number };
    normal: { satisfied: number; total: number; points: number };
    low: { satisfied: number; total: number; points: number };
  };
};

export type DrilldownResult = {
  score: ScoreResult;
  rulesBySignal: {
    resources: Rule[];
    spans: Rule[];
    metrics: Rule[];
    logs: Rule[];
    sdk: Rule[];
  };
  rulesByGroup: Map<string, Rule[]>;
  topImpactViolatedRules: Rule[];
  satisfiedRules: Rule[];
  violatedRules: Rule[];
};
```

## Calculator Class API

### Constructor

```typescript
constructor(customSpec?: Spec)
```

**Parameters:**
- `customSpec` (optional): Custom specification to use instead of official spec

**Example:**
```typescript
// Use official spec (default)
const calculator = new InstrumentationScoreCalculator();

// Use custom spec
const calculator = new InstrumentationScoreCalculator(myCustomSpec);
```

### Rule Management

#### `getAllRules(): Rule[]`
Returns all rules from the loaded specification.

#### `getSatisfiedRules(): Rule[]`
Returns currently satisfied rules only.

#### `getViolatedRules(): Rule[]`
Returns currently violated rules only.

#### `setRuleSatisfied(ruleId: string): boolean`
Mark a specific rule as satisfied by ID. Returns `true` if successful.

#### `setRuleViolated(ruleId: string): boolean`
Mark a specific rule as violated by ID. Returns `true` if successful.

#### `setRuleStates(ruleStates: Record<string, boolean>): void`
Set multiple rules as satisfied/violated in one operation.

**Example:**
```typescript
calculator.setRuleStates({
  'RES-001': true,   // satisfied
  'RES-002': false,  // violated
  'MET-001': true    // satisfied
});
```

#### `setAllRulesSatisfied(): void`
Mark all rules as satisfied in the specification.

#### `setAllRulesViolated(): void`
Mark all rules as violated in the specification.

#### `isRuleSatisfied(ruleId: string): boolean`
Check if a specific rule is currently satisfied.

### Scoring & Analysis

#### `calculateScore(): ScoreResult`
Calculate the instrumentation score based on currently satisfied rules.

**Returns:** Detailed scoring information including:
- Final score (10-100 range)
- Raw weighted sum
- Per-rule impact magnitudes
- Priority breakdown

**Scoring Formula:**
```
Score = (Σ(Pi × Wi) / Σ(Ti × Wi)) × 90 + 10
```
Where:
- `Pi` = Points for satisfied rules at priority level i
- `Wi` = Weight for priority level i
- `Ti` = Total possible points at priority level i

#### `getScoreDrilldown(): DrilldownResult`
Get comprehensive scoring analysis with rule categorization.

**Returns:** Complete breakdown including:
- Score result
- Rules grouped by signal type
- Rules grouped by category
- Top impact violated rules
- Satisfied/violated rule lists

#### `getRulesBySignal(): { resources: Rule[]; spans: Rule[]; metrics: Rule[]; logs: Rule[]; sdk: Rule[] }`
Group all rules by their signal type.

#### `getRulesByGroup(): Map<string, Rule[]>`
Group all rules by their category/group.

#### `getTopImpactViolatedRules(limit?: number): Rule[]`
Get highest-impact violated rules, sorted by potential score contribution.

**Parameters:**
- `limit` (optional, default 3): Maximum number of rules to return

#### `getSpecInfo(): { version: string; totalRules: number; priorityWeights: Record<Priority, number> }`
Get metadata about the loaded specification.

## Priority Weights

Default priority weights from official specification:

```typescript
{
  critical: 40,
  important: 30,
  normal: 20,
  low: 10
}
```

## Signal Types

Rules are categorized by signal type based on their ID prefix:

- **RES-*** → `resources` signal
- **SPA-*** → `spans` signal
- **MET-*** → `metrics` signal
- **LOG-*** → `logs` signal
- **SDK-*** → `sdk` signal

## Usage Examples

### Basic Usage

```typescript
import { InstrumentationScoreCalculator } from '@/lib/score-drilldown/calculator';

// Initialize calculator
const calculator = new InstrumentationScoreCalculator();

// Get current score
const score = calculator.calculateScore();
console.log(`Current score: ${score.total}/100`);

// Mark a rule as violated and recalculate
calculator.setRuleViolated('RES-001');
const newScore = calculator.calculateScore();
console.log(`New score: ${newScore.total}/100`);
```

### Advanced Analysis

```typescript
// Get comprehensive breakdown
const drilldown = calculator.getScoreDrilldown();

// Analyze by signal type
console.log('Resources rules:', drilldown.rulesBySignal.resources.length);
console.log('Spans rules:', drilldown.rulesBySignal.spans.length);

// Find highest impact violated rules
const topViolated = drilldown.topImpactViolatedRules;
topViolated.forEach(rule => {
  const impact = drilldown.score.magnitudes.get(rule.id);
  console.log(`${rule.id}: ${impact?.toFixed(1)} points`);
});

// Priority breakdown
const breakdown = drilldown.score.breakdown;
console.log(`Critical: ${breakdown.critical.satisfied}/${breakdown.critical.total} rules`);
```

### Bulk Rule Management

```typescript
// Mark only critical and important rules as satisfied
const allRules = calculator.getAllRules();
const ruleStates: Record<string, boolean> = {};

allRules.forEach(rule => {
  ruleStates[rule.id] = rule.priority === 'critical' || rule.priority === 'important';
});

calculator.setRuleStates(ruleStates);
```

## Import Path

```typescript
import { InstrumentationScoreCalculator } from '@/lib/score-drilldown/calculator';
import type { Rule, ScoreResult, DrilldownResult } from '@/lib/score-drilldown/types';
```

## Data Source

The calculator uses the official specification from:
`/src/lib/score-drilldown/official-spec.json`

This ensures consistency across all calculator instances and eliminates legacy data format issues.