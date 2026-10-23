# Development Workflow

## Standard sequence

1. Read the relevant ADRs and [`content-model.md`](./content-model.md).
2. Change the schema (`sanity/schema/`) and register it.
3. Update GROQ and fragments in the content service.
4. Regenerate types: `schema extract`, then `typegen generate`. Commit generated files.
5. Update the reader, resolver and components.
6. Add the document type to the revalidation allowlist and webhook filter if it is revalidatable.
7. Add or update tests.
8. Run lint, type-check, tests and the TypeGen drift check.

## Add a content type

First pass the threshold in [ADR 0001](../adr/sanity/0001-entity-first-content-modeling.md). Then: schema file, registration, Studio Structure entry, query, reader, rendering, webhook allowlist, tests.

## Add a page builder block

Schema object, registration, block list, resolver entry, route renderer if it needs request-time data, preview image if used, tests.

## Add a page

Create the route, read via the content service, add `generateMetadata` using the SEO resolver, set the cache strategy explicitly.

## Change an existing model

Decide whether it needs a migration first ([`migration-workflow.md`](./migration-workflow.md)).
