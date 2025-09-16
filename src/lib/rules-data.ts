import { Spec } from "./scoring";

export const rulesData: Spec = {
  version: "2025-09-16",
  priority_weights: {
    critical: 4,
    important: 2,
    normal: 1,
    low: 0.5
  },
  rules: [
    // Traces - Resources
    {
      id: "R-001",
      name: "service.name present",
      priority: "critical",
      signal: "traces",
      group: "resources",
      max_points: 1,
      spec_url: "https://github.com/instrumentation-score/spec",
      rationale: "service.name is required to attribute spans to a service"
    },
    {
      id: "R-002",
      name: "service.version present",
      priority: "important",
      signal: "traces",
      group: "resources",
      max_points: 1,
      rationale: "service.version enables deployment tracking and rollback analysis"
    },
    {
      id: "R-003",
      name: "deployment.environment present",
      priority: "important",
      signal: "traces",
      group: "resources",
      max_points: 1,
      rationale: "deployment.environment separates dev/staging/production data"
    },

    // Traces - Spans
    {
      id: "R-004",
      name: "span.kind set appropriately",
      priority: "critical",
      signal: "traces",
      group: "spans",
      max_points: 1,
      rationale: "span.kind is essential for understanding service interactions"
    },
    {
      id: "R-005",
      name: "operation names are meaningful",
      priority: "important",
      signal: "traces",
      group: "spans",
      max_points: 1,
      rationale: "Descriptive operation names improve trace readability"
    },
    {
      id: "R-006",
      name: "parent-child relationships correct",
      priority: "critical",
      signal: "traces",
      group: "spans",
      max_points: 1,
      rationale: "Proper span hierarchy is required for distributed tracing"
    },

    // Traces - Attributes
    {
      id: "R-007",
      name: "http.method present for HTTP spans",
      priority: "critical",
      signal: "traces",
      group: "attributes",
      max_points: 1,
      rationale: "HTTP method is essential for analyzing web service behavior"
    },
    {
      id: "R-008",
      name: "http.status_code present for HTTP spans",
      priority: "critical",
      signal: "traces",
      group: "attributes",
      max_points: 1,
      rationale: "Status codes are crucial for error analysis and SLA monitoring"
    },
    {
      id: "R-009",
      name: "http.url normalized",
      priority: "normal",
      signal: "traces",
      group: "attributes",
      max_points: 1,
      rationale: "URL normalization prevents high-cardinality issues"
    },
    {
      id: "R-010",
      name: "db.statement not present",
      priority: "important",
      signal: "traces",
      group: "attributes",
      max_points: 1,
      rationale: "Raw SQL statements create security and cardinality issues"
    },
    {
      id: "R-011",
      name: "db.operation present for DB spans",
      priority: "important",
      signal: "traces",
      group: "attributes",
      max_points: 1,
      rationale: "Database operation type is needed for performance analysis"
    },

    // Traces - Errors
    {
      id: "R-012",
      name: "error status set when span fails",
      priority: "critical",
      signal: "traces",
      group: "errors",
      max_points: 1,
      rationale: "Error status is required for accurate error rate calculation"
    },
    {
      id: "R-013",
      name: "exception events recorded",
      priority: "important",
      signal: "traces",
      group: "errors",
      max_points: 1,
      rationale: "Exception details help with debugging and error analysis"
    },

    // Metrics - Resources
    {
      id: "M-001",
      name: "service.name present",
      priority: "critical",
      signal: "metrics",
      group: "resources",
      max_points: 1,
      rationale: "service.name is required to attribute metrics to a service"
    },
    {
      id: "M-002",
      name: "service.version present",
      priority: "important",
      signal: "metrics",
      group: "resources",
      max_points: 1,
      rationale: "service.version enables deployment impact analysis"
    },

    // Metrics - HTTP
    {
      id: "M-003",
      name: "http.server.duration metric present",
      priority: "critical",
      signal: "metrics",
      group: "http",
      max_points: 1,
      rationale: "Request duration is fundamental for performance monitoring"
    },
    {
      id: "M-004",
      name: "http.server.request.size metric present",
      priority: "normal",
      signal: "metrics",
      group: "http",
      max_points: 1,
      rationale: "Request size helps with capacity planning"
    },
    {
      id: "M-005",
      name: "http.server.response.size metric present",
      priority: "normal",
      signal: "metrics",
      group: "http",
      max_points: 1,
      rationale: "Response size helps with bandwidth analysis"
    },

    // Metrics - System
    {
      id: "M-006",
      name: "process.runtime.cpu.usage metric present",
      priority: "important",
      signal: "metrics",
      group: "system",
      max_points: 1,
      rationale: "CPU usage is essential for resource utilization monitoring"
    },
    {
      id: "M-007",
      name: "process.runtime.memory.usage metric present",
      priority: "important",
      signal: "metrics",
      group: "system",
      max_points: 1,
      rationale: "Memory usage tracking prevents out-of-memory issues"
    },
    {
      id: "M-008",
      name: "process.runtime.gc.duration metric present",
      priority: "low",
      signal: "metrics",
      group: "system",
      max_points: 1,
      rationale: "GC metrics help optimize application performance"
    },

    // Logs - Resources
    {
      id: "L-001",
      name: "service.name present",
      priority: "critical",
      signal: "logs",
      group: "resources",
      max_points: 1,
      rationale: "service.name is required to attribute logs to a service"
    },
    {
      id: "L-002",
      name: "service.version present",
      priority: "important",
      signal: "logs",
      group: "resources",
      max_points: 1,
      rationale: "service.version enables deployment correlation"
    },

    // Logs - Correlation
    {
      id: "L-003",
      name: "trace_id present when available",
      priority: "critical",
      signal: "logs",
      group: "correlation",
      max_points: 1,
      rationale: "trace_id enables correlation between logs and traces"
    },
    {
      id: "L-004",
      name: "span_id present when available",
      priority: "important",
      signal: "logs",
      group: "correlation",
      max_points: 1,
      rationale: "span_id provides precise correlation within traces"
    },

    // Logs - Structure
    {
      id: "L-005",
      name: "structured logging used",
      priority: "important",
      signal: "logs",
      group: "structure",
      max_points: 1,
      rationale: "Structured logs enable better searching and analysis"
    },
    {
      id: "L-006",
      name: "log level set appropriately",
      priority: "normal",
      signal: "logs",
      group: "structure",
      max_points: 1,
      rationale: "Proper log levels enable effective filtering"
    },
    {
      id: "L-007",
      name: "timestamp in ISO 8601 format",
      priority: "normal",
      signal: "logs",
      group: "structure",
      max_points: 1,
      rationale: "Standard timestamp format ensures correct chronological ordering"
    },

    // Logs - Content
    {
      id: "L-008",
      name: "no sensitive data in logs",
      priority: "critical",
      signal: "logs",
      group: "content",
      max_points: 1,
      rationale: "Sensitive data in logs creates security and compliance risks"
    },
    {
      id: "L-009",
      name: "error details captured in error logs",
      priority: "important",
      signal: "logs",
      group: "content",
      max_points: 1,
      rationale: "Error details are essential for troubleshooting"
    },
    {
      id: "L-010",
      name: "request/response details in access logs",
      priority: "low",
      signal: "logs",
      group: "content",
      max_points: 1,
      rationale: "Access log details help with usage analysis"
    }
  ]
};