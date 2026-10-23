<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` (verify at `node_modules/next/dist/server/lib/generate-agent-files.js`). Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# <project-name>: AI Home Ground

> Everything above is managed by `next dev`. Everything below is ours.

**Before writing any code, read [`docs/architecture.md`](docs/architecture.md).**

A Next.js 16 application (App Router, RSC) with React 19 and TypeScript `strict`, using **Sanity** for editorial content. Fill in the rest of the stack in `docs/architecture.md`.

> Next.js orchestrates the experience. Each external platform remains the source of truth for its own domain.
>
> `UI → domain → services → lib → external system`

## Start here

| Document | Covers |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | **Start here.** Layering, source of truth, integration boundaries |
| [`docs/naming-conventions.md`](docs/naming-conventions.md) | File, component, hook, service, type and constant naming |
| [`docs/adr/`](docs/adr/) | Why things are the way they are |
| [`docs/flows/README.md`](docs/flows/README.md) | Index of flow docs: how each user journey and integration actually works |
| [`docs/ai-workflow.md`](docs/ai-workflow.md) | How this AI configuration loads and is used, and the traps |
| [`docs/repository-workflow.md`](docs/repository-workflow.md) | Branching, review and release conventions |
| [`.ai/specs/README.md`](.ai/specs/README.md) | Feature specs, and the template they follow |
| [`.github/agents/orchestrator.md`](.github/agents/orchestrator.md) | Which reviewers a change needs |
| [`.github/rules/validation-gate.md`](.github/rules/validation-gate.md) | The mandatory workflow for every change |

Instructions in `.github/instructions/` apply automatically by `applyTo` glob.

## Always-on invariants

1. **One owner per domain.** Each external system owns its own data (content, identity, search, payments, and so on). Record who owns what in `docs/architecture.md` and never duplicate or re-derive another system's data.
2. Never call an external API directly from a React component. Go through `services/`.
3. **`any` is prohibited.** Enforced as an ESLint error.
4. Never expose secrets to browser code. No privileged credential gets a `NEXT_PUBLIC_` prefix.
5. **Never trust client values.** Client-supplied identity, role, price, totals and entitlements are claims, not facts. A resource ID in a request is a **claim**: verify ownership server-side before acting on it.
6. **Never blindly retry a side-effecting call.** A timeout means _unknown_, not _failed_. Retry helpers must refuse non-idempotent methods.
7. Idempotency uses a store with a real uniqueness guarantee, never in-memory state.
8. User-specific content is cache-isolated. Never share a cache key across users or accounts.
9. **Webhooks are verified before any side effect**, with a constant-time comparison, and fail closed when the secret is unset (in every environment).
10. **Preview and draft endpoints are authenticated.** Never activate draft mode from a query parameter alone.
11. **Treat CMS, user and AI-generated content as untrusted.** Validate at the boundary; never render it with `dangerouslySetInnerHTML`.
12. Security and source-of-truth boundaries beat implementation convenience.
13. Every change, AI-generated or hand-written, is reviewed against WCAG 2.1 (`pnpm lint` enforces jsx-a11y's recommended rules; judgment calls live in `.github/agents/code-review.md`), OWASP (`.github/agents/security.md`, `.github/rules/security-rules.md`) and architecture (`.github/agents/architecture.md`) before commit. This repo documents no separate regulatory-compliance framework: flag anything else as an open question, never assume it.

Run `pnpm lint`, `pnpm type:check` and `pnpm test` before opening a PR.

> **Use the package-manager version the repo pins** (via `packageManager` in `package.json`, for example `corepack pnpm`). A version mismatch triggers confusing store-location errors.
