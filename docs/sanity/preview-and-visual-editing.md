# Preview and Visual Editing

## Required pieces

| Piece | Rule |
| --- | --- |
| Stega | Preview client only |
| `<VisualEditing />` | Rendered only in Draft Mode |
| Studio | Mounted in the app |
| Presentation | Configured in `sanity.config.ts` with preview origin and enable endpoint |

## Draft Mode

- The enable endpoint (`/api/draft/sanity`) validates a real Studio session using the read token (for example with `defineEnableDraftMode`). It does not accept a secret in a query string.
- The cookie is set on that editor's browser only.
- A disable endpoint exits Draft Mode.
- In Draft Mode, `sanityFetch` uses the preview client, `drafts` perspective, Stega on, no caching.

## Presentation

- Set the preview origin per environment.
- Define locations (which routes show which documents) so editors can navigate from a document to its page.
- If the app is embedded in Studio's iframe, allow framing only from the Studio origin via CSP `frame-ancestors`.

## Stega

- Never on the published client.
- Always off for metadata, structured data and anything compared or parsed (slugs, URLs, enum values). Strip with `stegaClean` where a value is used programmatically.

## Live Content

`defineLive` was evaluated and not adopted by default ([ADR 0006](../adr/sanity/0006-webhook-revalidation-on-a-private-dataset.md)).

## Security posture

- Draft content never enters the shared cache.
- Perspective and Draft Mode are server decisions.
- Preview endpoints are rate limited and return no content on failure.
