import { Rule, Priority, Spec } from './types';

const SPEC_REPO_URL = 'https://api.github.com/repos/instrumentation-score/spec/contents/rules';

export function parseRuleContent(content: string, filename: string): Rule | null {
  try {
    const lines = content.split('\n');

    let id = '';
    let name = '';
    let rationale = '';
    let target = '';
    let impact = '';
    let criteria = '';

    // Extract criteria section if it exists
    const criteriaStart = content.indexOf('## Criteria') || content.indexOf('**Criteria:**');
    if (criteriaStart !== -1) {
      criteria = content.substring(criteriaStart);
    }

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
      console.warn(`Incomplete rule data in ${filename}`);
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
      console.warn(`Unknown impact level "${impact}" in ${filename}`);
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
      criteria,
      markdownContent: content,
      maxPoints: 1
    };
  } catch (error) {
    console.error(`Error parsing rule content from ${filename}:`, error);
    return null;
  }
}

export async function loadOfficialSpec(): Promise<Spec> {
  try {
    console.log('Loading official specification from repository...');
    const startTime = performance.now();

    const response = await fetch(SPEC_REPO_URL);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();

    // Filter rule files and create fetch promises for parallel download
    const ruleFiles = files.filter(file =>
      file.name.endsWith('.md') &&
      !file.name.startsWith('_') &&
      file.type === 'file'
    );

    // Fetch all rule files in parallel
    const rulePromises = ruleFiles.map(async (file) => {
      try {
        const fileResponse = await fetch(file.download_url);
        if (!fileResponse.ok) {
          console.warn(`Failed to fetch ${file.name}: ${fileResponse.status}`);
          return null;
        }

        const content = await fileResponse.text();
        const rule = parseRuleContent(content, file.name);
        return rule;
      } catch (error) {
        console.error(`Error fetching rule file ${file.name}:`, error);
        return null;
      }
    });

    // Wait for all downloads to complete and filter out null results
    const ruleResults = await Promise.all(rulePromises);
    const rules: Rule[] = ruleResults.filter(rule => rule !== null) as Rule[];

    const endTime = performance.now();
    const loadTime = Math.round(endTime - startTime);
    console.log(`✅ Loaded ${rules.length} rules from ${ruleFiles.length} files in ${loadTime}ms (parallel download)`);

    // Official weights from the specification
    const priorityWeights = {
      critical: 40,
      important: 30,
      normal: 20,
      low: 10
    };

    return {
      version: '0.1.0',
      priorityWeights,
      rules
    };
  } catch (error) {
    console.error('Error loading official spec:', error);
    throw error;
  }
}