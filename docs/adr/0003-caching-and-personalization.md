# 0003. Cache shared data, isolate personalized data

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Next 16 Cache Components make it easy to cache. They also make it easy to cache the wrong thing: a response that depends on the signed-in user, stored under a key anyone can hit.

## Decision

- Shared data is cached with `"use cache"`, a `cacheLife` profile and entity `cacheTag`s, and revalidated by tag from a verified webhook.
- Per-user data is never inside a shared cache entry. It renders at request time inside `<Suspense>`, or is cached with the user or account identifier in the key, built by one helper.
- Cookies and headers are read outside `"use cache"` and passed in as narrow arguments.

## Why

A personalized response served to another user is a data disclosure. Tag-based revalidation keeps content fresh without short TTLs that waste origin work.

## Alternatives considered

| Option | Why not |
| --- | --- |
| No caching of anything | Slow, expensive, poor Core Web Vitals. |
| Cache everything with short TTLs | Stale content and still risky for personalized data. |
| Trust each author to remember | This is exactly how disclosures happen. |

## Consequences

Every new `"use cache"` is reviewed for per-user inputs. Tag names are a vocabulary that must stay consistent. See [`sanity/caching-and-revalidation.md`](../sanity/caching-and-revalidation.md).

## Security impact

Prevents cross-user disclosure. Revalidation endpoints authenticate the caller.

## Performance impact

Static shell plus streamed dynamic parts improves LCP and time to first byte.

## Operational impact

A webhook failure delays freshness but does not break pages. Monitor webhook delivery.

## Development impact

Authors decide the strategy per route. The skills `next-cache-components-adoption` and `next-cache-components-optimizer` help.

## Migration

Audit existing cached functions for cookie or header reads, then add tags.

## Related decisions

[0001](./0001-source-of-truth-boundaries.md), [`.ai/specs/cache-revalidation-and-personalization-isolation.md`](../../.ai/specs/cache-revalidation-and-personalization-isolation.md)
