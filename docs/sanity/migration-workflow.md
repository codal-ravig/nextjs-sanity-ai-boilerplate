# Content Migration Workflow

## When a migration is needed

| Change | Migration? |
| --- | --- |
| Add an optional field | No |
| Add a required field | Yes: backfill first, then require |
| Rename a field or type | Yes |
| Remove a field | Only after code stops reading it; then optionally clean up |
| Change a field's type | Yes |
| Change a block's shape | Yes, or support both shapes temporarily |

## Sequence

1. Back up: export the target dataset.
2. Write the migration with Sanity's migration tooling (`sanity migration`), dry run by default.
3. Run against a non-production dataset; inspect results.
4. Validate documents (`sanity documents validate`).
5. Deploy compatible code, then run against production with human approval.
6. Regenerate types and remove compatibility code.

## Rules

- Migrations are idempotent and committed to the repo.
- Never delete or overwrite production data from an unreviewed script or an AI agent.
- A schema change that makes existing documents invalid is a blocker until migrated.
