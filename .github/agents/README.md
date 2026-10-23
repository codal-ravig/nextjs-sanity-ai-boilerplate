---
name: reviewer-agents-index
description: "Index of the reviewer agents. Documentation, not an agent to invoke."
user-invocable: false
---

# Reviewer agents

Conceptual review roles. Each names what it checks and what blocks a merge.

**Start with the [Orchestrator](./orchestrator.md).** It routes a change to the smallest appropriate reviewer set. Running everything on a typo trains people to ignore review output; running nothing on a payment or authorization change loses money or leaks data.

| Agent | Covers |
| --- | --- |
| [Orchestrator](./orchestrator.md) | Selects reviewers; escalates ambiguity to a human |
| [Architecture](./architecture.md) | Boundaries, source of truth, duplicate integrations |
| [Security](./security.md) | Secrets, authz, input validation, webhooks, cache isolation |
| [Integration](./integration.md) | External-system contracts: idempotency, retries, payload minimization, webhooks |
| [Content](./content.md) | Sanity: TypeGen, GROQ, Portable Text, images, preview |
| [Performance](./performance.md) | RSC boundary, waterfalls, caching, images, bundle |
| [Testing](./testing.md) | Coverage of risk, mandatory failure scenarios |
| [Code Review](./code-review.md) | Correctness, maintainability, conventions |

Every change also passes the [Validation Gate](../rules/validation-gate.md).

## Reviewers and process agents

The files in the table above are the **domain reviewers**. They cover this system's boundaries: source-of-truth ownership, external-system contracts, the content/data split, and entitlement and cache isolation.

Security, Testing and Performance each previously had a second, ticket-driven `*-agent.md` file. Those were **merged into the reviewers**: OWASP categories, coverage guidance, performance budgets, edge-case lists and output formats now live in the reviewer itself. One file per role, so there is no question about which to read and no chance of a rule living only in the copy nobody opened.

The remaining `*-agent.md` files (`review-agent.md`, `context-collector-agent.md`, `prompt-quality-agent.md`) cover process the reviewers do not (gathering ticket context, scoring a prompt before work begins, validating acceptance criteria) and are still used for that.

[`spec.md`](./spec.md) is the fourth process agent, and the only one that writes rather than reviews. It turns a requirement into a specification under `.ai/specs/` and owns that directory's conventions: the dated status line every spec opens with, and the per-task status markers. It is deliberately absent from the reviewer table above, because it runs before implementation rather than over a diff.

## Supporting material

| Location | Contains |
| --- | --- |
| [`.github/instructions/`](../instructions/) | File-scoped coding instructions, applied by `applyTo` glob |
| [`.github/rules/`](../rules/) | Enforcement rules and the validation gate |
| [`docs/architecture.md`](../../docs/architecture.md) | System architecture |
| [`docs/adr/`](../../docs/adr/) | Decisions and their reasoning |
