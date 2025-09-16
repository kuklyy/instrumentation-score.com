#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPEC_RULES_DIR = '/Users/jakub/_/instrumentation-score-spec/rules';
const OUTPUT_FILE = path.join(__dirname, '../src/data/specRules.ts');

function parseMarkdownRule(content, ruleId) {
  const lines = content.split('\n');
  let name = '';
  let description = '';
  let rationale = '';
  let target = '';
  let criteria = '';
  let impact = '';

  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('**Rule ID:**')) {
      currentSection = 'id';
      continue;
    } else if (trimmedLine.startsWith('**Description:**')) {
      currentSection = 'description';
      const desc = trimmedLine.replace('**Description:**', '').trim();
      if (desc) name = desc;
      continue;
    } else if (trimmedLine.startsWith('**Rationale:**')) {
      currentSection = 'rationale';
      const rat = trimmedLine.replace('**Rationale:**', '').trim();
      if (rat) rationale = rat;
      continue;
    } else if (trimmedLine.startsWith('**Target:**')) {
      currentSection = 'target';
      target = trimmedLine.replace('**Target:**', '').trim();
      continue;
    } else if (trimmedLine.startsWith('**Criteria:**')) {
      currentSection = 'criteria';
      const crit = trimmedLine.replace('**Criteria:**', '').trim();
      if (crit) criteria = crit;
      continue;
    } else if (trimmedLine.startsWith('**Examples:**')) {
      currentSection = 'examples';
      continue;
    } else if (trimmedLine.startsWith('**Impact:**')) {
      currentSection = 'impact';
      impact = trimmedLine.replace('**Impact:**', '').trim();
      continue;
    }

    if (trimmedLine && !trimmedLine.startsWith('**') && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('-')) {
      switch (currentSection) {
        case 'description':
          if (!name) name = trimmedLine;
          break;
        case 'rationale':
          if (!rationale) rationale = trimmedLine;
          else rationale += ' ' + trimmedLine;
          break;
        case 'criteria':
          if (!criteria) criteria = trimmedLine;
          else criteria += ' ' + trimmedLine;
          break;
      }
    }
  }

  // Set description as name + rationale if name is short
  if (name.length < 10 && rationale) {
    description = rationale;
  } else {
    description = name;
  }

  // Map target to category
  const categoryMap = {
    'Resource': 'resources',
    'Span': 'spans',
    'Metric': 'metrics',
    'Log': 'logs',
    'Profile': 'profiling',
    'SDK': 'sdk',
    'Collector': 'collector'
  };

  const category = categoryMap[target] || target.toLowerCase();

  // Map impact to priority
  const priorityMap = {
    'Critical': 'critical',
    'Important': 'important',
    'Normal': 'normal',
    'Low': 'low'
  };

  const priority = priorityMap[impact] || 'normal';

  // Calculate impact score based on priority
  const impactMap = {
    'critical': 5.3,
    'important': 2.6,
    'normal': 1.3,
    'low': 0.6
  };

  return {
    id: ruleId,
    name: name || ruleId,
    description: description || criteria || 'No description available',
    priority,
    category,
    enabled: true,
    ruleCode: ruleId,
    impact: impactMap[priority]
  };
}

function parseAllRules() {
  const rules = [];
  let idCounter = 1;

  try {
    const files = fs.readdirSync(SPEC_RULES_DIR);

    for (const file of files) {
      if (file.endsWith('.md') && file !== '_template.md') {
        const ruleId = file.replace('.md', '');
        const filePath = path.join(SPEC_RULES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const rule = parseMarkdownRule(content, ruleId);
        rule.id = idCounter.toString();
        rules.push(rule);
        idCounter++;
      }
    }

    console.log(`Parsed ${rules.length} rules from spec repository`);
    return rules;
  } catch (error) {
    console.error('Error parsing rules:', error);
    return [];
  }
}

function generateTypeScriptFile(rules) {
  const imports = `export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'normal' | 'low';
  category: string;
  enabled: boolean;
  ruleCode: string;
  impact: number;
}`;

  const rulesArray = `export const specRules: Rule[] = ${JSON.stringify(rules, null, 2)};`;

  return `${imports}\n\n${rulesArray}\n`;
}

function main() {
  console.log('Parsing rules from spec repository...');
  const rules = parseAllRules();

  if (rules.length === 0) {
    console.error('No rules parsed');
    process.exit(1);
  }

  const output = generateTypeScriptFile(rules);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated ${OUTPUT_FILE} with ${rules.length} rules`);

  // Also log first few rules for verification
  console.log('\nFirst 3 rules:');
  rules.slice(0, 3).forEach(rule => {
    console.log(`- ${rule.ruleCode}: ${rule.name} (${rule.priority})`);
  });
}

main();