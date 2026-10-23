# Bootstrap prompt

Paste everything below the line into your AI agent, opened in the NEW project folder. Set `BASELINE_PATH` first.

---

# TASK: Create a new "AI-native Next.js + Sanity" project from the baseline

BASELINE_PATH=<absolute path to your local clone or unzipped copy of this baseline repo>
PROJECT_NAME=<your project name>
TICKET_PREFIX=<e.g. PROJ>

The baseline at BASELINE_PATH is the single source for AI configuration, rules, skills, hooks, docs and CI. It is domain-free. Your job is to scaffold a working Next.js + Sanity app in the current folder and install the baseline into it, adapted to this project, with security as the top priority.

## 0. Operating rules

1. Plan first. Print the planned file tree and a one-line reason per top-level item, then wait for my "go". After "go", work without questions unless blocked.
2. Verify, do not assume. Read current docs before writing code: Next.js (`node_modules/next/dist/docs/` after install), Sanity (Sanity MCP `search_docs`/`read_docs`/`get_sanity_rules` if connected), React, Tailwind, Vitest, Playwright, ESLint flat config. Pin exact, current, stable versions. Heed deprecations.
3. Use `corepack pnpm` everywhere. Pin `packageManager`. One lockfile.
4. Never run `git commit` or `git push`. When done, give me a commit message in the repo's Smart Commit format.
5. No `any`, no suppressed lint rules, no secrets in files. Report outcomes faithfully, show failing output.
6. Avoid em dashes and double hyphens in prose you write.
7. Never copy domain content. If you find any in the baseline (a company, vendor or commerce-specific rule), stop and tell me.

## 1. Install the baseline

Copy from BASELINE_PATH, preserving symlinks (`cp -R` or `rsync -a`):
`AGENTS.md CLAUDE.md GEMINI.md .cursor .agents .claude .github .ai .husky .vscode .mcp.json .commit-rules.json .gitleaks.toml .prettierrc .lintstagedrc.js .nvmrc skills-lock.json eslint.config.mjs SECURITY.md scripts docs`
Then:
* Replace placeholders (`PROJ`, `<your-org>`, `<project-name>`) with PROJECT_NAME / TICKET_PREFIX values and update `ticketKeyPattern` in `.commit-rules.json`.
* Do not copy `README.md` or `BOOTSTRAP-PROMPT.md`. Write a project README instead.
* Confirm `.claude/rules`, `.claude/agents` and every `.claude/skills/*` are still symlinks.

## 2. Scaffold the app (latest stable)

* Next.js App Router, React 19, TypeScript `strict` plus `noUncheckedIndexedAccess`, `src/` layout, alias `@/*`, Cache Components where supported.
* Tailwind CSS v4 (CSS-first tokens), shadcn/ui + Radix in `src/components/ui/`, `next/font`, `next/image`.
* Sanity Studio embedded at `/studio` with TypeGen (`sanity schema extract` + `sanity typegen generate`, generated types committed), Visual Editing + Draft Mode, Portable Text renderer, singletons via Studio structure, shared field factories (SEO, link, image with required alt), server-only read token.
* Zod at every trust boundary. Typed env module (`src/lib/env.ts`, server and public split, fails fast). `.env.example` lists every variable.
* Vitest + Testing Library, Playwright in `e2e/` (credentials only from `.env.test`).
* Folder layout: `src/{app,components,domain,services,lib,hooks,types,styles}` with the layering `app -> components -> domain -> services -> lib -> external system`.
* package.json scripts: `dev build start lint type:check test test:e2e sanity:typegen audit:architecture validate` (`validate` = lint + type:check + test + audit:architecture).
* Husky pre-commit: lint-staged, lint, TypeGen drift check, type-check, tests, architecture audit, build.

## 3. Security layer

* Security headers (strict CSP with nonces, allowing Sanity Studio and Presentation origins explicitly, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors scoped for Presentation).
* `/api/draft`, `/api/disable-draft` authenticated. `/api/revalidate` verifies the webhook signature with constant-time comparison and rejects replays.
* A `fetchWithRetry` in `src/lib/` that refuses non-idempotent methods, with tests.
* Rate limiting and input validation pattern for route handlers.
* CI from `.github/workflows/` must run and pass in principle (gitleaks, audit, CodeQL, lint, types, tests, build, TypeGen drift).

## 4. Starter content (minimum to prove it works)

Home page and one dynamic page driven by a Sanity page builder with three generic blocks (hero, rich text, link list). `sitemap.ts`, `robots.ts`, `generateMetadata` from Sanity SEO, `loading.tsx`, `error.tsx`, `not-found.tsx`. One service in `src/services/content/`. Tests for the service, the revalidate route (bad signature and replay cases) and `fetchWithRetry`. One Playwright smoke spec.

## 5. Design tokens

`src/styles/tokens.css` with CSS variables, light and dark. DM Sans for headings and body, DM Mono for small links, breadcrumbs and tags. Light: background #F9F9F9, headline #0B111F, body #393C45, links and accents #3416F5. Dark: background #0B111F, headline #FFFFFF, body #F9F9F9, links and accents #D7D5FD. Verify WCAG AA contrast in both themes and report ratios.

## 6. Make the docs true

Fill `docs/architecture.md` (source-of-truth table) for this project, update `scripts/lib/ai-context-map.js` with this project's areas, and make sure every link in `AGENTS.md`, `.github/copilot-instructions.md` and the docs resolves.

## 7. Definition of done (run it, show output)

1. `corepack pnpm install`, then `lint`, `type:check`, `test`, `audit:architecture`, `build` pass.
2. `node scripts/check-claude-config.js` passes.
3. Run both hook scripts by hand and show their output.
4. Add a throwaway layer-violating import, show lint/audit failing, remove it.
5. Grep the repo for leftover project-specific terms from any earlier project that contributed to this baseline (company names, vendor names, ticket prefixes other than TICKET_PREFIX, personal usernames, absolute user paths). Must return zero hits.
6. Final report: file tree, what was copied versus created, assumptions, open questions, skipped items, and a suggested commit message.

Start with section 0, step 1: the plan. Do not write files until I say "go".
