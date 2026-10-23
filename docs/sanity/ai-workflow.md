# AI-Assisted Sanity Workflow

A gate for any AI-assisted change that touches Sanity. A markdown file cannot force an agent to read it; enforcement comes from agent and instruction files linking here, and from reviewers checking the answers below.

## Triggers

Walk this workflow before changing schema, `sanity.config.ts`, the Sanity clients, GROQ queries, the block resolver, Portable Text components, Draft Mode or webhook endpoints, or Sanity environment variables.

## Pre-implementation questions

If any answer is "unsure", stop and ask a human.

1. Does this belong in Sanity? Check the source-of-truth table in [`docs/architecture.md`](../architecture.md).
2. Does an existing type, object or block already cover it? ([`content-model.md`](./content-model.md))
3. Does it need TypeGen regeneration? Run it; never hand-edit generated types.
4. Is there an existing GROQ fragment to reuse?
5. Does it need a resolver entry (page builder block only)?
6. Does it affect caching? A new revalidatable type needs the allowlist, tag mapping and webhook filter.
7. Does it touch Draft Mode, Stega or Visual Editing? Never let perspective be caller-supplied, never enable Stega on the published client, never activate preview from a query parameter.
8. Does existing content need migrating? ([`migration-workflow.md`](./migration-workflow.md))
9. Is there an ADR to follow, or does this need a new one?
10. If copying a pattern from elsewhere, verify it against the installed package versions and current Sanity docs.

## What AI may and may not do

| Allowed | Not allowed |
| --- | --- |
| Edit schema, queries and components in a branch | Destructive dataset operations (delete dataset, bulk delete, overwrite) |
| Read and query the **development** dataset | Publish documents to production |
| Create or patch documents in development | Write to staging or production without explicit human approval |
| Run schema validation and TypeGen | Weaken schema validation "temporarily" |
| Suggest alt text through Studio AI Assist | Rewrite editorial copy through AI Assist |

## Tooling rules

- Scope the Sanity MCP server to the development dataset only.
- Tokens are least privilege: read-only unless a write is required, never an admin token, never committed, never `NEXT_PUBLIC_`.
- No `any` or `@ts-ignore` to work around Sanity types.
- Do not hand-write a duplicate of a generated type.
- Do not give CMS content a way to choose code beyond the typed resolver map.
- Do not remove a test to make a suite pass or refactor unrelated code.

## Before calling it done

Diff the change against [`architecture.md`](./architecture.md), [`.github/instructions/sanity.instructions.md`](../../.github/instructions/sanity.instructions.md) and the checklist in [`.github/agents/content.md`](../../.github/agents/content.md). If the change contradicts a documented rule, flag it; do not quietly deviate.
