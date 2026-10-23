# Content and visual editing

> **Status (YYYY-MM-DD):** Retrospective example. Replace the dates and details with your own. Describes the invariants a Sanity-backed site should hold for published content, preview and visual editing.

## Goal

Editors change content in Sanity Studio and see it live in context. Visitors only ever see published content, fast and cached.

## Source of truth

| Data | Owner | Where the code reads it |
| --- | --- | --- |
| Pages, navigation, banners, SEO fields | Sanity | `src/services/content/` through the content client |
| Product or application data | Your data API | Never copied into Sanity as writable data |

## Behaviour

1. Published content is fetched with a public-safe client and cached with entity tags.
2. Draft Mode switches reads to a draft-capable client, uses a server-only read token and disables caching for that request.
3. Visual editing (Presentation) loads the site in Studio and maps clickable regions back to fields.
4. A verified webhook on publish revalidates the affected tags.

## Invariants

- The draft token never reaches the browser, and no route returns draft content without an authenticated Draft Mode session.
- Schema changes are followed by TypeGen. The generated types are committed and a drift check fails the build when they are stale.
- Every image field requires alt text, or an explicit decorative flag.
- Shared fields come from one factory function, so the same field means the same thing everywhere.
- Singleton documents are created through Studio structure and cannot be duplicated or deleted from the UI.
- Content text is rendered as data. It is never evaluated or injected as HTML.

## Failure scenarios

| Scenario | Expected behaviour |
| --- | --- |
| Sanity unreachable at request time | Serve the cached copy, or a safe fallback. Never a blank page. |
| Webhook delivered twice or out of order | Revalidation is idempotent and harmless. |
| Webhook signature invalid or secret missing | Reject with 401. Fail closed. |
| Editor references a deleted document | The resolver skips the block and logs it, the page still renders. |

## Security

Draft Mode routes check a secret in constant time. Webhook bodies are verified against the raw payload before parsing. The read token is scoped to read.

## Accessibility

Rich text renders real headings, lists and links. Alt text is rendered on every content image. Heading levels come from the content model, not from visual size.

## Acceptance criteria

- [ ] An editor sees a draft change in Presentation within a second or two.
- [ ] A published change appears for visitors after the webhook fires.
- [ ] A schema change without regenerated types fails the pre-commit check.

## Out of scope

Dataset promotion between environments, migrations and Studio plugin choices. See `docs/sanity/` and `docs/adr/sanity/`.
