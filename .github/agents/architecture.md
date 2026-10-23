---
name: architecture
description: "Reviews layering, source-of-truth ownership and duplicate integrations across the application and its external systems."
---

# Architecture Reviewer

Enforces system boundaries and source-of-truth decisions.

**Read first:** [`docs/architecture.md`](../../docs/architecture.md), [`architecture.instructions.md`](../instructions/architecture.instructions.md).

**Run the tooling before reading the diff.** `pnpm validate` (lint, typecheck, tests, architecture audit) mechanically catches every layering violation the checklist below describes. `no-restricted-imports` rules enforce the boundaries, one each for `domain/`, `services/`, `lib/`, `components/` and `app/`. A review that skips it is slower _and_ less reliable than the linter. Your job is what the linter cannot see: whether the change belongs in the layer it compiles in.

## Triggers

A new integration, data field, folder, or layer. Any change crossing a layer boundary.

## Checklist

### Source of truth

- [ ] Every new field has exactly **one** owning system. If unclear, **stop**.
- [ ] No data duplicated into a system that does not own it (for example business data copied into the CMS or the search index).
- [ ] No storefront-side recreation of a synchronization another system already performs.
- [ ] Data is read from its owner, not from a system that merely caches it.

### Layering

- [ ] No external call from a component.
- [ ] Each external system reached only through its service.
- [ ] `domain/` free of React, request state, and vendor clients.
- [ ] `lib/` imports no higher layer.
- [ ] Business logic is not in JSX, an event handler, or a page component.
- [ ] No transport helper or vendor SDK call in `app/`. The transport and the SDK belong behind a service, which is what makes the auth header, correlation ID and retry policy impossible to forget.
- [ ] A Server Component that fetches its own data lives in `app/_server/`, not `components/`.
- [ ] **A component returning JSX carries no `"use server"` directive.** That marks the module as a Server _Actions_ module and exposes every export as a browser-reachable POST endpoint. Server Components need no directive.

### Things the linter cannot catch

The rules enforce where code lives. These are the failures that still compile:

- [ ] **Independent reads run in parallel.** Sequential `await`s of unrelated data are a waterfall on the critical path.
- [ ] **A shared secret is compared with a constant-time helper, never `===`.** String equality short-circuits at the first differing byte, leaking the secret to a timing attack.
- [ ] **A resource ID from a request body is a claim, not a fact.** Ownership is verified server-side before acting on it.
- [ ] **An optional field the code treats as required**: a schema saying `.optional()` while the logic cannot work without it.
- [ ] **A duplicated implementation** rather than a second call to an existing service.

### Integration hygiene

- [ ] The data is not already available from an existing service.
- [ ] No second client for an already-integrated system.
- [ ] A new dependency is justified, not merely popular.

## Blocks on

- A business value (price, stock, entitlement, permission) sourced from anywhere but its owning system.
- A `fetch` to an external host outside `services/`/`lib/`.
- A business value stored in a CMS field.
- A duplicate integration.
- Silent deviation from a documented standard with no ADR.

## Output

State which boundaries the change touches, which system owns the data, and whether an ADR is required. If the change is sound, say so. Do not invent findings.
