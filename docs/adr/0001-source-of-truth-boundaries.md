# 0001. One owner per kind of data

- Status: Accepted
- Date: YYYY-MM-DD

## Context

A composable site combines several systems: a CMS, a commerce or data API, search, identity and marketing tools. When two of them hold the same data, they drift, and the fix is usually a rewrite.

## Decision

Each kind of data has exactly one owning system, listed in [`docs/architecture.md`](../architecture.md) section 3. The storefront reads from the owner, caches carefully, and keeps no second writable copy. Sanity owns editorial content.

## Why

- Drift between copies is the most expensive bug in a composable build.
- Clear ownership makes security reviewable: you know where to verify a claim.
- It keeps each platform doing what it is good at.

## Alternatives considered

| Option | Why not |
| --- | --- |
| Mirror data into the CMS for convenience | Two writers, silent divergence. |
| Let each feature decide its own source | Inconsistent behavior, repeated integrations. |

## Consequences

Some pages need several reads. Cache and composition handle that. A new field starts with the question "who owns this?", and the answer is written down before code.

## Security impact

Verification of ownership and authorization happens against the owner, never against a client-supplied value.

## Performance impact

Reads are cached by tag. No extra sync jobs.

## Operational impact

When a system is down, the failure mode is documented per flow.

## Development impact

One service module per system under `src/services/`.

## Migration

Fill in the ownership table, then audit existing code for second copies.

## Related decisions

[0002](./0002-enforced-layering.md), [0003](./0003-caching-and-personalization.md)
