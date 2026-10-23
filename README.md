# AI-Native Next.js + Sanity Baseline

A domain-free, reusable baseline for building secure, accessible, well-layered Next.js and Sanity projects with any AI coding agent (Claude Code, GitHub Copilot, Cursor, Codex, Gemini/Antigravity). It carries no business logic and no vendor-specific rules. New projects inherit from it.

Repository: https://github.com/codal-ravig/nextjs-sanity-ai-boilerplate

## Quick start

1. Create an empty folder for your new project and open your AI agent in it.
2. Open [`BOOTSTRAP-PROMPT.md`](BOOTSTRAP-PROMPT.md) (on GitHub, or from a clone). Fill in `PROJECT_NAME` and `TICKET_PREFIX`. Leave `BASELINE_PATH` empty and the agent clones this repo for you, or point it at a local clone.
3. Paste the prompt. The agent prints a plan and waits. Review it, then reply `go`.
4. The agent scaffolds the app, installs the baseline, runs the checks and reports. You review and commit. The agent never commits or pushes.
5. Fill in `docs/architecture.md` (source-of-truth table), `.github/CODEOWNERS` and `.env.example`.

Requirements: Node (see `.nvmrc`), Corepack enabled (`corepack enable`), and an AI agent that can read files and run commands.

## Always the latest

The bootstrap prompt tells the agent to use the latest stable version of every tool, check the registry before pinning, read the installed Next.js docs in `node_modules/next/dist/docs/`, and pin exact versions. Where the baseline's wording lags the installed version, the installed docs win and the agent reports the difference. Do not hand-edit the pins in the prompt.

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

This repository is configuration and docs only. The Next.js app, Sanity Studio, tests and tokens are generated into your project by the bootstrap prompt.

## Principles

1. Security first. Security and source-of-truth boundaries beat implementation convenience.
2. Layering is enforced by tooling, not goodwill: `app -> components -> domain -> services -> lib -> external system`.
3. One configuration, many agents. Symlinks and pointer files, never copies.
4. Docs describe code that exists. `docs-sync` and `flow-context` keep them true.
5. AI never commits or pushes. A human reviews and commits.

## After adopting

Run `node scripts/check-claude-config.js` after any change to `.github/instructions/` or `.github/agents/`. Use `corepack pnpm validate` before every PR. Record the baseline tag you adopted (for example `v1.0.0`) in your project's `docs/ai-workflow.md`.

## Maintaining the baseline

* Keep it domain-free. Run the leftover-term grep from `BOOTSTRAP-PROMPT.md` before every release.
* Vendored skills come from upstream repos and are pinned by hash in `skills-lock.json`. Review `SKILL.md` diffs before updating a pin.
* Version the baseline with tags (`v1.0.0`) so projects can record which version they adopted.
* When you change the baseline, update `BOOTSTRAP-PROMPT.md` in the same PR so the copy list and the checks stay true.

## License

Add your preferred license before publishing.
