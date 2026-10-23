# Sanity Architecture

## Read path

```text
Sanity Content Lake
  -> GROQ                 (queries composed from shared fragments)
  -> sanityFetch          (single fetch entry point)
  -> typed result         (generated types)
  -> content service      (typed readers)
  -> page builder resolver (pageBuilder[] only)
  -> React component
```

Most reads (navigation, site settings, a page's own fields) go from the content service straight to component props. The resolver step applies only to `pageBuilder` arrays.

## Two-client split

The dataset is private, so both clients send a server-only read token and neither uses the Sanity CDN.

| | Published client | Preview client |
| --- | --- | --- |
| Perspective | `published` | `drafts` |
| Token | server-only read token | server-only read token |
| Stega | off | on, with `studioUrl` |
| Reachable from | `sanityFetch`, any request | `sanityFetch` in Draft Mode only, and the Draft Mode enable endpoint |

- Build clients lazily, not at module scope, so a build with the CMS disabled does not require its env vars.
- Perspective is never caller-supplied.
- Metadata reads (`generateMetadata`) always use a Stega-off variant, since invisible characters leak into titles and share previews.
- Components never import a Sanity client. Enforce with ESLint `no-restricted-imports`.

## Data ownership

Sanity owns editorial content: pages, navigation, footer, SEO, editorial copy. It does not own data that another system owns (identity, transactions, inventory). Reference external entities by ID only and resolve live data at render time. See [`docs/architecture.md`](../architecture.md).

## Images

- Build URLs with `@sanity/image-url` through one helper, never hardcoded `cdn.sanity.io` URLs (hotspot, crop and format negotiation would be bypassed).
- One shared `IMAGE_PROJECTION` fragment; a `resolveImage()` helper narrows nullable fields to a real URL.
- Scope `images.remotePatterns` to your project's asset path.
- Alt text is required in the schema.

## Portable Text

- One shared renderer, no per-page `dangerouslySetInnerHTML`, never HTML from the CMS.
- Validate link schemes (`rule.uri({ scheme: [...] })`).
- An unknown block type renders nothing rather than throwing.

## Preview and caching

See [`preview-and-visual-editing.md`](./preview-and-visual-editing.md) and [`caching-and-revalidation.md`](./caching-and-revalidation.md).
