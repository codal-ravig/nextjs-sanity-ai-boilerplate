# Vitest Test Generation

> How tests are written in this repository. For what to test and when a change is blocked, [`testing-rules.md`](./testing-rules.md) and [`.github/agents/testing.md`](../agents/testing.md) are authoritative; this file covers mechanics only.

Adjust the paths and names below to match your project. Keep the file true: a testing guide that describes a setup you do not have is worse than none.

## Setup

Configuration lives in **`vite.config.ts`** (or `vitest.config.ts`), using `defineConfig` from `vitest/config`:

- Environment is **jsdom**.
- Tests are `src/**/*.{test,spec}.{ts,tsx}`. `e2e/**` is excluded and belongs to Playwright, which is a separate suite.
- `@` resolves to `src/`.
- **`server-only` is aliased to a no-op mock module**, so a module carrying the `server-only` marker can still be imported in a test.

```bash
corepack pnpm test         # one run, what CI and the pre-commit hook use
corepack pnpm test:watch   # watch mode
```

## Where tests live

**Colocated beside the file under test**, as `<name>.test.ts`. There is no `__tests__` directory and no shared test-utils module.

Tests concentrate where the risk is: services, route handlers, transport and auth code, and domain rules. That distribution is deliberate and worth matching. Components stay thin, so rendering tests are the exception rather than the rule.

## What is actually tested

**Mostly pure functions and service logic, not rendered components.** Business rules live in `domain/` and `services/`, which is where a test earns its keep.

When you write a rendering test, use `@testing-library/react` and query by role and accessible name, not by `data-testid`. That follows the behaviour-over-implementation rule both authoritative documents state.

## Keeping tests in step with the code

Tests are updated in the same change as the code, never left for later. A bug fix without a regression test is incomplete, per the Validation Gate.

**Failure scenarios are mandatory** for anything touching money, entitlement or an external boundary. A timeout is not a failure, it is an unknown; a retried write can duplicate a side effect; a fail-soft default that reads as "permitted" is worse than an error.

Test the real call path, not just the function in isolation. A swapped-argument bug can survive because the unit test calls the function correctly while the real call sites do not. Where a signature takes several same-typed parameters, assert on what actually leaves the process, such as the outbound URL and headers.

## Mocking

Use `vi.mock` for module boundaries and `vi.fn` for individual functions. Mock at the edge you own, which usually means the service or transport module, not a vendor SDK's internals.

Do not mock what you are trying to prove. A test that mocks the service it is testing asserts only that the mock was configured.

Timers (`vi.useFakeTimers`) and the clipboard both need explicit setup and teardown; restore them in an `afterEach` so one test cannot leak into the next.

## Coverage

`@vitest/coverage-istanbul` (or v8) is available. **Coverage is a diagnostic, never a gate.** No percentage blocks a merge. Use it to find untested branches worth testing, not to hit a number.
