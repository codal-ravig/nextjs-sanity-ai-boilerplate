---
name: "Architecture instructions"
description: "Layering, module boundaries, and where code belongs."
applyTo: "src/**"
paths:
  - "src/**"
---

# Architecture Instructions

Full context: [`docs/architecture.md`](../../docs/architecture.md).

## Layering

```
app / components  →  domain  →  services  →  lib  →  external system
```

Dependencies flow **one way**. A lower layer never imports a higher one. This is enforced by ESLint `no-restricted-imports`; a violation fails the build.

| Layer | Does | Never |
| --- | --- | --- |
| `app/` | Routes, layouts, route handlers. Composes. | Business logic or direct external calls inline |
| `components/` | Renders props. | Fetches, or imports a vendor client/service |
| `domain/` | Business rules, use cases. | React, `next/headers`, vendor clients |
| `services/` | Talks to external systems. Maps to app-shaped types. | Imports UI |
| `lib/` | Vendor clients, config, cross-cutting concerns. | Imports a higher layer |

## Where does this code go?

| If it... | It belongs in |
| --- | --- |
| Calls an external system (CMS, API, SaaS) | `services/` |
| Is a business rule or multi-service use case | `domain/` |
| Is a route, layout, or route handler | `app/` |
| Renders UI from props | `components/` |
| Is a vendor client, config, or cross-cutting concern | `lib/` |
| Describes a shape used across layers | `types/` |

If `lib/` needs something from `services/`, the code belongs in `services/`.

## Service boundaries

- Each external system is reached through **exactly one** service module.
- Services return **app-shaped types**, never raw upstream responses, so an upstream shape change is absorbed at the boundary rather than across pages.
- A new integration gets its own module under `services/` with a thin adapter interface, never scattered `fetch` calls.
- **Every service reader is wrapped in React `cache`** so repeated calls within one render collapse into one request. See below.

## Request-scoped deduplication

A render calls the same data more than once by design: `generateMetadata` and the component body, the layout and the page. Wrap every reader:

```ts
import { cache } from "react";

export const getGlobalSeo = cache(async (): Promise<GlobalSeo | null> =>
  sanityFetch({ ... }),
);
```

This is **not** the same as cache tags. `cache` deduplicates within one request; tags prevent re-fetching between requests. Both are needed. Record the decision in an ADR under [`docs/adr/`](../../docs/adr/).

Two constraints:

- **Arguments are compared by identity**, so an array or object argument never produces a hit. A reader taking a list of IDs has to normalize to a string key before it can memoize. Wrap a list reader only once you have given it a stable string key.
- **Only wrap pure readers.** Never a mutation.

## Source of truth

Before adding a field, ask **"who owns this data?"** (the commerce or business platform, the CMS, the search index, the identity provider, an enterprise back-office system, a marketing tool, or the app). If unclear, **stop and resolve it before writing code**. See [`docs/architecture.md`](../../docs/architecture.md).

Never recreate synchronization that an upstream system already performs. Each external platform stays the source of truth for its own domain, and the app orchestrates.

## Naming by layer

Full standard: [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

| Layer / kind | File casing | Notes |
| --- | --- | --- |
| Route dirs / reserved files | `kebab-case/` dirs, lowercase `page.tsx` etc. | URL comes from the directory name |
| `components/` | `PascalCase.tsx` | Named exports; file name matches component |
| `hooks/` | `camelCase.ts`, `use` prefix | Filename matches the exported hook (`useAuth.ts`) |
| Server Actions | `camelCase` + `Actions` suffix, or an `actions/` folder | `"use server"` on the module |
| `services/` | `PascalCase`/`camelCase` + `Service` suffix | Wraps an external SDK/context; maps to app-shaped types |
| `lib/` utils | `camelCase.ts` | Plural for a group (`formatters.ts`), verb for one purpose (`formatDate.ts`) |
| `lib/config/` constants | `camelCase.ts` files | Scalars `UPPER_SNAKE_CASE`; read-only dicts `PascalCase` |
| `types/` | `camelCase.ts` | Type names `PascalCase`, no `I` prefix |

## Imports

Use the `@/` alias for internal modules. No deep relative paths (`../../..`).

## Anti-patterns to reject in review

- A `fetch` to an external host outside `services/`/`lib/`.
- Business logic in JSX, an event handler, or a page component.
- A `utils.ts` grab-bag of unrelated helpers. Split by domain.
- A second client for an already-integrated system.
- Circular imports between layers.

## Blocking conditions

Four of the Validation Gate's merge blockers are architectural. They are restated here rather than linked, because a reviewer reading this file does not open [`.github/rules/validation-gate.md`](../rules/validation-gate.md).

Do not approve or merge a change where any of these holds:

| Condition | What actually catches it |
| --- | --- |
| Source-of-truth ownership for a new field is unresolved | **Review only.** No tool checks this. Resolve it before the code is written, not after. |
| A side-effecting call is retried blindly | Partly mechanical. A retry helper should refuse any method other than GET or HEAD. A hand-rolled retry loop, or a timeout handler that resubmits, is review only. A timeout means **unknown**, never **failed**. |
| A boundary rule was disabled globally to unblock one call site | Partly mechanical. An architecture audit can fail on any `eslint-disable` in `src/`. Weakening a rule by editing `eslint.config.mjs` itself shows up only as a diff to that file, so read that diff. |
| `any` was introduced | Mechanical. ESLint `@typescript-eslint/no-explicit-any`, error, across all of `src/`. |

When a check fires, fix the cause. Do not add an `eslint-disable`, widen a type, or delete the check. If a check is genuinely wrong for a new case, change it deliberately and say why in the PR, which is a different act from silencing it.
