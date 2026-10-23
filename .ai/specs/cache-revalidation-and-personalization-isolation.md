# Cache revalidation and personalization isolation

> **Status (YYYY-MM-DD):** Retrospective example. Replace with the specifics of your project. Captures the rule that per-user data never shares a cache entry with another user.

## Goal

Pages are fast because shared data is cached. They are also correct and private because anything specific to a user is kept out of shared cache entries.

## Source of truth

| Data | Owner | Where the code reads it |
| --- | --- | --- |
| Shared content | Sanity | Cached with `"use cache"` and entity tags |
| Per-user data | Your data or identity API | Read at request time, or cached with the user in the key |

## Behaviour

1. Shared reads use `"use cache"`, a `cacheLife` profile and one `cacheTag` per entity.
2. Per-user parts of a page sit inside `<Suspense>` and render at request time.
3. If per-user data is cached at all, the user or account identifier is part of the cache key, through one helper.
4. A verified webhook calls `revalidateTag` for the entities that changed.

## Invariants

- Cookies and headers are read outside `"use cache"` and passed in as narrow arguments.
- A personalized response never reuses a key another user can produce.
- Only one helper builds per-user cache keys, so the rule is auditable in one place.
- Revalidation endpoints authenticate the caller before doing anything.
- A missing user context means no personalized result, never someone else's.

## Failure scenarios

| Scenario | Expected behaviour |
| --- | --- |
| User identifier missing when building a key | Skip the cache, render at request time. |
| Revalidation request unauthenticated | Reject with 401. |
| Webhook storm | Tags are revalidated once each, work is bounded. |

## Security

A personalized response that shares a key with another user is a data disclosure, not a caching bug. Treat it with that severity in review.

## Accessibility

Loading states for streamed parts are announced politely and do not shift layout.

## Acceptance criteria

- [ ] A test proves two users get different cache keys for the same query.
- [ ] A test proves an unauthenticated revalidation call is rejected.
- [ ] The architecture reviewer has checked every new `"use cache"` for per-user inputs.

## Out of scope

CDN configuration and browser caching headers. See `docs/adr/0003-caching-and-personalization.md`.
