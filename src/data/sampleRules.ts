export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'normal' | 'low';
  category: string;
  enabled: boolean;
  ruleCode: string;
  impact: number;
}

export const sampleRules: Rule[] = [
  {
    id: '1',
    name: 'service.name present',
    description: 'service.name is required to attribute spans to a service',
    priority: 'critical',
    category: 'resources',
    enabled: true,
    ruleCode: 'R-001',
    impact: 5.3,
  },
  {
    id: '2',
    name: 'service.version present',
    description: 'service.version enables deployment tracking and rollback analysis',
    priority: 'important',
    category: 'resources',
    enabled: true,
    ruleCode: 'R-002',
    impact: 2.6,
  },
  {
    id: '3',
    name: 'deployment.environment present',
    description: 'deployment.environment separates dev/staging/production data',
    priority: 'important',
    category: 'resources',
    enabled: true,
    ruleCode: 'R-003',
    impact: 2.6,
  },
  {
    id: '4',
    name: 'span.kind set appropriately',
    description: 'span.kind is essential for understanding service interactions',
    priority: 'critical',
    category: 'spans',
    enabled: true,
    ruleCode: 'R-004',
    impact: 5.3,
  },
  {
    id: '5',
    name: 'operation names are meaningful',
    description: 'Descriptive operation names improve trace readability',
    priority: 'important',
    category: 'spans',
    enabled: true,
    ruleCode: 'R-005',
    impact: 2.6,
  },
  {
    id: '6',
    name: 'parent-child relationships correct',
    description: 'Proper span hierarchy is required for distributed tracing',
    priority: 'critical',
    category: 'spans',
    enabled: true,
    ruleCode: 'R-006',
    impact: 5.3,
  },
  {
    id: '7',
    name: 'HTTP status codes present',
    description: 'HTTP status codes help identify failed requests',
    priority: 'normal',
    category: 'attributes',
    enabled: false,
    ruleCode: 'R-007',
    impact: 1.3,
  },
  {
    id: '8',
    name: 'Database queries sanitized',
    description: 'Sanitized queries prevent PII exposure in traces',
    priority: 'important',
    category: 'attributes',
    enabled: false,
    ruleCode: 'R-008',
    impact: 2.6,
  },
  {
    id: '9',
    name: 'Error attributes present',
    description: 'Error attributes provide context for debugging failures',
    priority: 'normal',
    category: 'attributes',
    enabled: false,
    ruleCode: 'R-009',
    impact: 1.3,
  },
  {
    id: '10',
    name: 'Sampling configured',
    description: 'Proper sampling reduces costs while maintaining visibility',
    priority: 'low',
    category: 'configuration',
    enabled: false,
    ruleCode: 'R-010',
    impact: 0.6,
  },
];