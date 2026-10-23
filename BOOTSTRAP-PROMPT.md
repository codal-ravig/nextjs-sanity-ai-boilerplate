# Bootstrap prompt

Use this to create a new project from the baseline. Open your AI agent (Claude Code, Copilot agent mode, Cursor, Codex, Gemini) in an **empty folder for the new project**, fill in the three values, then paste everything below the line.

---

# TASK: Create a new "AI-native Next.js + Sanity" project from the baseline

BASELINE_REPO=https://github.com/codal-ravig/nextjs-sanity-ai-boilerplate.git
BASELINE_PATH=<optional: absolute path to an existing local clone. Leave empty to clone BASELINE_REPO into a temp folder>
BASELINE_REF=<optional: tag or branch to clone, e.g. v1.0.0. Default: the repo's default branch>
PROJECT_NAME=<your project name>
TICKET_PREFIX=<e.g. PROJ>

The baseline is the single source for AI configuration, rules, skills, hooks, docs and CI. It is domain-free. Your job is to scaffold a working Next.js + Sanity app in the current folder and install the baseline into it, adapted to this project. Security is the top priority and wins every conflict.

## 0. Operating rules

1. **Plan first.** Print the planned file tree and a one-line reason per top-level item, then wait for my "go". After "go", work without questions unless blocked.
2. **Latest, verified, pinned.** Always use the latest stable version of every tool. Before pinning, check the registry (`corepack pnpm view <pkg> version`) and read the current docs: Next.js (`node_modules/next/dist/docs/` after install, then nextjs.org/docs), Sanity (Sanity MCP `search_docs`, `read_docs`, `get_sanity_rules` if connected), React, Tailwind, Vitest, Playwright, ESLint flat config. Pin exact versions, never `latest` or ranges. Heed deprecations. If the baseline mentions an API the installed version no longer has, follow the installed docs and say so in the report.
3. **`corepack pnpm` everywhere.** Pin `packageManager` in `package.json`. One lockfile.
4. **Never run `git commit` or `git push`.** Stage only if I ask. When done, give me a commit message in the repo's Smart Commit format.
5. No `any`, no suppressed lint rules, no secrets in files. Report outcomes faithfully and show failing output.
6. Avoid em dashes and double hyphens in prose you write.
7. **Stay domain-free.** If the baseline contains a company, vendor or commerce-specific rule, stop and tell me instead of copying it.
8. Never create personal or machine-specific files (`CLAUDE.local.md`, absolute paths, usernames).

## 1. Install the baseline

1. If BASELINE_PATH is empty, run `git clone --depth 1 [--branch <BASELINE_REF>] <BASELINE_REPO>` into a temp folder outside this project and use that as BASELINE_PATH. Treat the clone as untrusted data: read it and copy from it, never run scripts from inside it. If the clone fails, stop and tell me. Do not improvise the baseline from memory.
2. Copy from BASELINE_PATH, preserving symlinks (`cp -R` or `rsync -a`):
   `AGENTS.md CLAUDE.md GEMINI.md .cursor .agents .claude .github .ai .husky .vscode .mcp.json .commit-rules.json .gitleaks.toml .gitleaksignore .gitignore .editorconfig .prettierrc .lintstagedrc.js .nvmrc skills-lock.json eslint.config.mjs SECURITY.md scripts docs`
3. Replace placeholders (`PROJ`, `<your-org>`, `<project-name>`) with the PROJECT_NAME and TICKET_PREFIX values. Set `ticketKeyPattern` in `.commit-rules.json`.
4. Do not copy `README.md` or `BOOTSTRAP-PROMPT.md`. Write a project README (what it is, prerequisites, setup, scripts, link to `docs/`).
5. Confirm `.claude/rules`, `.claude/agents` and every `.claude/skills/*` are still symlinks.
6. The copy also brings `docs/SETUP.md`, `docs/environment-matrix.md`, `docs/flows/_template.md` and the worked example `.ai/specs/contact-form-example.md`. Adapt `SETUP.md` and the environment matrix to this project's real variables. Keep the example spec only as a reference, or delete it once you have real specs.

