# 0002. Visual Editing through the Presentation tool

**Status:** Accepted

## Context

Editors need click-to-edit preview of unpublished content. Rolling a custom preview means building session validation, overlays and refresh logic.

## Decision

Use Sanity's supported mechanism. Four pieces are required:

| Piece | Where |
| --- | --- |
| Stega encoding on the **preview client only** | preview client module |
| `<VisualEditing />` overlay, rendered only while Draft Mode is on | root layout |
| Studio mounted in the app (for example at `/studio`) | app route |
| `presentationTool` with a preview origin and a Draft Mode enable endpoint | `sanity.config.ts` |

- The enable endpoint is authenticated: it validates a real Studio session with the read token (for example via `defineEnableDraftMode` from `next-sanity`), then sets the Draft Mode cookie.
- Perspective is never taken from a query parameter or caller input.
- Published reads never use Stega. Metadata reads (`generateMetadata`) always disable it.

## Consequences

- Draft content is visible only in the editor's own browser.
- Preview responses are never cached in the shared cache.
- Anything that bypasses the enable endpoint is a security defect.

## Related

[`docs/sanity/preview-and-visual-editing.md`](../../sanity/preview-and-visual-editing.md)
