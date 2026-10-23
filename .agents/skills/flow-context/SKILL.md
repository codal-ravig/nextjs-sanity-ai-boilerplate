---
name: flow-context
description: Load the existing documentation for an area of the repository before changing it. Use BEFORE editing an area that has flow docs, specs or ADRs (for example content, caching, API routes, authentication, feature flags), and whenever asked "load context", "what do we already have for X", "read the flow docs", or to pick up a feature someone else built. Names the flow doc and specs for the area and says which claims to distrust.
version: "1.0.0"
---

# Flow context

Documentation tends to outlive the code it describes. Before changing an area, find out what is already written about it. Before finishing, make sure what you changed is still described truthfully.

## How to load it

`scripts/lib/ai-context-map.js` is the single source of truth mapping source paths to documents. Two ways to use it.

For a path you are about to edit:

```bash
echo '{"tool_input":{"file_path":"src/services/content/page.ts"}}' | node scripts/ai-context-for-path.js
```

For the whole index of areas, flows and specs:

```bash
node scripts/ai-context-index.js
```

In Claude Code both already run automatically, as the `SessionStart` and `PreToolUse` hooks. Run them by hand in another tool, or when you want the index again mid-session.

Then read the documents it names. The point is not to know they exist. It is to know what they say before you contradict them.

## Reading order

1. **The flow doc** (`docs/flows/`): how the area works, with files, endpoints, request shapes and error cases.
2. **The specs** (`.ai/specs/`): the invariants the code holds and why. Retrospective specs were written after a feature shipped, to record what must not be undone.
3. **`docs/architecture.md`**: if the change adds a field or touches a boundary, settle which system owns the data before writing code.
4. **ADRs** (`docs/adr/`): why a decision was made.

## What to distrust

- **Every spec opens with `> **Status (date):**`.** Read it first. A spec is a claim about the day it was written.
- **A named function, flag or field may have been renamed or removed.** Grep before acting on it.
- **Docs have been wrong before.** Where a doc and the code disagree, the code wins and the doc needs fixing.

## Before you finish

If your change made any document untrue, update it in the same change. That is what the `docs-sync` skill is for: it edits the affected passage rather than rewriting the document.

If the change alters a contract another team builds against, update that contract's spec alongside the code.