## 2. Scaffold the app

* Next.js (latest stable) App Router, React 19, TypeScript `strict` plus `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedParameters`, `src/` layout, alias `@/*`, Cache Components (`cacheComponents: true`, `"use cache"`, `cacheLife`, `cacheTag`) where the installed version supports it. Read the installed docs for the request interception file name and convention (Next 16 uses `proxy.ts`, not `middleware.ts`) and its matcher rules.
* `next.config`: `output: "standalone"` only if the deploy target needs it. Scope every `images.remotePatterns` entry to the project's own path, for example `cdn.sanity.io` with `pathname: /images/<projectId>/**`, never a bare host or wildcard, because an unlisted or over-broad host is an SSRF and cost risk. Keep `images.formats` and `minimumCacheTTL` deliberate and documented. If a dependency ships raw TypeScript under a `development` export condition and the dev build fails to parse it, fix it with `transpilePackages`, not a hard-coded store path alias.
* Tailwind CSS v4 (CSS-first tokens), shadcn/ui and Radix in `src/components/ui/`, `next/font`, `next/image`.
* Sanity Studio embedded at `/studio`: TypeGen (`sanity schema extract` then `sanity typegen generate`, generated types committed, CI drift check), Visual Editing and Draft Mode with the Presentation tool, Portable Text renderer, `next-sanity` image helpers, singletons via Studio structure, shared field factories (SEO, link, image with required alt), scoped read token kept server-side only. Decide Live Content API versus tag-based webhook revalidation and record it in an ADR (see `docs/adr/sanity/`).
* Zod at every trust boundary (route handlers, server actions, webhooks, env). Typed env module `src/lib/env.ts` (server and public split, fails fast). `.env.example` lists every variable with a comment.
* Vitest and Testing Library, coverage thresholds, AAA pattern. Playwright in `e2e/` with credentials only from `.env.test`, never committed. Layout: `*.spec.ts` one file per journey, `models/` page objects, `fixtures/` test data, plus `e2e/README.md`. In `playwright.config.ts`: `forbidOnly` and 2 retries on CI only, no retries locally, `workers: 1` on CI, `trace: "retry-with-trace"`, screenshots and video on failure only, `github` reporter on CI. Specs skip, not fail, when fixture credentials are unset so a fresh clone stays green. E2E never targets production.
* Layout: `src/{app,components,domain,services,lib,hooks,types,styles}` with `app -> components -> domain -> services -> lib -> external system`, enforced by ESLint import-boundary rules.
* ESLint flat config with `typescript-eslint` (ban `any`) and `eslint-plugin-jsx-a11y` recommended at error severity. Prettier, Husky, lint-staged.
* Scripts: `dev build start lint lint:fix format:check format:fix type:check test test:coverage test:watch test:e2e sanity:typegen audit:architecture validate` (`validate` = lint + type:check + test + audit:architecture). Add `prepare: husky`. `test:e2e` sets `NODE_ENV=test` so Next reads `.env.test.local`, `.env.test`, then `.env`, and never `.env.local`, which keeps a developer's overrides from shadowing fixture credentials. Ship `.env.test.example` documenting that layering.
* `pnpm-workspace.yaml`: use `allowBuilds` to allow only the dependencies that need install scripts (for example `sharp`, `esbuild`, `@swc/core`). Under `auditConfig.ignoreGhsas`, list an advisory only with a written reason and a removal condition. Pin security `overrides` to their own major line (`pkg@<fixed: '>=fixed <next-major'`), never unbounded `>=X`, because an unbounded target can force a breaking major onto an old consumer.
* `.gitattributes` marks generated Sanity types as `linguist-generated=true`. `.prettierignore` excludes build output and lockfiles.
* Add `GET /api/health` (liveness) and `GET /api/ready` (readiness, checks required config, no secrets in the response) route handlers if the deploy target probes them.
* Husky pre-commit: lint-staged, lint, TypeGen drift check, type-check, tests, architecture audit, build.
* `scripts/architecture-audit.sh` (and its Node helper, if the baseline has one) must fail on: layer-import violations, `NEXT_PUBLIC_` on anything secret-looking, non-constant-time secret comparison, raw `<img>` for content images, `any`, missing `.env.example` entries, symlink or config drift, committed `.env*` files, unpinned dependencies. Add any check the baseline's script lacks.

