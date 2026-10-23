# Testing Rules

Detail: [`testing.instructions.md`](../instructions/testing.instructions.md).

## Hard requirements

1. `pnpm validate` (lint + typecheck + test + architecture audit) passes before a PR opens.
2. A **regression test** accompanies every bug fix.
3. Failure scenarios are covered for anything touching money, entitlement, or an external boundary, not just the happy path.
4. No real credentials, tokens, user data or card numbers in fixtures.
5. All external services are mocked. No test hits a live third-party endpoint.
6. Tests are independent, no shared mutable state, no ordering dependency.
7. No flaky tests. Fix or delete; a quarantined flake is a test nobody trusts.

## Coverage

Coverage is a diagnostic, not a target. A high percentage over trivial assertions is worse than lower coverage over the paths that matter, because it buys false confidence.

Judge by risk instead:

| Must be tested               | Why                                          |
| ---------------------------- | -------------------------------------------- |
| Pricing, totals, entitlement | Wrong values cost money or leak access       |
| Idempotency and retry paths  | Only execute during incidents                |
| Auth and authorization       | Failures are breaches                        |
| Cache isolation              | A shared key across accounts is a disclosure |
| Service boundary mapping     | Where upstream changes bite                  |

## Structure

- Arrange / Act / Assert, with the arrangement visible in the test itself.
- One behaviour per test. A test asserting five things reports one failure.
- Test names state the expected behaviour: `"rejects every request when no secret is configured"`, not `"test auth"`.
- **Test behaviour, not implementation.** A refactor preserving behaviour must not break tests.

## What not to test

- Framework behaviour or third-party library internals.
- Trivial getters, or a component that only forwards props.
- Implementation details: private functions, call counts on internal helpers, exact DOM structure where semantics are what matter.
