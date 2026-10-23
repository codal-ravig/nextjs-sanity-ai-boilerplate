---
name: "Observability instructions"
description: "Structured logging, correlation IDs, redaction, and what to monitor."
applyTo: "src/lib/observability/**,src/services/**,src/app/api/**"
paths:
  - "src/lib/observability/**"
  - "src/services/**"
  - "src/app/api/**"
---

# Observability Instructions

## Use the logger

All server-side logging goes through `lib/observability/logger.ts`. A bare `console.log` bypasses redaction and correlation IDs, so `no-console` is configured as `["error", { allow: ["warn", "error"] }]` across `src/`. `console.log` therefore fails lint everywhere; `console.warn` and `console.error` stay available, because Client Components cannot import the `server-only` logger. Exempt modules are listed in `eslint.config.mjs`, each for a stated reason: the logger itself and browser-only modules.

Server-side code that _can_ reach the logger should use it even for a warning. The allowance exists for the browser, not as a shortcut.

```ts
import { logger } from "@/lib/observability/logger";

logger.withCorrelationId(id).info("Document published", { documentId });
```

## Correlation IDs

Every request that crosses a service boundary carries one, propagated as `X-Correlation-Id`. This is what makes a single user's request traceable across Next.js and every upstream system during an incident.

**Prefer propagating an inbound correlation ID** over minting a new one. A new ID breaks the trace at exactly the hop you need to follow.

## What to log

| Log | Never log |
| --- | --- |
| Identifiers (document ID, account ID) | Personal data |
| Outcomes and status codes | Tokens, secrets, credentials |
| Timing and retry attempts | Full request payloads |
| Error kinds and upstream codes | Payment data |
| Correlation IDs | Unpublished CMS content |

The logger redacts a deny-list of key names as a **backstop**, not a licence. The rule remains: do not log sensitive data in the first place. Redaction catches the accident, such as a token nested three levels inside an object someone spread into a log call.

## Levels

- `debug`: development detail.
- `info`: meaningful state transitions (content revalidated, job completed).
- `warn`: recoverable degradation (retry, fallback taken).
- `error`: a failure needing attention.

An expected outcome is not an error. A missing CMS document that renders a 404 is `info` at most; logging it as `error` trains people to ignore errors.

## What to monitor

External API failure rates and latency, revalidation failures, webhook failures, search failures, authentication failures, and failures on the primary conversion path.

**Never include secrets in telemetry.**

## Anti-patterns to reject in review

- `console.log` in server code instead of the shared logger.
- A new correlation ID minted where an inbound one was available.
- A request body, token or personal data passed into a log call.
- An expected 404 logged at `error`.
