# <project-name>: AI Coding Instructions

> Root-level configuration for GitHub Copilot and AI coding assistants working on this project.

## Project Overview

A **Next.js 16** application (App Router, RSC) using TypeScript, React, Vitest, and **Sanity** for editorial content. Describe the specifics of your stack in [`docs/architecture.md`](../docs/architecture.md).

## Read first

**Before writing any code, read [`docs/architecture.md`](../docs/architecture.md).** It sets out the layering every change must respect, and **who owns which data** across your external systems. Getting ownership wrong is the most expensive mistake available in a composable architecture.

| Document | Covers |
| --- | --- |
| [`docs/architecture.md`](../docs/architecture.md) | **Start here.** Layering, source of truth, integration boundaries, security posture |
| [`docs/naming-conventions.md`](../docs/naming-conventions.md) | File, component, hook, service, type and constant naming |
| [`docs/adr/`](../docs/adr/) | Decisions and their reasoning |
| [`docs/ai-workflow.md`](../docs/ai-workflow.md) | How this AI configuration is actually used: what loads automatically, what you invoke, and the traps |
| [`docs/repository-workflow.md`](../docs/repository-workflow.md) | Branching, review and release conventions |
| [`docs/flows/README.md`](../docs/flows/README.md) | Index of the flow docs, one per journey or integration |
| [`.ai/specs/README.md`](../.ai/specs/README.md) | Feature specs and the template they follow. Read each spec's `> **Status (date):**` header before trusting it as current behavior |
| [`.github/rules/validation-gate.md`](rules/validation-gate.md) | The mandatory workflow for every change |

**Facts commonly assumed wrong.** Record the ones that apply to your project here, such as which system owns identity, which flag gates the CMS, and which direction a handoff flows. A short list that is true beats a long list that drifts.

## Mandatory AI workflow

Every task (feature, fix, refactor, or config change, AI-driven or not) follows this sequence. These are requirements, not suggestions: skipping a step is a defect in the change, not a shortcut.

1. **Understand the request.** Restate the goal; if a ticket is given, its acceptance criteria are validated later per `.github/agents/review-agent.md`.
2. **Identify applicable rules.** Check `.github/instructions/` for any `applyTo` glob matching the files about to change, plus `.github/rules/coding-rules.md`.
3. **Identify the architecture layer** the change belongs in (`app/` → `components/` → `domain/` → `services/` → `lib/`), per `docs/architecture.md`.
4. **Identify the source of truth** for any data involved, per `docs/architecture.md`. If ownership is unclear, **stop and resolve it before writing code**.
5. **Identify security implications**: `.github/rules/security-rules.md`, and `.github/agents/security.md` for anything touching auth, user data, pricing or entitlements, or webhooks.
6. **Identify accessibility requirements** for any UI change: `.github/instructions/ui.instructions.md` and `component.instructions.md`. `pnpm lint` enforces the mechanical subset (see below); contrast, focus order, and meaningful alt text are judgment calls to get right before review.
7. **Check for an existing service, component, or utility** before adding a new one (`.github/rules/validation-gate.md` §2).
8. **Implement the smallest appropriate change** at the correct layer.
9. **Cover E2E journeys.** If the change adds or alters a journey on the E2E list in `.github/instructions/testing.instructions.md`, write a Playwright spec in `e2e/` following `e2e/README.md`, or name the follow-up ticket that will, and update the journey's flow doc in `docs/flows/` (`.github/rules/validation-gate.md` §5). If no CI job runs E2E, run `pnpm test:e2e` locally and report what it covered.
10. **Run validation** (`pnpm validate`) and fix anything it flags rather than explaining it away. A failing check is not "pre-existing" unless verified against the base branch.
11. **Review the diff before reporting completion:** does it do only what was asked, does it introduce `any` / a suppressed lint rule / an unjustified new dependency, and does it match `docs/naming-conventions.md`.

Report what changed, what was tested, and any assumption made, per `validation-gate.md` §7. Escalate genuinely ambiguous source-of-truth or security questions rather than guessing.

## Directory Layout

AI configuration lives under four directories. `.github/` holds the substance; the others are entry points for particular tools, plus the spec directory.

