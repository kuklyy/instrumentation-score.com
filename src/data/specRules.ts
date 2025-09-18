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

export const specRules: Rule[] = [
  {
    "id": "1",
    "name": "Debug-level logs are not enabled in production environments for longer than 14 days.",
    "description": "Debug-level logs are not enabled in production environments for longer than 14 days.",
    "priority": "important",
    "category": "logs",
    "enabled": true,
    "ruleCode": "LOG-001",
    "impact": 2.6
  },
  {
    "id": "2",
    "name": "Log records have their `severityNumber` set.",
    "description": "Log records have their `severityNumber` set.",
    "priority": "important",
    "category": "logs",
    "enabled": true,
    "ruleCode": "LOG-002",
    "impact": 2.6
  },
  {
    "id": "3",
    "name": "Metric attributes have bound cardinality.",
    "description": "Metric attributes have bound cardinality.",
    "priority": "important",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-001",
    "impact": 2.6
  },
  {
    "id": "4",
    "name": "Metrics have useful metric units.",
    "description": "Metrics have useful metric units.",
    "priority": "important",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-002",
    "impact": 2.6
  },
  {
    "id": "5",
    "name": "Metric names are consistently associated with the same metric unit.",
    "description": "Metric names are consistently associated with the same metric unit.",
    "priority": "important",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-003",
    "impact": 2.6
  },
  {
    "id": "6",
    "name": "Histogram metrics consistently use the same histogram buckets per metric name.",
    "description": "Histogram metrics consistently use the same histogram buckets per metric name.",
    "priority": "normal",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-004",
    "impact": 1.3
  },
  {
    "id": "7",
    "name": "Metric names do not contain the name of the metric unit.",
    "description": "Metric names do not contain the name of the metric unit.",
    "priority": "normal",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-005",
    "impact": 1.3
  },
  {
    "id": "8",
    "name": "Metric names do not equal semantic convention attribute keys.",
    "description": "Metric names do not equal semantic convention attribute keys.",
    "priority": "important",
    "category": "metrics",
    "enabled": true,
    "ruleCode": "MET-006",
    "impact": 2.6
  },
  {
    "id": "9",
    "name": "`service.instance.id` is present.",
    "description": "`service.instance.id` is present.",
    "priority": "normal",
    "category": "resources",
    "enabled": true,
    "ruleCode": "RES-001",
    "impact": 1.3
  },
  {
    "id": "10",
    "name": "`service.instance.id` is unique across logical resources within a given `service.name`.",
    "description": "`service.instance.id` is unique across logical resources within a given `service.name`.",
    "priority": "important",
    "category": "resources",
    "enabled": true,
    "ruleCode": "RES-002",
    "impact": 2.6
  },
  {
    "id": "11",
    "name": "`k8s.pod.uid` is present in telemetry collected from applications running on a Kubernetes cluster, or from the control pane of the Kubernetes cluster itself.",
    "description": "`k8s.pod.uid` is present in telemetry collected from applications running on a Kubernetes cluster, or from the control pane of the Kubernetes cluster itself.",
    "priority": "important",
    "category": "resources",
    "enabled": true,
    "ruleCode": "RES-003",
    "impact": 2.6
  },
  {
    "id": "12",
    "name": "Semantic conventions attributes are used at the right level.",
    "description": "Semantic conventions attributes are used at the right level.",
    "priority": "important",
    "category": "resource, log, span",
    "enabled": true,
    "ruleCode": "RES-004",
    "impact": 2.6
  },
  {
    "id": "13",
    "name": "`service.name` is present",
    "description": "`service.name` is present",
    "priority": "critical",
    "category": "resources",
    "enabled": true,
    "ruleCode": "RES-005",
    "impact": 5.3
  },
  {
    "id": "14",
    "name": "Dependencies (language and runtime) are supported by the SDK.",
    "description": "Dependencies (language and runtime) are supported by the SDK.",
    "priority": "low",
    "category": "sdk",
    "enabled": true,
    "ruleCode": "SDK-001",
    "impact": 0.6
  },
  {
    "id": "15",
    "name": "Traces contain a limited number of `INTERNAL` spans per service.",
    "description": "Traces contain a limited number of `INTERNAL` spans per service.",
    "priority": "normal",
    "category": "spans",
    "enabled": true,
    "ruleCode": "SPA-001",
    "impact": 1.3
  },
  {
    "id": "16",
    "name": "Traces do not contain orphan spans.",
    "description": "Traces do not contain orphan spans.",
    "priority": "normal",
    "category": "spans",
    "enabled": true,
    "ruleCode": "SPA-002",
    "impact": 1.3
  },
  {
    "id": "17",
    "name": "Span names have bound cardinality.",
    "description": "Span names have bound cardinality.",
    "priority": "important",
    "category": "spans",
    "enabled": true,
    "ruleCode": "SPA-003",
    "impact": 2.6
  },
  {
    "id": "18",
    "name": "Root spans are not `CLIENT` spans.",
    "description": "Root spans are not `CLIENT` spans.",
    "priority": "important",
    "category": "spans",
    "enabled": true,
    "ruleCode": "SPA-004",
    "impact": 2.6
  },
  {
    "id": "19",
    "name": "Traces do not contain a high number of short duration spans.",
    "description": "Traces do not contain a high number of short duration spans.",
    "priority": "important",
    "category": "spans",
    "enabled": true,
    "ruleCode": "SPA-005",
    "impact": 2.6
  }
];
