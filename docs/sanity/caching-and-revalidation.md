# Caching and Revalidation

## Rendering classes

| Class | Examples | Rendering | Freshness |
| --- | --- | --- | --- |
| Static content | Pages, page builder blocks | Server Components, cached | Until revalidated by publish webhook |
| Shared settings | Navigation, footer, default SEO | Cached, tag `sanity:settings` | One tag refreshes every route |
| Request-time data | Anything owned by another system | Fetched per request | Always current |
| User-specific data | Accounts, personalization | Per request, trusted server context | Never shared between users |
| Draft content | Presentation preview | Preview client, no cache | Always current, per editor |

Rule: if two visitors could see different values, it is not cached in a shared entry.

## How a published read is cached

- `"use cache"` with `cacheTag(...)` and `cacheLife(...)` in the cached layer ([ADR 0007](../adr/sanity/0007-cache-components-and-three-layer-fetch.md)).
- A modest revalidate window with a longer expire acts as a safety net if a webhook is missed.
- Arguments to cached functions are serializable; the draft decision is made outside.

## Tag vocabulary

| Tag | Meaning |
| --- | --- |
| `sanity:doc:<id>` | One document |
| `sanity:type:<type>` | Every read of a type |
| `sanity:page:<slug>` | A page by slug |
| `sanity:settings` | Every shared site-wide singleton |

Keep the vocabulary small. Add a finer tag only when one document affects some routes and not others.

## Path vs tag revalidation

| Use | When |
| --- | --- |
| `revalidateTag` | Default. Drops exactly the entries that read the document. |
| `revalidatePath` | Only when a route is not tag-covered, for example a catch-all slug page. |

## Shared content dependencies

A document that is projected into another reader (a `page` linked from `navigation`) must also drop that reader's tag. Maintain a `LINK_CONSUMER_TYPES` style list and update it when a new reader projects links.

## defineLive vs webhooks

See [ADR 0006](../adr/sanity/0006-webhook-revalidation-on-a-private-dataset.md) for the tradeoff and why webhooks are the default here.

## Failure handling

- A Sanity error becomes a typed app error; consumers fall back.
- A failed revalidation returns a non-2xx status so Sanity retries.
- Manual revalidation: an authenticated admin endpoint or a restart, never an open URL.
