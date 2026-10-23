# 0005. Studio plugins: a minimal, deliberate set

**Status:** Accepted

## Context

Every Studio plugin adds client weight, upgrade work and editor surface area.

## Decision

| Plugin | Policy |
| --- | --- |
| `structureTool` | On, with a custom grouped sidebar and explicit singleton placement |
| `presentationTool` | On ([0002](./0002-visual-editing.md)) |
| `visionTool` | Development only, for GROQ experiments |
| `@sanity/assist` | Allowed, scoped to image alt text only ([0012](./0012-ai-assist-for-alt-text-only.md)) |
| Anything else | Needs a stated editorial requirement and an owner |

Before building a custom workflow (review states, scheduling), evaluate Sanity's own features first.

## Consequences

- A new plugin is a reviewed decision, not a default.
- Remove plugins when the need ends.
