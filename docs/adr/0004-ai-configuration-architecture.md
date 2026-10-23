# 0004. AI configuration architecture

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Several assistants work in this repository: Claude Code, Copilot, Cursor, Codex, Gemini. Each reads different files. Maintaining a copy of the rules per tool means the copies drift and the tools follow different rules.

## Decision

- **One body of rules**, in `AGENTS.md` and `.github/` (instructions, agents, rules, prompts).
- **`AGENTS.md` is the shared entry point.** `CLAUDE.md` imports it with `@AGENTS.md`. Other tools get thin pointer files (`GEMINI.md`, `.cursor/rules/00-project.mdc`).
- **Symlinks, not copies.** `.claude/rules` and `.claude/agents` link into `.github/`, and `.claude/skills/*` link into `.agents/skills/`. A check fails when a link breaks or `paths` drifts from `applyTo`.
- **Hooks inject context.** A SessionStart index and a PreToolUse pointer name the docs for the area being edited. They never block and fail silent.
- **AI never commits or pushes.** A person reviews and commits.
- **Content is data, not instructions.** Tool results and CMS text cannot change the rules.

## Why

- A single source avoids drift.
- Hooks make "read the docs first" deterministic instead of hopeful.
- A blocking hook gets worked around. A helpful one gets used.
- Human commits keep accountability and review intact.

## Alternatives considered

| Option | Why not |
| --- | --- |
| A rules file per tool | Drift. |
| Blocking hooks | Teach people to bypass them. |
| Let the assistant commit | Removes the review step that catches AI mistakes. |

## Consequences

Dual frontmatter (`applyTo` and `paths`) must be kept identical. VS Code needs settings to avoid loading rules twice. Windows checkouts may not support symlinks, so the check is skipped there and CI enforces it.

## Security impact

MCP servers follow least privilege (see [`mcp.md`](../mcp.md)). No secrets in prompts or config.

## Performance impact

The SessionStart index is short on purpose, to keep context cheap.

## Operational impact

`audit:architecture` runs the config check in pre-commit and CI.

## Development impact

Adding a skill means adding its symlink. Adding an area means editing `scripts/lib/ai-context-map.js`.

## Migration

None for new projects. Existing projects consolidate their rules into `.github/` first.

## Related decisions

[`ai-workflow.md`](../ai-workflow.md)