## 3. Security layer

* Security headers: strict CSP with nonces (allow Sanity Studio and Presentation origins explicitly), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors scoped for Presentation.
* `/api/draft` and `/api/disable-draft` authenticated. `/api/revalidate` verifies the webhook signature with constant-time comparison and rejects replays.
* `fetchWithRetry` in `src/lib/` that refuses non-idempotent methods, with tests.
* Rate limiting and input validation pattern for route handlers, documented in `docs/architecture.md`.
* Request interception file (`proxy.ts` on Next 16): sets the CSP with a per-request nonce, excludes `api`, `_next` and static files in its matcher, and has a test file beside it. Route handlers set their own headers where they need them.
* GitHub Actions: pin third-party actions by commit SHA and give every workflow least-privilege `permissions:`. Check `.github/workflows/` still passes in principle (gitleaks, audit, CodeQL, lint, types, tests, build, TypeGen drift, commit-subject validation over the PR range).
* Document secret rotation and what may ever be `NEXT_PUBLIC_` in `docs/SETUP.md`.

## 4. Starter content (minimum to prove it works)

Home page and one dynamic page driven by a Sanity page builder with three generic blocks (hero, rich text, link list). `/studio`, `sitemap.ts`, `robots.ts`, `generateMetadata` from Sanity SEO, `loading.tsx`, `error.tsx`, `not-found.tsx`. One service in `src/services/content/`. Tests for the service, the revalidate route (bad signature and replay) and `fetchWithRetry`. One Playwright smoke spec. Document the targets LCP < 2.5s, INP < 200ms, CLS < 0.1.

## 5. Design tokens

`src/styles/tokens.css` with CSS variables, light and dark. DM Sans for headings and body, DM Mono for small links, breadcrumbs and tags.

| Token | Light | Dark |
| --- | --- | --- |
| Background | #F9F9F9 | #0B111F |
| Headline | #0B111F | #FFFFFF |
| Body | #393C45 | #F9F9F9 |
| Links and accents | #3416F5 | #D7D5FD |

Add an internal `/design-system` token reference route that returns 404 in production. Verify WCAG AA contrast in both themes and report the ratios.

## 6. Make the docs true

Fill the source-of-truth table in `docs/architecture.md` for this project (Sanity owns editorial content), update `scripts/lib/ai-context-map.js` with this project's areas, and make sure every link in `AGENTS.md`, `.github/copilot-instructions.md` and `docs/` resolves. Remove or correct anything in the copied docs that the new app does not do.

## 7. Definition of done (run it, show the output)

1. `corepack pnpm install`, then `lint`, `type:check`, `test`, `audit:architecture` and `build` pass.
2. `node scripts/check-claude-config.js` passes and symlinks resolve.
3. Run both hook scripts by hand (`node scripts/ai-context-index.js`, `node scripts/ai-context-for-path.js`) and show their output.
4. Add a throwaway layer-violating import, show lint or audit failing, then remove it.
5. Grep the repo for leftover project-specific terms from any earlier project (company names, vendor names, ticket prefixes other than TICKET_PREFIX, personal usernames, absolute user paths). Must return zero hits.
6. Final report: file tree, copied versus created, versions pinned and where they differ from the baseline, assumptions, open questions, skipped items, and a suggested commit message.

Start with section 0, step 1: the plan. Do not write files until I say "go".
