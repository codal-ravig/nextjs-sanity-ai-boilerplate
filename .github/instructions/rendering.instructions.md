---
name: "Rendering instructions"
description: "Rendering strategy per route type under Cache Components: static shell, Suspense streaming, use cache, and cache tagging."
applyTo: "src/app/**/*.tsx,src/services/**/*.ts"
paths:
  - "src/app/**/*.tsx"
  - "src/services/**/*.ts"
---

# Rendering Instructions

## Purpose

Every route has to make a deliberate rendering decision. This file maps route types to a rendering strategy so pages are neither over-cached (stale or leaked data) nor under-cached (unnecessary origin load).

## Cache Components is on

`next.config` sets `cacheComponents: true`. Under it the route segment configs `dynamic`, `revalidate` and `fetchCache` are rejected, and no page exports them. The model instead:

- **Static shell plus Suspense.** A route that reads request-time data (`cookies()`, `params`, `draftMode()`) does it inside a `<Suspense>`-wrapped child, so the shell prerenders and the request-time part streams in. A request-time read outside a boundary fails the build.
- **Cache explicitly.** Data is cached only where a function opts in, with `'use cache'` plus `cacheTag`/`cacheLife`, or the older `unstable_cache`. Everything else runs per request.
- **`export const instant = false`** is the opt-out for a segment not yet converted. It allows the route to block instead of failing validation; it does not force the route dynamic. Each use carries a TODO naming why.

## Strategy by route type

Adapt this table to your routes.

| Route | Strategy | Reasoning |
| --- | --- | --- |
| Home, marketing and content pages | Published CMS reads cached in one fetch helper under tags the publish webhook drops; draft reads uncached. Dynamic slug renders inside `<Suspense>` | Content changes rarely, and the webhook, not a timer, is what refreshes it |
| Listing pages with user-specific results | Per request, never a shared cache entry. Read `cookies()` inside a Suspense-wrapped child | What a user sees is resolved per account. Do not "optimize" one into a cached, shared render: a shared entry across accounts is a cache-isolation failure |
| Detail pages | Static shell plus a request-time body inside `<Suspense>` when the body depends on the user; cached with tags when it is public content | Match the cache scope to who may see the data |
| Search results | SSR, or client-side for interactive filtering | Query-dependent, interactive |
| Primary conversion flows (sign-up, forms with side effects) | SSR | User- and session-specific |
| Account area | SSR | User-specific, sensitive, auth-gated |

## Cache tagging

- **Tag strings are built in one module (for example `lib/cache/tags.ts`) and nowhere else**, so the read doing the tagging and the webhook doing the invalidating cannot drift. Never hand-write a tag literal. The vocabulary covers CMS document, type, page and settings tags, and `accountScoped(tag, accountId)` for anything that varies by account.
- Content reads pass those tags through the shared fetch helper, which applies them with `cacheTag`, not through a `next: { tags: [...] }` literal on a raw `fetch`. A cached read with no invalidation path is a bug: add the invalidation path in the same change that adds the first tagged read.
- When a mutation affects cached data, call `revalidateTag` with the specific tag, never `revalidatePath('/')` as a blunt fallback. Next 16 takes two arguments: `revalidateTag(tag, "max")`, or `{ expire: 0 }` where the next load must see the change (the CMS webhook).
- Prefer tag-based revalidation over a time window alone wherever the upstream system can push a webhook. Treat a `cacheLife` window as a safety net, not the primary freshness mechanism.

## Streaming and Suspense

- Wrap slow, non-critical sections (recommendations, related items, recently viewed) in `<Suspense>` with a skeleton fallback so the primary content is not blocked on them.
- Keep the Suspense boundary close to the slow component, not around the whole page. The goal is to unblock the fast path, not to hide latency everywhere.
- Use `loading.tsx` for whole-route loading states and in-page `<Suspense>` for partial, section-level streaming. They solve different granularities; use both where appropriate.

## Partial Prerendering (PPR)

- In Next 16, PPR is part of Cache Components. Let static shells (header, layout, navigation) prerender and wrap the genuinely dynamic slice (a signed-in indicator, personalized content) in `<Suspense>`. Don't opt an entire route out with `instant = false` because one small piece is dynamic.

## Client-side rendering

- CSR (via `useEffect` + client fetch) is reserved for interactions that are inherently client-only and post-load: live filter counts, autocomplete-as-you-type, toggles. It is not a substitute for initial data fetching that could be server-rendered.

## Anti-patterns to reject in review

- Exporting `dynamic`, `revalidate` or `fetchCache` from a segment. Cache Components rejects them; use `'use cache'`/`cacheLife`/`cacheTag`, or `<Suspense>` around request-time reads.
- A new `instant = false` added to dodge a validation error that a Suspense boundary would fix.
- A shared cache entry for personalized content.
- Full-page client components for pages that are 90% static content.
- Broad `revalidatePath('/', 'layout')` calls after a narrow mutation.
- Missing `loading.tsx`/`<Suspense>` on any route that fetches data, causing a blank screen during navigation.
