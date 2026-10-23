---
name: "Sanity instructions"
description: "TypeGen, GROQ, Portable Text, images, Stega, Draft Mode, caching, webhooks, SEO."
applyTo: "src/lib/sanity/**,src/services/content/**,sanity/**,sanity.config.ts,src/components/portable-text/**,src/app/api/revalidate/**,src/app/api/draft/**,src/app/api/disable-draft/**"
paths:
  - "src/lib/sanity/**"
  - "src/services/content/**"
  - "sanity/**"
  - "sanity.config.ts"
  - "src/components/portable-text/**"
  - "src/app/api/revalidate/**"
  - "src/app/api/draft/**"
  - "src/app/api/disable-draft/**"
---

# Sanity Instructions

**Documentation for this area.** The full documentation set (content model, caching and revalidation, preview and Visual Editing, workflows) lives under `docs/sanity/`. Feature invariants live in [`.ai/specs/README.md`](../../.ai/specs/README.md). Record Sanity decisions as ADRs under [`docs/adr/`](../../docs/adr/). Before implementing any change in scope of this file, walk the pre-implementation questions in your `docs/sanity/` workflow doc.

These standards are mandatory.

## Ownership

Sanity owns **editorial content**: pages, marketing copy, banners, navigation, footer, content blocks, SEO text.

Sanity must **not** become the source of truth for data another system owns (transactional, inventory, pricing, identity). A document references such a record by its **external ID**:

```
Sanity document → external ID → Service → owning system (authoritative)
```

Never duplicate data owned elsewhere into Sanity. A copy goes stale silently, and the app cannot tell.

**A field where an editor chooses a record from another system uses a picker input, never a typed ID.** Build a Studio input that searches the owning system through a signed-in-editors-only API route and stores just the ID. Build Studio inputs from `@sanity/ui` components, not hand-styled HTML, so they match the rest of Studio in light and dark mode.

## Type safety

**`any` is prohibited.**

```
Schema → GROQ → `pnpm sanity:typegen` → generated types → Content Service → Next.js
```

- Use official TypeGen output. Do not hand-write a type duplicating a generated query result.
- Regenerate types in the **same change** that alters a schema or query. A stale generated type is worse than none. A CI drift check is a good backstop.
- No `@ts-ignore`/`@ts-expect-error` to silence a Sanity type error. Under `src/`, an architecture audit should reject any occurrence outright; under `sanity/`, only with a written justification in the same commit.
- Validate what you depend on. Optional fields and unresolved references are real runtime states.

## GROQ

Queries live in `services/content/queries.ts`, **never in a component**.

- **Explicit projections.** No whole-document fetches.
- Resolve references server-side with `->`.
- **Parameterize inputs** (`$slug`). Never concatenate: that is GROQ injection.
- Avoid duplicate requests and unnecessary round trips.
- **Compose a repeated shape from shared fragments** (for example `services/content/groq-fragments.ts`) instead of inlining it again. A projection copied into a second query drifts from the first the next time either needs a field. Add a new fragment once a shape repeats a second time.

```groq
*[
  _type == "page" &&
  slug.current == $slug
][0]{
  title,
  "slug": slug.current,
  hero { heading, description }
}
```

## Fetching

All reads go through one fetch helper (for example `sanityFetch` in `lib/sanity/fetch.ts`). It decides perspective from Draft Mode, tags every read, bypasses cache for drafts, and maps failures to `AppError`. Do not call a Sanity client directly.

## Images

All images use **`@sanity/image-url`** via one shared helper. Never a hardcoded `cdn.sanity.io` URL: it bypasses hotspot/crop and breaks when an editor re-crops.

- Explicit width/height; respect hotspot and crop; `rect` where required.
- Responsive sizing, optimized formats.
- Fetch `metadata.lqip` for blur-up placeholders.
- **LCP image**: set `preload`, provide explicit dimensions, do not lazy-load. Do not mark every image `preload`: that removes the signal entirely.

## Portable Text

Long-form content uses Portable Text through the **global mapper** (`components/portable-text/`), not a per-page renderer.

Support paragraphs, headings, links, images, custom blocks, CTAs, approved embeds. Heading blocks generate stable IDs where anchors are needed.

**Never `dangerouslySetInnerHTML`** for normal Portable Text. Never render arbitrary HTML from the CMS.

## Visual Editing

