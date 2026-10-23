# Feature flags

> **Status (YYYY-MM-DD):** Intended example. Describes how flags should work. Adjust to your flag provider before building.

## Goal

Ship code dark, turn it on per environment, and turn it off quickly, without a deploy where possible.

## Source of truth

| Data | Owner | Where the code reads it |
| --- | --- | --- |
| Flag values | Environment variables or a flag service | One module, `src/lib/feature-flags/` |
| Editorial toggles | Sanity | Content service, only for content-level switches |

## Behaviour

1. Each flag is declared once, with a name, a default and a short description.
2. Flags are read on the server. A client receives only the resolved value it needs.
3. A flag has an owner and a removal date. Finished flags are deleted, not left in.

## Invariants

- A flag is never the only thing enforcing a security or payment property. Authorization stays in code.
- An unset flag takes its documented default, and the default is the safe one.
- Flag names in code, config and docs are identical.
- Flags that change behaviour are covered by a test in both states.

## Failure scenarios

| Scenario | Expected behaviour |
| --- | --- |
| Flag service unreachable | Use the default. Do not fail the request. |
| Value is not a valid boolean | Treat as the default and log once. |

## Security

Flag values may reveal unreleased work, so do not expose the full set to the browser. Do not put secrets in flag values.

## Accessibility

A flagged UI must meet the same accessibility bar in both states.

## Acceptance criteria

- [ ] Every flag is listed in one place with owner and removal date.
- [ ] Both states have a test.
- [ ] Removing a flag leaves no dead branch behind.

## Out of scope

Percentage rollouts and experimentation platforms.
