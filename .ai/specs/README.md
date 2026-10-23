# Specs

Specs record what a feature must do and which invariants it must keep. They are the layer above code: read the matching spec before changing an area, and update it when the change makes it untrue.

## Status header rule

Every spec opens with a dated status header, directly under the title:

```md
> **Status (YYYY-MM-DD):** one or two sentences on what is actually built, what is not, and what is open.
```

A spec is a claim about the day it was written. Read the header first, then verify that any function, flag or field it names still exists before acting on it. When you change a spec, update the date. If a claim turned out false, keep a short retraction note instead of deleting it quietly, so nobody re-learns the mistake.

## Two kinds of spec

| Kind | Written | Says | Use it to |
| --- | --- | --- | --- |
| **Intended** | Before the work | What should be built, with acceptance criteria | Drive implementation and review |
| **Retrospective** | After the work shipped | The invariants the code already holds, and known gaps | Stop a later change from quietly undoing one |

State which kind it is in the status header.

## Writing one

1. Copy [`_template.md`](./_template.md) to `<feature-name>.md` (kebab-case).
2. Fill the status header first.
3. Keep it short. A spec that cannot be read in a few minutes will not be read.
4. Add the file name to the right area in `scripts/lib/ai-context-map.js`, so it is named before someone edits that area.

The `spec` agent ([`.github/agents/spec.md`](../../.github/agents/spec.md)) turns a requirement into a spec and produces no application code.

## Examples in this baseline

| Spec | Kind |
| --- | --- |
| [`content-and-visual-editing.md`](./content-and-visual-editing.md) | Retrospective example |
| [`cache-revalidation-and-personalization-isolation.md`](./cache-revalidation-and-personalization-isolation.md) | Retrospective example |
| [`feature-flags.md`](./feature-flags.md) | Intended example |

They show the shape. Replace them with specs for your own features.