```
.github/
├── agents/          Agent role definitions (who reviews what)
├── instructions/    File-scoped coding instructions, applied by applyTo glob
├── prompts/         Prompt templates for agent workflows
└── rules/           Enforcement rules and quality gates

.agents/
├── AGENTS.md        Project-scoped rules (Gemini / Antigravity entry point)
└── skills/          Reusable skill packs, the source of truth for all nine
    ├── vercel-react-best-practices/     React and Next.js performance guidelines
    ├── next-cache-components-adoption/  Cache Components migration and blocking routes
    ├── next-cache-components-optimizer/ Cache Components tuning, "use cache", cacheLife
    ├── react-doctor/                    Lint, accessibility, bundle size, regression checks
    ├── flow-context/                    Names an area's docs and specs before you change it
    ├── docs-sync/                       Keeps docs/flows/ from drifting after a code change
    ├── figma-to-component/              Turns a Figma MCP pull into a repo-native component
    ├── ponytail/                        Forces the smallest solution that actually works
    └── caveman/                         Heavily compressed output, on request only

.claude/
├── launch.json      Dev server configs
├── settings.json    SessionStart and PreToolUse context hooks
├── rules/           Symlink to .github/instructions/ (Claude reads `paths`, Copilot `applyTo`)
├── agents/          Symlink to .github/agents/
└── skills/          Symlinks into .agents/skills/, one per skill, no duplicated content

.ai/
└── specs/           Feature specs (see .ai/specs/README.md)
```

Five of the nine skills are vendored and pinned by source and hash in the root `skills-lock.json`; `docs-sync`, `react-doctor`, `flow-context`, and `figma-to-component` are maintained locally. When adding a skill, add the matching symlink in `.claude/skills/` or Claude Code will not see it.

## Skills (Shared Across All Agents)

These skills contain framework-specific patterns that **every agent must consult** when reviewing, testing, securing, or optimizing related code:

| Skill | When to Consult |
| --- | --- |
| **Vercel React Best Practices** (`.agents/skills/vercel-react-best-practices/SKILL.md`) | Writing, reviewing, or refactoring React components and Next.js pages for performance |
| **Next Cache Components Adoption** (`.agents/skills/next-cache-components-adoption/SKILL.md`) | Enabling Cache Components and resolving blocking routes |
| **Next Cache Components Optimizer** (`.agents/skills/next-cache-components-optimizer/SKILL.md`) | Optimizing caching behavior, `"use cache"`, `cacheLife`, and prerendering |
| **React Doctor** (`.agents/skills/react-doctor/SKILL.md`) | Scans for lint, accessibility, bundle size, architecture, and regression checks |
| **Flow Context** (`.agents/skills/flow-context/SKILL.md`) | **Before changing an area.** Names the flow doc and specs that describe it, and which of their claims to distrust |
| **Docs Sync** (`.agents/skills/docs-sync/SKILL.md`) | **After any non-trivial code change.** Keeps `docs/flows/` in step with the code, editing the affected passage rather than rewriting a document |
| **Figma to Component** (`.agents/skills/figma-to-component/SKILL.md`) | Building or updating a design-system component or page from a Figma MCP pull: maps tokens, translates MCP output to this repo's Tailwind setup, and enforces the component, naming and a11y instructions |
| **Ponytail** (`.agents/skills/ponytail/SKILL.md`) | Any coding task, to force the smallest solution that works before reaching for an abstraction or a dependency |
| **Caveman** (`.agents/skills/caveman/SKILL.md`) | Only on request, when heavily compressed output is wanted |

`flow-context` and `docs-sync` are the bookends of a change, and the pair most often skipped. Documentation tends to outlive the code it describes, so read an area's documents before changing it and update them before calling the change done.

Each area's instruction file under `.github/instructions/` also names its own flow doc and specs, so the pointer arrives automatically with the instructions rather than depending on anyone reaching for the skill.

## Agents

Start with the **Orchestrator**, which routes a change to the smallest appropriate set.

The Security, Testing and Performance reviewers each absorbed an earlier ticket-driven `*-agent.md` counterpart. OWASP categories, coverage targets, performance budgets and output formats now live in the reviewer itself, so there is one file per role and no question about which to read. The remaining `*-agent.md` files cover process steps the reviewers do not: gathering ticket context, and scoring a prompt before work begins.

| Agent | File | Purpose |
| --- | --- | --- |
| **Orchestrator** | `.github/agents/orchestrator.md` | **Routes a change to the right reviewers** |
| **Architecture** | `.github/agents/architecture.md` | Boundaries, source of truth, duplicate integrations |
| **Security** | `.github/agents/security.md` | Secrets, authz, input, webhooks, cache isolation |
| **Integration** | `.github/agents/integration.md` | External-system contracts: idempotency, retries, payload minimization, webhooks |
| **Content** | `.github/agents/content.md` | Sanity: TypeGen, GROQ, Portable Text, preview |
| **Performance** | `.github/agents/performance.md` | RSC boundary, waterfalls, caching, images |
| **Testing** | `.github/agents/testing.md` | Coverage of risk, failure scenarios |
| **Code Review** | `.github/agents/code-review.md` | Correctness, maintainability, conventions |
| **Spec** | `.github/agents/spec.md` | **Owns `.ai/specs/`.** Turns a requirement into an implementation-ready spec, and defines the template every spec in that directory follows. Specification first, implementation second: it produces no application code |
| Context Collector | `.github/agents/context-collector-agent.md` | Gathers ticket and technical context before other agents run |
| Review | `.github/agents/review-agent.md` | Code quality, correctness, and standards review |
| Prompt Quality | `.github/agents/prompt-quality-agent.md` | Prompt analysis and optimization before task execution |

