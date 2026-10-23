---
name: "Next.js instructions"
description: "App Router patterns, Server vs Client Components, rendering, caching, and Next 16 specifics."
applyTo: "src/app/**,src/components/**,next.config.*"
paths:
  - "src/app/**"
  - "src/components/**"
  - "next.config.*"
---

# Next.js Instructions

## This is Next.js 16

It differs from older training data. Read `node_modules/next/dist/docs/` before assuming an API exists or behaves as you remember.

| Changed in 16 | Detail |
| --- | --- |
| `middleware.ts` → **`proxy.ts`** | Renamed convention |
| Async request APIs | `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` all return Promises. **`await` them** |
| Turbopack is the framework default | If your project opts out (for example `--webpack` in `package.json` scripts plus a `webpack()` hook in the config), do not remove that flag or hook as "dead config" without checking why it exists |
| `turbopack` config | Top-level key, not `experimental.turbopack` |
| **`revalidateTag(tag, profile)`** | Two arguments. Use `"max"` for stale-while-revalidate. The one-argument form is deprecated |
| `updateTag` | **Server Actions only**. Unusable in route handlers |
| No `eslint` config key | `next lint` was removed; linting is a separate CI step |
| **Cache Components** (`cacheComponents: true`) | Segment `dynamic`, `revalidate` and `fetchCache` are rejected; cache with `'use cache'` + `cacheLife`/`cacheTag`, and put request-time reads inside `<Suspense>`. `export const instant = false` opts a not-yet-converted segment out of validation. PPR is part of it; `experimental.ppr` is gone. Detail: [`rendering.instructions.md`](./rendering.instructions.md) |

`draftMode()` throws in build-time contexts such as `generateStaticParams`. Route CMS reads through one fetch helper that already handles this, and do not call `draftMode()` directly there.

## Server and Client Components

**Server Components by default.** Use a Client Component only where interactivity or a browser API requires it.

**Do not make a whole page a Client Component because one child needs `onClick`.** Push `"use client"` down to the smallest interactive leaf. A page marked client ships its entire subtree to the browser.

Data is fetched in Server Components or route handlers, through a service, and passed down as props.

## Data fetching

- **Parallelize independent fetches.** Sequential `await`s of unrelated data is a waterfall on the critical path.

  ```ts
  const [page, global] = await Promise.all([getPage(slug), getGlobalSeo()]);
  ```

- **Batch** rather than looping. Fetching per item is an N+1.
- Never fetch server-renderable data from the client.
- **Read freely in `generateMetadata` through a memoized reader.** Service readers wrapped in React `cache`, and published CMS reads cached with `'use cache'`, mean a page fetched for metadata and again for rendering costs one request, not two. Not every reader is memoized. Check before assuming the second call is free.

## Caching

Two mechanisms at different scopes; both are needed.

**Within one request**: React `cache` wraps service readers, collapsing repeated calls in a single render into one request.

**Across requests**: `'use cache'` (or `unstable_cache`) with cache tags:

- Tag every cacheable read through one shared tag vocabulary (for example `lib/cache/tags.ts`).
- `revalidateTag` with targeted tags only: `{ expire: 0 }` in the CMS publish webhook so the next load sees the change, `"max"` for operator and background invalidation.
- Never cache user-specific mutation state or draft content.
- **Personalized responses are cache-isolated per account.**

`cache` is request-scoped, so it cannot leak personalized data between users. Cache tags are shared, so they can, which is why account scoping applies there.

## Route segment config

- Do not export `dynamic`, `revalidate` or `fetchCache`: `cacheComponents: true` rejects them. A route that composes live data reads it inside a `<Suspense>`-wrapped child instead.
- `export const instant = false` is a temporary opt-out only. Do not add one to avoid a fix a Suspense boundary would make, and leave a TODO naming why.
- If `generateStaticParams` is used for known content routes, unknown slugs still render on demand.
- A CMS outage in `generateStaticParams` degrades to "nothing prerendered", never a failed build.

## Required conventions

Every route tree provides: `error.tsx` (error boundary), `loading.tsx` (skeleton, not a spinner; reserve layout space to avoid CLS), and `not-found.tsx`. Use `notFound()` for missing content. A missing document is a 404, not an error.

## File and directory naming

- Route directories are `kebab-case`: `reset-password/`, `order-history/`. The directory name **is** the URL path.
- Reserved files are lowercase: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`.
- Dynamic segments: `[slug]`, `[...path]`, `[[...tool]]`. Route groups: `(site)`, `(auth)`. Private folders: `_server/`.
- Components remain `PascalCase.tsx` with named exports; `page.tsx`/`layout.tsx` use a default export because the framework requires it.

Full standard: [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

## Images

`next/image` with explicit `width`/`height`. The LCP image gets `preload` (`priority` is deprecated in Next 16) and is not lazy-loaded, and **only** the LCP image, or the signal is meaningless.

## Metadata

`generateMetadata` follows page → global → default. A CMS outage falls back to defaults rather than failing the render.

## Anti-patterns to reject in review

- A whole page or layout marked `"use client"` for one interactive child.
- Sequential awaits of independent data.
- `dynamic`, `revalidate` or `fetchCache` exported under Cache Components.
- A request-time read (`cookies()`, `headers()`, `draftMode()`) outside a `<Suspense>` boundary.
- A one-argument `revalidateTag`, or a blunt `revalidatePath('/')` after a narrow change.
- A new route without `error.tsx`, `loading.tsx` and `not-found.tsx` where it fetches data.
