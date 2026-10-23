---
name: "Testing instructions"
description: "What to test, in what order, and the failure scenarios that are mandatory."
applyTo: "src/**/*.test.ts,src/**/*.test.tsx,e2e/**"
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "e2e/**"
---

# Testing Instructions

Vitest + Testing Library for unit and integration; Playwright for E2E. CI runs lint, typecheck, tests and a build on every PR.

Run `pnpm validate` before opening a PR. See [`testing-rules.md`](../rules/testing-rules.md) and [`vitest-test-agent.md`](../rules/vitest-test-agent.md).

## Priority when time is short

1. **Anything touching money, entitlement or access**: amounts, permissions, authorization, cache isolation.
2. **Idempotency and retry paths.** They only execute during incidents, which is exactly when you cannot debug them.
3. **Mapping at service boundaries**, where upstream shape changes bite.
4. Presentational components.

## Unit tests

Domain logic first: business rules, policies, mapping. Test **behaviour, not implementation**. A refactor preserving behaviour must not break the test.

## Integration tests

Mock the external system; test **our** contract handling.

| Boundary | Test that... |
| --- | --- |
| **Third-party API** | Responses map to app types; errors map to `AppError`; retry applies to idempotent reads only |
| **Sanity** | Missing documents and unresolved references degrade gracefully; draft vs published perspective selection |
| **Search service** | Index resolution is correct per account; a hit yields an ID and authoritative data comes from the owning system |
| **Inbound webhooks** | Auth accepts the documented header forms and **fails closed** when the secret is unset; processing is exactly-once; an unconfigured integration is a no-op |
| **Auth** | Session handling, account switching, server-side permission enforcement |

## Failure scenarios (mandatory)

Not optional extras. This is where real damage happens:

- API failure and **timeout**, especially a timeout _after_ the downstream system processed the request, which must not be treated as "did not happen".
- Invalid or malformed upstream responses.
- Missing CMS content and unresolved references.
- Authentication failure and **authorization failure**: verify the _server_ rejects, not merely that the UI hides.
- **Duplicate submission** and impatient user retry.
- An integration outage during a critical flow, which must not surface raw errors to the user.
- **Cache isolation**: an account-specific response must never be served to another account.

## Conventions

- Colocate unit tests as `*.test.ts` beside their subject.
- Mock all external services. Never hit a real third-party endpoint in a unit or integration test.
- Tests are independent, with no shared mutable state.
- **Never commit real credentials, tokens, personal data or payment data** in a fixture. A fixture is committed, searchable and shared.
- A regression test is required for every bug fix.
- No flaky tests: fix or delete.

## E2E

Cover full user journeys plus error paths on anything involving money or access. Maintain the list of critical journeys for your project, for example: sign-in and registration, the primary conversion path, content discovery, the account area, and any audience-specific content or access rules. Replace this list with yours in `e2e/README.md`.

## Anti-patterns to reject in review

- A test that asserts implementation details and breaks on a behaviour-preserving refactor.
- A unit test that calls a real external endpoint.
- A fixture containing real credentials or personal data.
- A bug fix with no regression test.
- A timeout, duplicate-submission or authorization path with no test.
- A flaky test left in place.
