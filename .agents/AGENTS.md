# <project-name>: Project Rules

> Project-scoped rules for Gemini / Antigravity workspace customization.

## Project Context

This is a **Next.js 16** application with TypeScript, React and Vitest, using **Sanity** for editorial content. Describe the rest of your stack, auth approach and external systems in [`docs/architecture.md`](../docs/architecture.md), not here.

**Before writing code, read [`docs/architecture.md`](../docs/architecture.md).** It sets out layering, source-of-truth ownership, and the invariants every change must hold. Reviewer routing is in [`.github/agents/orchestrator.md`](../.github/agents/orchestrator.md).

Then check whether a spec already covers the area. [`.ai/specs/`](../.ai/specs/README.md) holds feature specs. Each opens with a `> **Status (date):**` header saying what is actually built, and every task carries a `NOT STARTED` / `PARTIALLY DONE` / `DONE` marker. Read that status header before trusting a spec as a description of current behavior, and prefer `docs/flows/` for mechanics.

New to this setup? [`docs/ai-workflow.md`](../docs/ai-workflow.md) explains what loads automatically, what has to be invoked, and the traps.

## Skills (Apply to All Agents)

Nine skills are installed in `.agents/skills/`. Consult the relevant one whenever you touch the area it covers. The first five are not optional reading for work in their domain:

| Skill | Path | When to Consult |
| --- | --- | --- |
| **Vercel React Best Practices** | `.agents/skills/vercel-react-best-practices/SKILL.md` | Writing, reviewing, or refactoring React components and Next.js pages for performance |
| **Next Cache Components Adoption** | `.agents/skills/next-cache-components-adoption/SKILL.md` | Enabling Cache Components and resolving blocking routes during migration |
| **Next Cache Components Optimizer** | `.agents/skills/next-cache-components-optimizer/SKILL.md` | Optimizing caching behavior, `"use cache"`, `cacheLife`, and route prerendering |
| **React Doctor** | `.agents/skills/react-doctor/SKILL.md` | Scans for lint, accessibility, bundle size, architecture, and regression checks |
| **Flow Context** | `.agents/skills/flow-context/SKILL.md` | **Before changing an area.** Names the flow doc and specs that describe it, and which of their claims to distrust |
| **Docs Sync** | `.agents/skills/docs-sync/SKILL.md` | **After any non-trivial code change.** Keeps `docs/flows/` from drifting, editing the affected passage rather than rewriting a document |
| **Figma to Component** | `.agents/skills/figma-to-component/SKILL.md` | Building or updating a design-system component or page from a Figma MCP pull |
| **Ponytail** | `.agents/skills/ponytail/SKILL.md` | Any coding task, to force the smallest solution that actually works before reaching for an abstraction or a dependency |
| **Caveman** | `.agents/skills/caveman/SKILL.md` | Only on request, when heavily compressed output is wanted |

`flow-context` and `docs-sync` are the bookends of a change, and the pair most often skipped. Documentation tends to outlive the code it describes, so read the area's documents before you change it and treat the change as unfinished until they are true again.

In Claude Code this is not left to judgment: a `SessionStart` hook injects the index of areas, flow docs and specs, and a `PreToolUse` hook names the documents for whatever file is about to be edited. Both are configured in `.claude/settings.json` and read the same map, `scripts/lib/ai-context-map.js`. Other tools have no hook equivalent, which is why every area's instruction file also names its own documents.

### Where these come from

Five of the nine are vendored from upstream repositories and pinned by source and content hash in the **root** [`skills-lock.json`](../skills-lock.json): `caveman`, `next-cache-components-adoption`, `next-cache-components-optimizer`, `ponytail` and `vercel-react-best-practices`. Update a vendored skill by re-pulling it and refreshing that hash, not by hand-editing the copy in `.agents/skills/`.

`docs-sync`, `react-doctor`, `flow-context` and `figma-to-component` are **not** in the lock file. Treat them as locally maintained: edit them in place.

