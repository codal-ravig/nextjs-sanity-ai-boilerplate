# 0009. Taxonomy and shared fields via field factories

**Status:** Accepted

## Context

Repeating the same reference or field definition (`categories`, `seo`, `slug`) across types invites small inconsistencies in titles, validation and options.

## Decision

- Define shared fields once as factory functions, for example `categoryRefs({ max })` or `seoField()`, that return `defineField(...)`.
- Types import the factory instead of redefining the field.
- Taxonomy values are documents (`category`) referenced by `reference`, not free-text strings.
- Factories live beside the schema and are covered by schema validation in CI.

## Consequences

- One edit changes a field everywhere.
- Slight indirection when reading a schema file.
