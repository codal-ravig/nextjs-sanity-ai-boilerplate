---
name: docs-sync
description: Use after any non-trivial code change, when finishing a feature, fixing a bug, adding or removing an API route, changing a flow, or touching webhooks, caching, schema or environment variables. Keeps docs/flows/ and the matching specs in step with the code by editing the exact affected passage, never rewriting a whole document, and creating a new doc only for a genuinely new area. Also checks .env.example and deployment config when an environment variable is added, renamed or removed. Trigger on "update docs", "sync docs", or when asked to keep documentation current.
version: "1.0.0"
---

# Docs Sync

`docs/flows/` and `.ai/specs/` describe how the system works. They must not drift from the code. When you change code, update the docs surgically: edit the specific piece, do not rewrite documents.

## When to run this

After any change, before calling the work done:

- a new, changed or removed route handler under `src/app/api/**`
- a changed flow: authentication, content publishing, revalidation, webhooks, form handling
- a change to caching, tags or per-user isolation
- a new, renamed or removed environment variable or feature flag
- a Sanity schema, query or Draft Mode change
- a changed contract another team or system depends on

Skip it for comment-only, test-only and pure styling changes with no user-facing behavior change.

## Which doc to edit

Use the area map in `scripts/lib/ai-context-map.js` (or run `node scripts/ai-context-index.js`) to find the flow doc and spec for the path you changed. Keep your own routing table here once you have flows:

| Change touches | Edit |
| --- | --- |
| Any flow listed in `docs/flows/README.md` | The matching flow doc |
| Sanity schema, queries, preview | `docs/sanity/` and `.ai/specs/content-and-visual-editing.md` |
| Caching, tags, revalidation | `docs/sanity/caching-and-revalidation.md` and the cache spec |
| A decision with lasting consequences | A new ADR in `docs/adr/` |
| Setup, environment, workflow | `docs/repository-workflow.md` or `docs/ai-workflow.md` |

A single change often touches two or three docs. Update all of them.

## How to edit: surgical rules

1. **Edit in place.** Find the section that describes the changed piece and modify exactly those lines, steps or table rows.
2. **Insert at the exact place.** A new step goes in order inside the numbered list. A new endpoint goes next to its sibling endpoints. A new gotcha goes at the end of the Gotchas list. A new file gets one line in the Code map.
3. **Keep the structure.** Every flow doc follows the template: purpose, systems, business view, steps, diagram, contracts, error handling, gotchas, code map, tests. Put content in the matching section.
4. **Diagrams must match the sequence.** Update arrows and nodes when behavior changes. Do not leave a diagram describing the old behavior.
5. **Update the spec's status header date** when you change a spec, and keep a retraction note if a claim turned out false.
6. **Never document what you did not verify.** If you cannot confirm a behavior from code or a run, say so in the doc.

## Verification checklist

- [ ] Every changed route, flag or flow is reflected in its doc
- [ ] Diagrams show the new behavior
- [ ] The `docs/flows/README.md` index is still accurate
- [ ] No two docs state a default or a value differently
- [ ] New environment variables are handled (below)
- [ ] The area map in `scripts/lib/ai-context-map.js` names any new doc

## New, renamed or removed environment variables

Run whenever the diff adds, renames or removes a `process.env.X` read, or changes `.env.example`. Constants that only look like environment names are not environment variables.

1. List them from the diff:

```bash
git diff origin/<trunk>...HEAD -U0 -- src scripts .env.example | grep -E '^[+-]' \
  | grep -oE 'process\.env\.[A-Z0-9_]+' | sort -u
```

2. Check each reaches every place that needs it:

| Place | Needed when |
| --- | --- |
| `.env.example`, with a placeholder, a comment on what it does and what happens when unset | always |
| The environment table in your setup doc | always |
| Your deployment pipeline (secret store and runtime variables) | the value is read at runtime in a deployed environment |
| Build arguments | the name starts with `NEXT_PUBLIC_`, because it is inlined at build time |

3. Never copy a real value into chat, a file, a commit or a pull request. Compare names only. If the team keeps real values in a secret store or wiki, report which names are missing there and ask the developer to add them. You cannot and should not edit it yourself.

A variable that is local-only needs only the first two rows. Say why you skipped the others.
