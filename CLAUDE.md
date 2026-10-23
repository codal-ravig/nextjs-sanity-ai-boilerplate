@AGENTS.md

@.github/copilot-instructions.md

`.claude/rules/` and `.claude/agents/` are symlinks to `.github/instructions/` and `.github/agents/`, the same files Copilot reads. Each scoped instruction file carries `paths` for Claude Code next to `applyTo` for Copilot; keep the two identical.
