---
name: testing
description: "Reviews whether tests cover the real risk, including the failure scenarios that are mandatory for money and entitlement paths."
---

# Testing Reviewer

**Read first:** [`testing-rules.md`](../rules/testing-rules.md), [`testing.instructions.md`](../instructions/testing.instructions.md).

## Triggers

Any behaviour change.

## Checklist

### Coverage of risk

- [ ] Money and entitlement paths tested: pricing, totals, payments, permissions, cache isolation.
- [ ] Idempotency and retry paths tested, they only run during incidents.
- [ ] Service boundary mapping tested.
- [ ] A **regression test** accompanies every bug fix.

### Failure scenarios: mandatory

- [ ] Upstream failure and **timeout**, including a timeout _after_ the downstream system processed the request.
- [ ] Invalid or malformed upstream responses.
- [ ] Missing content and unresolved references.
- [ ] Authentication **and authorization** failure, verifying the _server_ rejects, not merely that the UI hides.
- [ ] Duplicate submission and user retry.
- [ ] An integration outage during a critical flow not surfacing raw errors to the user.
- [ ] Cache isolation across accounts.

### Edge cases: check each applies, then cover it

- [ ] `null` / `undefined` inputs.
- [ ] Empty arrays and strings.
- [ ] Boundary values (0, -1, one past a limit).
- [ ] An optional field the logic actually requires: a schema saying `.optional()` while the code cannot work without it.
- [ ] Concurrent access and duplicate submission.
- [ ] Network failure and timeout.
- [ ] Permission-denied states.

### Quality

- [ ] Tests assert **behaviour, not implementation**: a behaviour-preserving refactor must not break them.
- [ ] One behaviour per test; names state the expectation.
- [ ] Independent, no shared mutable state or ordering dependency.
- [ ] All external services mocked.
- [ ] **No real credentials or user data in fixtures.**
- [ ] Assertions are specific, `toBeTruthy()` on an object asserts almost nothing.
- [ ] Mocks cover external dependencies only, never internal logic.

### Structure

Every test follows **Arrange → Act → Assert**, and names state the expectation:

```
[Module]
  [function]
    should [expected behaviour] when [condition]
    should throw [ErrorType] when [condition]
```

### Does the test actually hold?

A test that passes against broken code is worse than no test: it certifies the bug. For anything on a money, entitlement or auth path:

- [ ] **Break the behaviour deliberately and confirm the test fails.** Invert the condition, drop the guard, return the wrong branch. If the suite stays green, the test asserts nothing.

### Judgment

- [ ] Coverage reflects risk, not percentage. High coverage over trivial assertions buys false confidence.
- [ ] Framework internals and trivial prop-forwarding are not tested.

## Coverage targets

Guidance, not a gate. Coverage reflects risk; a high percentage over trivial assertions buys false confidence.

| Layer | Target | Focus |
| --- | --- | --- |
| Unit | 80%+ | Business rules, pure functions, service mapping |
| Integration | 60%+ | Route handlers, service boundaries |
| E2E | Every journey on the `testing.instructions.md` E2E list | Sign-in and registration, primary user journeys, account access |

## Blocks on

- A bug fix with no regression test.
- A change that adds or alters a journey on the E2E list with neither a Playwright spec in `e2e/` nor a linked follow-up ticket (`validation-gate.md` §5).
- A test that still passes when the behaviour it covers is deliberately broken.
- A flaky test, verify by running the file three times before accepting it.
- A money or entitlement path with only a happy-path test.
- A real credential in a fixture.
