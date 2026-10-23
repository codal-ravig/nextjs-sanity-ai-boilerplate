# Content Model

Example names below are generic. Replace with your project's types, but keep the structure.

## Documents

| Type | Kind | Purpose |
| --- | --- | --- |
| `page` | Collection | Title, slug, `pageBuilder[]`, `seo` |
| `post` | Collection | Article with body (Portable Text), author, categories |
| `author` | Entity | Reused by posts |
| `category` | Entity | Taxonomy, referenced by posts and pages |
| `siteSettings` | Singleton | Site name, default SEO, social links |
| `navigation` | Singleton | Menu items built from `link` objects |

## Objects

| Type | Purpose |
| --- | --- |
| `link` | Shared link model ([ADR 0011](../adr/sanity/0011-shared-link-model.md)) |
| `seo` | Title, description, share image, `noindex` |
| `richImage` | Image with hotspot, required `alt`, optional caption |
| Blocks (`heroBlock`, `textBlock`, `ctaBlock`, ...) | Page builder entries |

## Entity-first modeling

Apply the threshold in [ADR 0001](../adr/sanity/0001-entity-first-content-modeling.md) before adding a document type. Add a field first; promote to a document when it is referenced, listed, has its own URL, or has a separate owner.

## Page builder blocks

- Every block has a unique `_type`, a title and preview in the schema, and validation.
- Blocks hold content and a small set of presentation options; no free-form HTML or CSS.
- Block schemas are registered once and listed in the `pageBuilder` array's `of`.

### Adding a block

1. Schema object, registered in the schema index.
2. Add to the page builder `of` list.
3. Projection in the shared page builder fragment.
4. Entry in the typed resolver map ([ADR 0008](../adr/sanity/0008-content-resolver-architecture.md)).
5. Regenerate types, add a component test.

## Curated vs automated content

A list-shaped block (for example "recent posts") is either:

| Mode | Stores | Use when |
| --- | --- | --- |
| Curated | References chosen by an editor | Order and selection matter |
| Automated | A rule (type, category, limit) resolved at request time | The list should stay current |

Do not store a copy of data owned by another system; store an ID or a rule.

## Field conventions

- Field names are `camelCase`; every field has a title and description.
- Required content has `validation: rule => rule.required()`.
- Images always require `alt`.
- Slugs use `slug` with a `source` and uniqueness validation.
- Shared fields come from factories ([ADR 0009](../adr/sanity/0009-taxonomy-references-via-field-factories.md)).
- Singleton IDs equal their type name ([ADR 0003](../adr/sanity/0003-singletons-via-studio-singletons-api.md)).
- Do not use `reference` to a type that may be unpublished without a fallback.

## GROQ discipline

- Always project explicit fields. Never `*[_type == "page"]` without a projection, and never select-all in production queries.
- Pass values as parameters (`$slug`), never string interpolation.
- Compose from shared fragments (`IMAGE_PROJECTION`, `LINK_PROJECTION`, `SEO_PROJECTION`).
- Filter drafts out by using the published perspective, not by hand.
- Keep one query per route where possible.

## TypeGen

1. `sanity schema extract` writes a schema JSON file.
2. `sanity typegen generate` writes the types file from that schema and your queries (configure it in `sanity.cli.ts` or the typegen config file, per your Sanity CLI version).
3. Commit both outputs. Never hand-edit them.
4. CI regenerates and fails if `git diff` is not empty (drift check).
5. Use the workspace name flag if your config defines more than one workspace.
6. Query results are typed by the generated query types, not hand-written interfaces.
