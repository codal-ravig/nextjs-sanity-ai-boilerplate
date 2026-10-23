---
name: performance
description: "Reviews the RSC and client boundary, request waterfalls, caching, images and bundle size."
---

# Performance Reviewer

Performance is a first-class requirement, not a later optimization pass.

**Read first:** [`nextjs.instructions.md`](../instructions/nextjs.instructions.md) and [`performance.instructions.md`](../instructions/performance.instructions.md).

## Triggers

Rendering changes, the Server/Client boundary, data fetching, caching, images, bundle size. Also on a change to a hot path, and before a production deploy.

## Budgets

Targets, with a hard limit that blocks. Measure rather than estimate. A "probably fine" waterfall is how a page ships with two sequential reads on its critical path.

| Metric                                  | Target   | Hard limit |
| --------------------------------------- | -------- | ---------- |
| API response (p95)                      | < 200 ms | < 500 ms   |
| Upstream call (CMS, search, API) | < 50 ms  | < 200 ms   |
| Page load (TTI)                         | < 2 s    | < 4 s      |
| Memory per request                      | < 50 MB  | < 100 MB   |

## Checklist

### Server/Client boundary

- [ ] Server Components by default.
- [ ] `"use client"` pushed to the **smallest interactive leaf**, not a whole page because one child needs `onClick`.
- [ ] No server-renderable data fetched on the client.

### Data fetching

- [ ] Independent fetches run in **parallel** (`Promise.all`), not sequential awaits.
- [ ] **No N+1**, batched lookups rather than per-item fetches.
- [ ] **New service readers wrapped in React `cache`**, otherwise `generateMetadata` plus the component body is two identical requests.
- [ ] A memoized reader taking a collection normalizes to a **string key**; an array argument is compared by identity and never dedupes.
- [ ] Minimal GROQ projections; only consumed upstream fields requested.

### Caching

- [ ] Cacheable reads are tagged.
- [ ] Revalidation is targeted, not global.
- [ ] Personalized responses scoped to the user or account.

### Images

- [ ] Explicit `width`/`height` to reserve layout space (CLS).
- [ ] LQIP blur placeholders where available.
- [ ] `preload` on the LCP image **only** (`priority` is deprecated in Next 16).
- [ ] Correct sizing, no full-resolution asset scaled down in CSS.

### Bundle

- [ ] No large dependency pulled in for a small utility.
- [ ] No barrel import dragging in an entire library.
- [ ] Heavy client-only components dynamically imported where appropriate.

### Server-side anti-patterns

- [ ] No unbatched external call inside a loop.
- [ ] No unbounded in-memory cache. A module-scope `Map` that only ever grows is a leak in a long-lived server process, bound it by size or TTL.
- [ ] No blocking operation on a request path that could be awaited concurrently.
- [ ] No synchronous I/O on an async path.
- [ ] Pagination on any list endpoint that can grow.
- [ ] Large payloads streamed rather than buffered whole.
- [ ] Only the fields actually consumed are requested: a narrow projection is both faster and a smaller blast radius.

### Client-side anti-patterns

- [ ] Lists over ~100 items virtualized rather than fully rendered.
- [ ] No heavy computation blocking the main thread.
- [ ] No layout thrashing, reading and writing layout properties in a loop.
- [ ] No fetch triggered in the render cycle without a loading state.

### Loading

- [ ] `loading.tsx` is a skeleton reserving layout space, not a spinner.
- [ ] Suspense used where streaming genuinely improves perceived performance.

## Output

For each finding, state the cost and the fix. An unquantified "this is slow" is not actionable:

```
[SEVERITY] Issue, file:line
  Impact:   measured or estimated cost, at what scale
  Current:  what it does now
  Fix:      the specific change
```

## Blocks on

- A waterfall on the critical path that `Promise.all` would remove.
- Any metric past its hard limit above.
- An N+1 against an external service.
- A whole page marked `"use client"` for one interactive child.
- An unoptimized or unsized image above the fold.