Editors click rendered content and land on the field that produced it, via Sanity's supported [Visual Editing](https://www.sanity.io/docs/visual-editing/introduction-to-visual-editing). **Do not build a custom field-linking mechanism.** A bespoke "edit this" link or field-name convention is a second mechanism that drifts from the schema.

Four pieces, all required. Any one missing and the feature silently does nothing, which is the usual reason it "doesn't work":

| Piece | Where |
| --- | --- |
| Stega encoding | The preview client module only |
| `<VisualEditing />` overlay | Root layout, **only** when Draft Mode is on |
| Studio at `/studio` | `app/studio/*` as a Client Component |
| Presentation tool | `sanity.config.ts` |

Rules:

- **Stega never runs on published content.** It injects invisible characters into strings, which would surface in copied text, search indexes and `aria-label`s. This is why published and preview clients are separate modules rather than one client with a flag.
- **The overlay renders only in Draft Mode.** It ships tooling and exposes content-model structure; ordinary visitors must never receive it.
- **The Studio page is a Client Component.** Pulling the Studio into the RSC graph can break the build on dependencies whose server builds expose different exports.
- **Presentation goes through the authenticated door.** Its `previewUrl.draftMode.enable` points at a route that uses `defineEnableDraftMode`, which validates a real Sanity session against the read token before enabling Draft Mode. Do not add a second Presentation-specific entry point.
- **Extend `resolve.locations` when adding a routable document type.** Forgetting means Presentation can render the site but cannot link that document to its pages.

## Draft Mode

| Environment | Perspective |
| --- | --- |
| Production | `published` |
| Preview / staging | approved drafts perspective |

Preview must be **authenticated**, use server-side read credentials, keep drafts isolated from ordinary visitors, and never expose the read token.

**Never activate preview from a query parameter alone.** A `?secret=` match is not authentication. The authenticated Sanity-session check is the only way in. Do not add a query-parameter-activated preview route.

## Caching and revalidation

```
Sanity publish → POST /api/revalidate → validate secret → revalidateTag(...) → fresh
```

Decide per project whether the dataset is public or private. With a **private** dataset, every published read carries a scoped, server-only read token (`SANITY_API_READ_TOKEN`), and the browser makes no request to Sanity. Do not add `<SanityLive />` or give any client a token: Live cannot authenticate on a private dataset without exposing one. The webhook reads only its own secret (`SANITY_REVALIDATE_SECRET`). Record the decision in an ADR under `docs/adr/sanity/`.

- Build tags with one shared module (for example `lib/cache/tags.ts`), so tagging and invalidation cannot drift.
- **Targeted tags only.** Never globally invalidate for one document.
- The two-argument `revalidateTag` is required in Next 16. The **Sanity webhook uses `{ expire: 0 }`** so an editor sees their publish on the next load; `"max"` serves the old copy once. Operator and background invalidation may use `"max"`.
- Published reads are cached in one helper (`'use cache'`, `cacheTag`, `cacheLife`). Never read Sanity from a component or add a second cached path: an uncached or untagged read is invisible to the webhook.
- Use separate datasets per environment (for example `dev`, `staging`, `production`) with `<project-id>` and dataset supplied by environment variables, never hardcoded.

## Webhook security

Validate the secret **before any side effect**, using a constant-time comparison. Validate payload structure and document type. Fail safely. Never log sensitive payload contents.

## Audience-specific content

```
Identity provider → authenticated user → account/group context → Content Service → Sanity
```

Resolve from **trusted server-side context**. Never rely on client-side filtering to hide content: that is a disclosure bug. Never cache personalized content without account-scoped keys.

## SEO

Fallback chain: **page SEO → global SEO → safe application default**, implemented in one resolver (for example `lib/seo/resolve-seo.ts`). Do not hardcode metadata that is meant to be editor-managed.

## Anti-patterns to reject in review

- A GROQ query inside a component, or built by string concatenation.
- A hand-written type duplicating a TypeGen result, or stale generated types after a schema change.
- A direct Sanity client call that bypasses the shared fetch helper.
- A hardcoded `cdn.sanity.io` URL.
- `dangerouslySetInnerHTML` on CMS content.
- Stega on the published client, or the Visual Editing overlay outside Draft Mode.
- A read token reachable from browser code, or `<SanityLive />` on a private dataset.
- Draft Mode enabled by a query-parameter secret alone.
- A copy of externally owned data stored in a Sanity document.