`.claude/skills/` exposes the same set to Claude Code, and **every entry there is a symlink back into `.agents/skills/`**, so each skill has exactly one copy. `.agents/skills/` is the source of truth; edit a skill there and Claude Code picks it up with no further step.

Whenever you add a skill here, add the matching symlink in `.claude/skills/`, or Claude silently will not see it:

```bash
ln -s ../../.agents/skills/<name> .claude/skills/<name>
```

## AI Agent Configuration

All agent definitions, rules, prompts, and coding instructions are in `.github/`:

- **Agents:** `.github/agents/`: role definitions for review, security, testing, performance, content and prompt quality agents.
- **Rules:** `.github/rules/`: enforcement rules (coding standards, security, testing, validation gate).
- **Prompts:** `.github/prompts/`: prompt templates for agent workflows.
- **Instructions:** `.github/instructions/`: file-scoped coding instructions with `applyTo` globs.

## Mandatory Workflow

Every code change must follow the **Validation Gate** (`.github/rules/validation-gate.md`). That file is authoritative; this is only a summary of its seven steps:

1. **Understand.** Read the existing code first. Identify the architectural layer, the external systems touched, and which system is the source of truth. If ownership is unclear, stop and resolve it before implementing.
2. **Check what exists.** Do not add a second client or duplicate integration for a system that already has one.
3. **Assess implications.** Security, privacy, caching, performance, and what happens on timeout, outage or duplicate submission.
4. **Implement.** The smallest clean change at the correct layer.
5. **Test.** Positive, negative and edge cases. Failure scenarios are mandatory for anything touching money, entitlement or an external boundary, and every bug fix needs a regression test. A change that adds or alters a journey on the E2E list in `.github/instructions/testing.instructions.md` also gets a Playwright spec in `e2e/` (or a named follow-up ticket) and its flow doc update. If no CI job runs E2E, run `pnpm test:e2e` locally.
6. **Validate.** Run the gate (see below).
7. **Report.** What changed, at which layers, what was tested, what was **not**, and any assumption made.

### Blocking conditions

Do not merge if any of these is true. They are not advisory:

- Source-of-truth ownership for a new field is unresolved.
- A secret is reachable from browser code.
- Authorization is enforced only in the UI.
- A side-effecting call is retried blindly.
- User-specific content shares a cache key across users.
- `any` was introduced.
- A boundary rule was disabled globally to unblock one call site.

When a check fires, fix the cause. Do not add an `eslint-disable`, widen a type, or delete the check.

## Running the gate

```bash
corepack pnpm validate   # lint + type:check + test + audit:architecture
```

**Use `corepack pnpm`, never the bare `pnpm` on `PATH`.** The repo pins pnpm via `packageManager` in `package.json`, and a mismatch fails in confusing ways. If `corepack pnpm --version` errors, run the pinned version's binary from the corepack cache, or install the pinned version globally with `npm i -g pnpm@<pinned-version>`. This blocks every commit, because `.husky/pre-commit` runs the full gate (`lint-staged`, lint, the Sanity TypeGen drift check, type-check, tests, `audit:architecture` and the production build).

`validate` does **not** include the build. Run `corepack pnpm build` too when the change could affect the RSC/client boundary, route collection or `generateStaticParams`, since lint, tsc and unit tests all pass on code that fails to build. CI runs the build on every push and pull request regardless.

## Key Rules

- Follow coding standards in `.github/rules/coding-rules.md`
- Follow security standards in `.github/rules/security-rules.md`
- Follow testing standards in `.github/rules/testing-rules.md`
- Use Vitest for tests; see `.github/rules/vitest-test-agent.md` for setup and conventions
- All external-system calls go through the `services/` layer, never direct SDK usage from components
- Always use absolute imports with the `@/` path alias (e.g. `@/components/...`, `@/lib/...`) for internal modules instead of relative paths (`./` or `../`)
