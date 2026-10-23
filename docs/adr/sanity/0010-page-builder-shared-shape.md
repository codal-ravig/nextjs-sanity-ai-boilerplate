# 0010. Pages share one shape: title, page builder, SEO

**Status:** Accepted

## Context

Separate layout mechanisms for a home page and ordinary pages double the schema, queries and resolvers.

## Decision

- `page` (and any landing-style document) shares one shape: `title`, `slug`, `pageBuilder[]`, `seo`.
- One shared GROQ projection (`PAGE_BUILDER_PROJECTION`) and one resolver map serve every route.
- Per-block audience or visibility rules are fields on the block, evaluated in one domain helper, not separate documents.
- The home page is the same shape with a fixed slug or singleton ID.

## Consequences

- A new block is available everywhere at once.
- Layout differences are editor choices, not code paths.

## Related

[0008](./0008-content-resolver-architecture.md)
