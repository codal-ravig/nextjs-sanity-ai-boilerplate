# 0007. Cache Components and the three-layer fetch

**Status:** Accepted

## Context

Next.js Cache Components make caching explicit with `"use cache"`, `cacheTag` and `cacheLife`. Cache scopes cannot read request APIs such as `draftMode()` or `cookies()`, so the draft decision has to happen outside the cache.

## Decision

Fetch through three layers:

| Layer | Role |
| --- | --- |
| `sanityFetch` (public entry) | Reads Draft Mode outside any cache scope. Routes to the cached or uncached layer. |
| Cached published fetch | `"use cache"`, `cacheTag(...)`, `cacheLife(...)`. Takes only serializable arguments. Uses the published client. |
| Uncached preview fetch | Preview client, drafts perspective, Stega on, never cached. |

- Cache tags per document: `sanity:doc:<id>`, `sanity:type:<type>`, plus a shared `sanity:settings` tag for site-wide singletons.
- Queries are parameterized; params are part of the cache key.
- Components never import a Sanity client. ESLint `no-restricted-imports` enforces it.
- A Sanity failure becomes a typed app error; each consumer falls back so a CMS outage degrades a page rather than breaking it.

## Consequences

- One fetch entry point to audit.
- Tag names are a contract with the webhook handler.

## Related

[0006](./0006-webhook-revalidation-on-a-private-dataset.md)
