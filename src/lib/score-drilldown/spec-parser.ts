import fs from 'fs';
import path from 'path';
import { Rule, Priority, Spec } from './types';

const SPEC_REPO_PATH = '/Users/jakub/_/instrumentation-score-spec';

export function parseRuleFile(filePath: string): Rule | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let id = '';
    let name = '';
    let rationale = '';
    let target = '';
    let impact = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('**Rule ID:**')) {
        id = trimmed.replace('**Rule ID:**', '').trim();
      } else if (trimmed.startsWith('**Description:**')) {
        name = trimmed.replace('**Description:**', '').trim();
      } else if (trimmed.startsWith('**Rationale:**')) {
        rationale = trimmed.replace('**Rationale:**', '').trim();
      } else if (trimmed.startsWith('**Target:**')) {
        target = trimmed.replace('**Target:**', '').trim();
      } else if (trimmed.startsWith('**Impact:**')) {
        impact = trimmed.replace('**Impact:**', '').trim();
      }
    }

    if (!id || !name || !impact) {
      console.warn(`Incomplete rule data in ${filePath}`);
      return null;
    }

    // Map impact to priority
    const priorityMap: Record<string, Priority> = {
      'Critical': 'critical',
      'Important': 'important',
      'Normal': 'normal',
      'Low': 'low'
    };

    const priority = priorityMap[impact];
    if (!priority) {
      console.warn(`Unknown impact level "${impact}" in ${filePath}`);
      return null;
    }

    // Infer signal from rule ID prefix
    let signal: 'traces' | 'metrics' | 'logs';
    if (id.startsWith('RES-') || id.startsWith('SPA-') || id.startsWith('SDK-')) {
      signal = 'traces';
    } else if (id.startsWith('MET-')) {
      signal = 'metrics';
    } else if (id.startsWith('LOG-')) {
      signal = 'logs';
    } else {
      signal = 'traces'; // default
    }

    // Infer group from target or ID
    let group = '';
    if (target.toLowerCase().includes('resource') || id.startsWith('RES-')) {
      group = 'resources';
    } else if (target.toLowerCase().includes('span') || id.startsWith('SPA-')) {
      group = 'spans';
    } else if (id.startsWith('SDK-')) {
      group = 'sdk';
    } else if (id.startsWith('MET-')) {
      group = 'metrics';
    } else if (id.startsWith('LOG-')) {
      group = 'logs';
    } else {
      group = target.toLowerCase();
    }

    return {
      id,
      name,
      priority,
      signal,
      group,
      rationale,
      max_points: 1
    };
  } catch (error) {
    console.error(`Error parsing rule file ${filePath}:`, error);
    return null;
  }
}

export function loadOfficialSpec(): Spec {
  const rulesDir = path.join(SPEC_REPO_PATH, 'rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter(file =>
    file.endsWith('.md') && !file.startsWith('_')
  );

  const rules: Rule[] = [];

  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    const rule = parseRuleFile(filePath);
    if (rule) {
      rules.push(rule);
    }
  }

  // Official weights from the specification
  const priority_weights = {
    critical: 40,
    important: 30,
    normal: 20,
    low: 10
  };

  return {
    version: '0.1.0',
    priority_weights,
    rules
  };
}