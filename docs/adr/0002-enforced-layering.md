# 0002. Layering is enforced by lint, not by habit

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Rules that rely on people remembering them erode. Code that calls a vendor API from a component works, passes review once, and is then copied.

## Decision

Code is layered `app -> components -> domain -> services -> lib -> external system`. A layer imports only from layers to its right. ESLint boundary rules enforce it, and `scripts/architecture-audit.sh` backs it up with checks lint cannot express.

## Why

- Upward imports create cycles and make vendor details leak into UI.
- A failing check teaches faster than a review comment.
- Business rules in `domain/` stay unit-testable with no mocks.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Convention only, enforced in review | Erodes under deadline pressure. |
| Feature folders with no layers | Duplicate integrations per feature. |

## Consequences

Some code takes an extra hop. Exceptions need an ADR, not an `eslint-disable`. The audit counts `eslint-disable` as a finding.

## Security impact

Secrets and vendor clients stay in server-only layers.

## Performance impact

Neutral. Server Components fetch through services, which keeps client bundles small.

## Operational impact

CI fails on a boundary violation, so drift is caught before merge.

## Development impact

New code has an obvious home, listed in [`repository-workflow.md`](../repository-workflow.md).

## Migration

Add the boundary rules to `eslint.config.mjs`, then fix violations layer by layer.

## Related decisions

[0001](./0001-source-of-truth-boundaries.md)
