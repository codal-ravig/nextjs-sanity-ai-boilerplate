# Architecture Decision Records

An ADR records one decision: the context, what was chosen, why, and what it costs. Code shows what the system does. An ADR shows why, so a later change does not undo a decision by accident.

## Index

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](./0001-source-of-truth-boundaries.md) | One owner per kind of data | Accepted |
| [0002](./0002-enforced-layering.md) | Layering is enforced by lint, not by habit | Accepted |
| [0003](./0003-caching-and-personalization.md) | Cache shared data, isolate personalized data | Accepted |
| [0004](./0004-ai-configuration-architecture.md) | `AGENTS.md`, symlinks, hooks, and AI never commits | Accepted |

Sanity-specific decisions live in [`sanity/`](./sanity/README.md).

## When to write one

- A choice that is expensive to reverse: a vendor, a data owner, a rendering model.
- A decision where reasonable people disagreed.
- A deliberate deviation from a standard in this repository.
- A security or compliance trade-off.

Do not write one for a routine implementation choice. A short comment or a spec is enough.

## Deviating from a standard

If a change must break a rule from `docs/` or `.github/`, do not disable the check quietly. Write an ADR that names the rule, the reason, the scope of the exception and when it ends. Link it from the code that deviates.

## Process

1. Copy [`_template.md`](./_template.md) to `NNNN-short-title.md`, using the next number.
2. Set the status to `Proposed` and open it in a pull request.
3. Discuss in the pull request. Change the status to `Accepted` when merged.
4. Never rewrite an accepted ADR to change its decision. Write a new one, set the old status to `Superseded by NNNN`, and link both ways.
5. Add the row to the index above.

Statuses: `Proposed`, `Accepted`, `Deprecated`, `Superseded by NNNN`.
