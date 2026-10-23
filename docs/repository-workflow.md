# Repository Structure, Branching and PR Workflow

The contributor guide: where code goes, how to branch, and what a pull request needs. Companions: [`architecture.md`](./architecture.md), the [validation gate](../.github/rules/validation-gate.md), [`git.instructions.md`](../.github/instructions/git.instructions.md) and, for the AI tooling, [`ai-workflow.md`](./ai-workflow.md).

## Repository structure

```text
app / components  ->  domain  ->  services  ->  lib  ->  external system
```

| Location | Put here | Do not put here |
| --- | --- | --- |
| `src/app/` | Routes, layouts, route handlers, composition | Business logic or direct external calls |
| `src/components/` | UI that renders props | Data fetching, vendor clients |
| `src/domain/` | Business rules, pure functions | React, request state, vendor clients |
| `src/services/` | External-system calls and response mapping | UI concerns |
| `src/lib/` | Vendor clients, config, cache and transport helpers | Imports from higher layers |
| `src/types/` | Shapes shared across layers | Runtime logic |
| `sanity/` | Studio schema, structure, plugins | Imports from `src/` |
| `scripts/` | Audits, migrations, developer tooling | Route or feature logic |
| `docs/` | Architecture, ADRs, flows, guidance | Source code |
| `e2e/` | Playwright journeys | Unit tests |

### Where code goes

| If code... | It belongs in |
| --- | --- |
| Calls an external system | `src/services/` |
| Is a business rule | `src/domain/` |
| Is a route, layout or route handler | `src/app/` |
| Renders UI from props | `src/components/` |
| Is a vendor client or config | `src/lib/` |
| Describes a shared shape | `src/types/` |
| Audits or provisions the repository | `scripts/` |

ESLint enforces the layer boundaries. If a change seems to need an exception, move the logic to the correct layer instead of disabling the rule.

## Branching model

Choose one trunk branch for the team (commonly `main` or `development`) and record its real name here when you adopt this baseline. Branch from it, keep branches short-lived, and scope each to one logical change.

Name branches `type/short-description`:

```text
feat/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>
```

Examples: `feat/search-filters`, `fix/nav-focus-order`, `chore/upgrade-sanity`.

Hotfixes branch from the production branch, ship, then merge back to the trunk. Release branches are optional: use them only if you release on a schedule that needs a stabilization period.

## Commits

Subjects follow the Jira Smart Commit format, validated by `.husky/commit-msg` and `scripts/validate-commit-msg.js`:

```text
[<type>: ]<TICKET-KEY>[, <TICKET-KEY>...] [#time <duration>] <summary>
```

Example: `fix: PROJ-123 Fix the navigation focus order`. Rules live in `.commit-rules.json`. Merge, revert, `wip`, initial-commit and dependency-bot subjects are exempt.

An AI assistant never commits or pushes. See [`git.instructions.md`](../.github/instructions/git.instructions.md).

## Pull requests

### Base branch and title

Open against the trunk. The title uses the same Smart Commit format as the squash-merge commit.

### Description

Cover what changed, why, how it was tested, and any rollout consideration (feature flag, migration, new environment variable). A change someone can see includes screenshots or states "no UI change". If a pull request cannot be described in a couple of sentences, split it.

### Required checks

| Check | Command |
| --- | --- |
| Lint | `corepack pnpm lint` |
| Types | `corepack pnpm type:check` |
| Unit tests | `corepack pnpm test` |
| Architecture audit | `corepack pnpm audit:architecture` |
| Build | `corepack pnpm build` |
| Sanity TypeGen drift | schema extract and typegen, then no diff |
| Commit subjects | `scripts/validate-commit-msg.js` over the PR range |

`pnpm validate` runs lint, types, tests and the audit. It does not run the build, so build too when a change could affect the server and client boundary or route collection. Pre-commit and CI should run the same checks, so a bypassed hook fails in CI instead.

### Review routing

Ask the `orchestrator` agent which reviewers a change needs ([`.github/agents/orchestrator.md`](../.github/agents/orchestrator.md)). Do not run every reviewer on every change, and do not skip security review on auth, data or webhook work.

### Merge strategy

Squash-merge by default, so the trunk keeps one commit per logical change. Never merge with a failing check. Fix forward or revert.

### Branch protection

Recommended settings for the trunk: require a pull request, require the checks above, require at least one approving review, require review from code owners (see `.github/CODEOWNERS`), dismiss stale approvals on new commits, block force pushes and deletion.

## Prerequisites

- Node version from `.nvmrc`.
- pnpm through Corepack: run `corepack pnpm ...`, not a bare `pnpm` on your PATH, so the pinned `packageManager` version is used.
- Git hooks installed by `husky` on `pnpm install`.
- Environment variables copied from `.env.example`. Never commit a real `.env` file.
