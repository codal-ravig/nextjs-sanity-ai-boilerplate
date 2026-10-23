---
name: "Logging instructions"
description: "Structured logging, error tracking, and observability conventions for Server Actions."
applyTo: "src/app/**/actions.ts"
paths:
  - "src/app/**/actions.ts"
---

# Logging Instructions

> **Superseded for most paths.** The authoritative guidance is [`observability.instructions.md`](./observability.instructions.md), which covers `src/lib/observability/`, `src/services/` and `src/app/api/`. This file remains only for Server Actions and is kept consistent with it.
>
> The logger lives at `@/lib/observability/logger` and takes `logger.info("message", { field })`, message first.

## Purpose

Consistent, structured logging so production issues (a failed form submission, a broken content sync) are diagnosable without guesswork.

## Structured logging

- Log a message plus structured fields (`logger.info("Profile updated", { userId })`), not bare interpolated strings. Logs must be machine-parseable and filterable in the aggregation tool (for example Datadog, CloudWatch, or the hosting platform's log drain).
- Every log line includes a stable, searchable message (the logger's signature is `(message, context?)`; the message is what you filter on), relevant IDs in the context object (user ID, document ID, never full PII), and enough context to reproduce without needing to grep for surrounding lines. Each record also carries `level` and `timestamp`, plus `correlationId` when logged through `logger.withCorrelationId(id)`.
- Use the shared logger from `@/lib/observability/logger`. No ad hoc `console.log` in committed server-side code. `no-console` enforces this.

## Log levels

- `error`: the operation failed and needs attention (unhandled upstream 5xx, unexpected exception).
- `warn`: degraded but recovered (retry succeeded after one failure, fallback path taken, rate limit approaching).
- `info`: significant business events worth tracking (a form submitted, a publish revalidated), not every function call.
- `debug`: verbose detail useful in development/troubleshooting; stripped or filtered out of production log volume by default.
- Don't log expected, user-facing validation errors (invalid form input) at `error` level. That is normal traffic, not a system fault. Reserve `error` for things an on-call engineer should look at.

## What never gets logged

- No passwords, auth tokens, session cookies or payment data, ever, at any log level, including in error stack traces or request dumps. See [`security.instructions.md`](./security.instructions.md).
- No full personal data (full name, address and email together) in routine operational logs. Log opaque IDs and look up details from the system of record when investigating, rather than duplicating PII into logs.
- Don't log full request/response bodies from third-party calls by default. Log status, duration, and a normalized error, with full-payload debug logging gated behind an explicit, temporary debug flag.

## Error tracking

- Unexpected exceptions in route handlers, Server Actions, and services are reported to the error-tracking tool (for example Sentry) with enough context (route, resource ID, upstream status code) to triage without reproducing locally.
- Client-side errors (React error boundaries, unhandled promise rejections in Client Components) are captured the same way. A production bug isn't "handled" just because it only breaks client-side.
- Group and tag errors by feature area so alerting and dashboards can be scoped meaningfully.

## Observability for critical paths

- Instrument the primary conversion path and any side-effecting flow with timing/latency metrics, not just pass/fail logs. A slow-but-succeeding flow is a leading indicator of a future outage.
- Log (at `info`) key funnel steps with stable messages and a correlation ID (`logger.withCorrelationId`) so a single attempt can be traced end to end across services.

## Anti-patterns to reject in review

- `console.log`/`console.error` left in committed `services/`, route handler, or Server Action code.
- Logging a raw upstream error object (which may contain sensitive headers/tokens) instead of a sanitized, normalized error.
- Credentials or payment data appearing in any log line.
- Business-critical failures logged at `info`/`warn` instead of `error`.
