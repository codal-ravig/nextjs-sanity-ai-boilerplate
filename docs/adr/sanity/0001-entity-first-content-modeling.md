# 0001. Model entities first; add a type only past a stated threshold

**Status:** Accepted

## Context

A page builder alone is fast to start, but content that is really an entity (an author, a category, a location) gets copied into blocks. Copies drift, cannot be queried, and cannot be reused. The opposite failure is a document type for every idea, which bloats the Studio and the schema.

## Decision

- Model real-world things that are reused, referenced or listed as **entity documents** (`author`, `category`), and reference them from pages.
- Model page layout as a **page builder** array of typed blocks on `page` (see [0010](./0010-page-builder-shared-shape.md)).
- Add a new document type only when at least one of these holds:
  1. It is referenced from two or more places.
  2. It has its own URL or lifecycle (publish, archive).
  3. It is listed, filtered or sorted by a query.
  4. Different editors own it.
- Otherwise add a field or an object to an existing type.
- Presentation (colors, spacing, layout variants) is a field on a block, not a document.

## Consequences

- Fewer types, less duplication, queries that join through references.
- Every proposed type must answer the threshold above in its PR.
- Entity design is revisited when the first entity is added; record the result in a new ADR.

## Related

[`docs/sanity/content-model.md`](../../sanity/content-model.md)
