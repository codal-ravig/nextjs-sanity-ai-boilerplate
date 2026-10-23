# Sanity Documentation

How the Sanity integration works, how to extend it, and the rules that keep it from drifting.

Related, not duplicated:

- [`docs/architecture.md`](../architecture.md): system layering and source-of-truth table.
- [`.github/instructions/sanity.instructions.md`](../../.github/instructions/sanity.instructions.md): glob-enforced coding rules.
- [`.github/agents/content.md`](../../.github/agents/content.md): reviewer checklist for Sanity changes.
- [`docs/naming-conventions.md`](../naming-conventions.md): file and component naming.
- [`docs/adr/sanity/`](../adr/sanity/README.md): Sanity decision records.

## Index

| Document | Covers |
| --- | --- |
| [`architecture.md`](./architecture.md) | Read path, two-client split, images, data ownership |
| [`content-model.md`](./content-model.md) | Documents, objects, page builder blocks, field conventions, TypeGen |
| [`caching-and-revalidation.md`](./caching-and-revalidation.md) | Rendering classes, cache tags, path vs tag revalidation |
| [`webhooks.md`](./webhooks.md) | Publish webhook setup and endpoint behavior |
| [`preview-and-visual-editing.md`](./preview-and-visual-editing.md) | Draft Mode, Stega, Presentation |
| [`content-lifecycle.md`](./content-lifecycle.md) | Draft, publish, unpublish, mapped to Sanity capabilities |
| [`environments.md`](./environments.md) | Local, staging, production differences |
| [`promotion-workflow.md`](./promotion-workflow.md) | Code deploy vs content publish |
| [`migration-workflow.md`](./migration-workflow.md) | When and how to migrate content |
| [`development-workflow.md`](./development-workflow.md) | File-by-file sequence for common changes |
| [`testing-strategy.md`](./testing-strategy.md) | What is tested, by whom, and gaps |
| [`ai-workflow.md`](./ai-workflow.md) | Pre-implementation questions and AI rules |

## Where Sanity code lives

Adapt paths to your layout.

| Path | Holds |
| --- | --- |
| `sanity/schema/` | Document and object type definitions |
| `sanity.config.ts`, `sanity.cli.ts` | Studio and TypeGen configuration |
| `src/lib/sanity/` | Clients, the single fetch entry point, generated types |
| `src/services/content/` | GROQ queries, fragments, typed readers |
| `src/components/portable-text/` | Portable Text renderers |
| `src/components/page-builder/` | Block resolver |
| `src/app/api/draft/`, `src/app/api/revalidate/` | Draft Mode and webhook endpoints |
