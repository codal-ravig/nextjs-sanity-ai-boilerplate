# AI-Native Next.js + Sanity Baseline

A domain-free, reusable baseline for building secure, accessible, well-layered Next.js and Sanity projects with any AI coding agent (Claude Code, GitHub Copilot, Cursor, Codex, Gemini/Antigravity). It carries no business logic and no vendor-specific rules. Use it as the source that new projects inherit from.

## What is inside

| Area | Where | Purpose |
| --- | --- | --- |
| Cross-tool entry points | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/` | One source of truth. Every tool points back to `AGENTS.md` |
| Repo-wide AI workflow | `.github/copilot-instructions.md` | Mandatory 11-step workflow, directory map, skills, agents, rules |
| Scoped instructions | `.github/instructions/` | File-scoped rules with `applyTo` (Copilot) and `paths` (Claude Code) |
| Reviewer agents | `.github/agents/` | Orchestrator plus architecture, security, performance, testing, code review, content, integration, spec |
| Rules and gate | `.github/rules/` | Coding, security, testing rules and the validation gate |
| Skills | `.agents/skills/` | Vendored upstream skills plus local skills, pinned in `skills-lock.json` |
| Claude Code wiring | `.claude/` | Symlinks into `.github/` and `.agents/`, plus context hooks |
| Hooks and checks | `scripts/` | Context injection, config drift check, architecture audit, commit validator |
| Git hygiene | `.husky/`, `.commit-rules.json`, `.gitleaks.toml` | Pre-commit gate, commit format, secret scanning |
| CI | `.github/workflows/` | Lint, types, tests, audit, build, gitleaks, dependency audit, CodeQL |
| Docs | `docs/` | Architecture, naming, ADRs, flows, Sanity guides, MCP policy, AI workflow |
| Specs | `.ai/specs/` | Spec template and status-header convention |
| MCP | `.mcp.json`, `.vscode/mcp.json`, `docs/mcp.md` | Least-privilege MCP server setup |

## Principles

1. Security first. Security and source-of-truth boundaries beat implementation convenience.
2. Layering is enforced by tooling, not goodwill: `app -> components -> domain -> services -> lib -> external system`.
3. One configuration, many agents. Symlinks and pointer files, never copies.
4. Docs describe code that exists. `docs-sync` and `flow-context` keep them true.
5. AI never commits or pushes. A human reviews and commits.

## How to adopt

1. Start a new repo (or empty folder) and run `corepack pnpm create next-app`, or let the bootstrap prompt do it.
2. Open `BOOTSTRAP-PROMPT.md`, set `BASELINE_PATH` to where this baseline lives, and paste the prompt into your AI agent in the new project.
3. Review the plan the agent proposes, then reply `go`.
4. When it finishes, fill `docs/architecture.md` (source-of-truth table), `CODEOWNERS`, `.commit-rules.json` and `.env.example`.

Run `node scripts/check-claude-config.js` after any change to `.github/instructions/` or `.github/agents/`.

## Maintaining the baseline

* Keep it domain-free. Run the leftover-term grep from `BOOTSTRAP-PROMPT.md` before every release.
* Vendored skills come from upstream repos and are pinned by hash in `skills-lock.json`. Review `SKILL.md` diffs before updating a pin.
* Version the baseline with tags (`v1.0.0`) so projects can record which version they adopted.

## License

Add your preferred license before publishing.
