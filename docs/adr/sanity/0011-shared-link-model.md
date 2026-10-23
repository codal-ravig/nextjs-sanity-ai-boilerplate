# 0011. One shared link model with a small set of destination types

**Status:** Accepted

## Context

Buttons, cards, navigation and footers each defined their own link fields, with different validation and different bugs (unsafe schemes, broken internal links).

## Decision

One `link` object used everywhere, with a `kind` discriminator:

| Kind | Stores | Notes |
| --- | --- | --- |
| `internal` | Reference to `page` or `post` | Survives slug changes |
| `external` | URL | Scheme validated (`https`, `mailto`, `tel` only) |
| `anchor` | Path plus fragment | Optional |
| `file` | Asset reference | Optional |

- One GROQ fragment (`LINK_PROJECTION`) resolves the destination to a plain `href`.
- One component renders it, adding `rel` for external links.
- Readers that project links are invalidated when a linked document changes (see the dependency table in [`caching-and-revalidation.md`](../../sanity/caching-and-revalidation.md)).

## Consequences

- Link bugs get fixed once.
- Adding a destination kind is a schema, fragment and component change together.
