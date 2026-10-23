# Flow documentation

A flow document explains how one user journey or system process works end to end: which systems are involved, the steps, the API contracts, what goes wrong and where the code lives. Flows are the "how it works" layer. [Specs](../../.ai/specs/README.md) are the "what must stay true" layer.

This directory starts empty. Add a flow when a journey crosses systems or has failure modes someone could break by accident. Examples worth documenting: sign-in, a content publish and revalidation cycle, a form submission to a CRM, a webhook handler, a search query.

## How to read and write them

- Start from [`_template.md`](./_template.md). Keep every section, even if it only says "None".
- Name files `NN-short-title.md` and keep the index below in step, so a renamed file does not leave a stale link.
- Describe the code as it is. Where a doc and the code disagree, the code wins and the doc needs fixing.
- Update the matching passage in the same change that alters the behavior. The `docs-sync` skill does this surgically.
- Add the file name to the relevant area in `scripts/lib/ai-context-map.js`, so the doc is named before someone edits that area.

## Index

| Doc | Covers |
| --- | --- |
| _none yet_ | |

## Glossary

Add terms every flow uses and that a newcomer would not know. One line each.
