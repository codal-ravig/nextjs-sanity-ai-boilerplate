---
name: content
description: "Reviews Sanity work: TypeGen, GROQ queries, Portable Text, images and Draft Mode."
---

# Content Reviewer (Sanity)

**Read first:** [`sanity.instructions.md`](../instructions/sanity.instructions.md) and, for an AI-assisted change, confirm [`docs/sanity/ai-workflow.md`](../../docs/sanity/ai-workflow.md)'s pre-implementation question set was actually walked. This checklist is the post-implementation half of that same gate, not a replacement for it.

## Triggers

Any change under `lib/sanity/`, `services/content/`, `sanity/`, `components/portable-text/`, or the draft-mode and revalidation route handlers (for example `/api/draft/sanity`, `/api/disable-draft`, `/api/revalidate`).

## Checklist

### Ownership

- [ ] Editorial content only.
- [ ] No transactional or system-of-record data (prices, inventory, orders, account data) in a document.
- [ ] Data owned by another system is referenced by that system's **ID** and resolved through its service.

### Type safety

- [ ] **No `any`.** No `@ts-ignore`/`@ts-expect-error` under `src/` (the audit rejects any); under `sanity/`, only with written justification.
- [ ] TypeGen output used; regenerated in the same change as a schema or query edit.
- [ ] No hand-written duplicate of a generated result type.

### GROQ

- [ ] Lives in `services/content/queries.ts`, not in a component.
- [ ] **Explicit projections**, no whole-document fetches.
- [ ] References resolved server-side with `->`.
- [ ] Inputs parameterized (`$slug`), never concatenated.

### Fetching

- [ ] Reads go through `sanityFetch`, not a client directly.
- [ ] Every read is tagged.
- [ ] Draft reads uncached.

### Images

- [ ] Via `@sanity/image-url`, no hardcoded asset URLs.
- [ ] Explicit dimensions; hotspot and crop respected.
- [ ] `metadata.lqip` fetched for blur-up.
- [ ] LCP image has `preload` (`priority` is deprecated in Next 16) and is not lazy-loaded; **not every image**.

### Portable Text

- [ ] Rendered through the **global mapper**, not a per-page renderer.
- [ ] Heading blocks generate stable IDs where anchors are needed.
- [ ] **No `dangerouslySetInnerHTML`.** CMS content is untrusted input.
- [ ] Unknown block types degrade quietly rather than throwing.

### Preview and Visual Editing

- [ ] Preview **authenticated**, never activated by a query parameter alone.
- [ ] Production renders published content; **Stega off** on the published client.
- [ ] `<VisualEditing />` rendered **only** in Draft Mode.
- [ ] Presentation's `previewUrl.draftMode.enable` points at the authenticated draft-mode route, with no separate preview entry point.
- [ ] `resolve.locations` extended for any new routable document type.
- [ ] No custom field-linking mechanism built alongside Sanity's tooling.

### Caching

- [ ] Revalidation validates its secret before any side effect.
- [ ] Cache tags **targeted**, not global.
- [ ] `revalidateTag` uses the two-argument form: `{ expire: 0 }` for the Sanity webhook (immediate), `"max"` elsewhere.
- [ ] New content readers wrapped in React `cache`.

### Personalization

- [ ] Resolved from trusted server-side context, never client-side filtering.
- [ ] Cache-isolated per user or account.

### SEO

- [ ] Page → global → default fallback respected.
- [ ] No hardcoded metadata that should be editor-managed.

## Blocks on

- `any` in content types.
- A transactional or system-of-record value in a CMS field.
- Preview activated by query parameter alone.
- A revalidation endpoint acting before validating its secret.
- Personalized content cached without key isolation.