## Rules

| Rule Set | File | Scope |
| --- | --- | --- |
| Coding Rules | `.github/rules/coding-rules.md` | General coding standards: tooling-enforced rules, naming, functions, comments, errors, imports, dependencies |
| Security Rules | `.github/rules/security-rules.md` | OWASP, auth, secrets, input validation |
| Testing Rules | `.github/rules/testing-rules.md` | Coverage guidance, AAA pattern, mocking |
| Prompt Quality Rules | `.github/rules/prompt-quality-rules.md` | Prompt scoring and blocking criteria |
| Validation Gate | `.github/rules/validation-gate.md` | Mandatory 7-step workflow, plus the blocking conditions, for every code change |
| Vitest Test Agent | `.github/rules/vitest-test-agent.md` | Vitest setup and conventions: config, where tests live, mocking, coverage |

## Instructions

File-scoped instructions are in `.github/instructions/` and apply automatically based on their `applyTo` glob patterns. See each file's YAML frontmatter for scope.

## Pre-commit review: WCAG, OWASP, architecture, compliance

Every change, AI-generated or hand-written, is reviewed the same way, against the guidelines that already exist in this repository rather than a separate framework:

| Concern | How it is checked |
| --- | --- |
| **WCAG 2.1** | `pnpm lint` runs jsx-a11y's recommended rule set at error severity (see `eslint.config.mjs`), so labeling, keyboard/focus, heading/anchor content, redundant roles, media captions and autofocus violations already fail the build. Judgment calls lint cannot make (contrast, focus order, meaningful alt text, announcing dynamic content) are reviewed per the Accessibility checklist in `.github/agents/code-review.md` and `.github/instructions/ui.instructions.md` / `component.instructions.md`. |
| **OWASP Top 10** | `.github/agents/security.md` maps findings to OWASP IDs; `.github/rules/security-rules.md` is the enforceable rule set. Automated coverage: `.github/workflows/security-scans.yml` (gitleaks over the PR diff, blocking), `.github/workflows/dependency-audit.yml` (`pnpm audit`, blocking on high and critical) and `.github/workflows/codeql.yml` (static analysis). `pnpm run audit:architecture` mechanically checks security invariants a scanner cannot, such as constant-time secret comparison and no privileged `NEXT_PUBLIC_` credential. |
| **Compliance** | This repository documents no separate regulatory framework (for example PCI or GDPR) beyond `security-rules.md` and `docs/architecture.md`'s source-of-truth boundaries. Treat those as authoritative; if a change raises a compliance question they do not answer, say so as an open question rather than assuming a requirement. |
| **Architecture and code quality** | `.github/rules/validation-gate.md` is the mandatory workflow; `.husky/pre-commit` runs `lint-staged`, lint, the Sanity TypeGen drift check, type-check, tests, `audit:architecture` and the production build before every commit, and CI runs the same checks again (`.github/workflows/lint_type_check.yml`). |

This reuses the existing hook, scripts and reviewer docs. It does not add a second review pipeline: everything routes through the Orchestrator (`.github/agents/orchestrator.md`) to the existing reviewers.

## Workflow

The recommended agent pipeline order is:

```
Context Collector → Review → Security → Performance → Testing
```

Every code change must follow the **Validation Gate** workflow defined in `.github/rules/validation-gate.md`.

## Running the gate

```bash
corepack pnpm validate   # lint + type:check + test + audit:architecture
```

**Use `corepack pnpm`, never the bare `pnpm` on `PATH`.** The repo pins pnpm through `packageManager` in `package.json`, and a mismatch fails confusingly. If `corepack pnpm --version` errors, run the pinned version's binary from the corepack cache, or install the pinned version globally with `npm i -g pnpm@<pinned-version>`. This blocks every commit, because `.husky/pre-commit` runs the whole gate, plus the Sanity TypeGen drift check and a production build.

`validate` does not include the build. Run `corepack pnpm build` as well when a change could affect the RSC/client boundary, route collection or `generateStaticParams`, since lint, tsc and unit tests all pass on code that fails to build.
