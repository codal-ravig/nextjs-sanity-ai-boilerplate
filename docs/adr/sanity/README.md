# Sanity Architecture Decision Records

Decisions specific to the Sanity integration. Site-wide decisions live in [`docs/adr/README.md`](../README.md). Numbering here is its own sequence; always say which index a cross-reference points into.

Format: **Context, Decision, Consequences**, plus a **Status**. An ADR is never renumbered. To change a decision, add a new ADR and mark the old one `Superseded by NNNN`.

| ADR | Title | Status |
| --- | --- | --- |
| [0001](./0001-entity-first-content-modeling.md) | Model entities first; add a type only past a stated threshold | Accepted |
| [0002](./0002-visual-editing.md) | Visual Editing through the Presentation tool | Accepted |
| [0003](./0003-singletons-via-studio-singletons-api.md) | Singletons use Studio's singleton support | Accepted |
| [0004](./0004-dataset-topology-and-promotion.md) | One dataset per environment, code and content promoted separately | Accepted |
| [0005](./0005-studio-plugins.md) | Studio plugins: a minimal, deliberate set | Accepted |
| [0006](./0006-webhook-revalidation-on-a-private-dataset.md) | Revalidate with a signed webhook; do not rely on defineLive | Accepted |
| [0007](./0007-cache-components-and-three-layer-fetch.md) | Cache Components and the three-layer fetch | Accepted |
| [0008](./0008-content-resolver-architecture.md) | Render content through an explicit, typed `_type` map | Accepted |
| [0009](./0009-taxonomy-references-via-field-factories.md) | Taxonomy and shared fields via field factories | Accepted |
| [0010](./0010-page-builder-shared-shape.md) | Pages share one shape: title, page builder, SEO | Accepted |
| [0011](./0011-shared-link-model.md) | One shared link model | Accepted |
| [0012](./0012-ai-assist-for-alt-text-only.md) | AI Assist, for image alt text only | Accepted |

Related: [`docs/sanity/README.md`](../../sanity/README.md), [`.github/agents/content.md`](../../../.github/agents/content.md).
