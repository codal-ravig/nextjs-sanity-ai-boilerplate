# Promotion Workflow

## Principles

- **Code deploy and content publish are separate events.** Deploying code never publishes content, and publishing never needs a deploy.
- A feature flag, not the dataset, gates rollout of new content-driven UI.
- Schema must be backward compatible with existing content before code ships (see [`migration-workflow.md`](./migration-workflow.md)).

## Sequence for a content-model change

1. Ship the schema change and code that tolerates both old and new shapes.
2. Run TypeGen and the drift check in CI.
3. Migrate or author content in staging; review in Presentation.
4. Promote content to production deliberately (export/import or a reviewed migration), or have editors author it there.
5. Remove the compatibility code and flag.

## Never

- Copy a production dataset over another without review.
- Let an agent or script write to production without human approval.
