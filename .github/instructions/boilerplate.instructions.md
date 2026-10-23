---
name: "Boilerplate instructions"
description: "Project scaffold, starting config, and templates for adding new routes, services, and components consistently."
applyTo: "**"
---

# Boilerplate Instructions

## Purpose

The starting scaffold and the templates to follow when adding a new route, service, or component, so new code matches the rest of the codebase on day one instead of drifting.

## Project scaffold

Adapt this to your project. The shape below assumes the layering rules in [`architecture.instructions.md`](./architecture.instructions.md):

```
.
├── e2e/                       # Playwright end-to-end tests
├── public/                    # Static assets
├── sanity/                    # Sanity schema, Studio components
├── src/
│   ├── app/
│   │   ├── [locale]/          # Page routes (drop the segment if you do not use i18n)
│   │   │   ├── (auth)/        # Sign-in, registration, password reset
│   │   │   ├── (account)/     # Signed-in area
│   │   │   └── (site)/        # Public pages
│   │   ├── api/               # Route handlers (not locale-scoped)
│   │   ├── _server/           # Private: self-fetching Server Components
│   │   └── studio/            # Sanity Studio
│   ├── components/
│   │   ├── ui/                # Design-system primitives
│   │   └── [feature]/         # Feature composites
│   ├── domain/                # Business rules, no React and no vendor client
│   ├── hooks/
│   ├── lib/                   # Vendor clients, config, cross-cutting concerns
│   ├── services/              # One module per external system
│   ├── types/
│   └── styles/
├── .github/
│   ├── copilot-instructions.md   # General, repo-wide standards
│   └── instructions/              # Path-specific instructions (this folder)
├── .env.example
├── eslint.config.mjs          # Flat config
├── .prettierrc
├── components.json            # shadcn/ui config (src/components/ui/ primitives)
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

If you use `next-intl` or another locale segment, adding a page route means adding it under `src/app/[locale]/`. A `page.tsx` placed directly in `src/app/` will not resolve the locale.

## Baseline tooling

- **Package manager**: pnpm. Don't mix lockfiles: no `package-lock.json`/`yarn.lock` alongside `pnpm-lock.yaml`. Pin the version through `packageManager` in `package.json`.
- **Linting/formatting**: ESLint flat config (`eslint.config.mjs`), run in CI and by the pre-commit hook; Prettier (`.prettierrc`), applied to staged files by `husky` + `lint-staged`. Don't rely on editor formatting alone.
- **Testing**: Vitest + React Testing Library for unit/component, Playwright for E2E (`e2e/`). See [`testing.instructions.md`](./testing.instructions.md).
- **Styling**: Tailwind CSS v4 with Radix Primitives and shadcn/ui. See [`ui.instructions.md`](./ui.instructions.md).

All naming follows [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

## Adding a new route

1. Pick the right route group under `src/app/` (or `src/app/[locale]/`): public pages, signed-in area, or auth.
2. Name the route directory `kebab-case`. It becomes the URL path.
3. Create `page.tsx` (Server Component by default), plus `loading.tsx` and `error.tsx` if the page fetches data. Reserved files stay lowercase.
4. Fetch data via a `services/` function; decide and set the rendering strategy explicitly per [`rendering.instructions.md`](./rendering.instructions.md) (don't leave caching to the default).
5. Add `generateMetadata` per [`seo.instructions.md`](./seo.instructions.md).
6. Add an E2E test in `e2e/` covering the route's primary user action if it is part of a critical journey.

## Adding a new service

1. Create or extend the relevant domain file in `services/`. Don't create a new one-off file per function.
2. Name service modules `PascalCase`/`camelCase` with a `Service` suffix when they wrap an external SDK or context.
3. Define the function's input/output types in `types/` (`PascalCase` names, no `I` prefix).
4. Normalize the upstream SDK response into the app's own shape before returning.
5. Add a unit test mocking the SDK/HTTP call.

## Adding a new component

1. Decide: primitive (`components/ui/`) or feature composite (`components/[feature]/`)?
2. Name the file `PascalCase.tsx`, matching the component; use a **named export**.
3. Server Component unless it needs interactivity. If it does, isolate the interactive part into its own small Client Component child.
4. Define an explicit `<Component>Props` type.
5. Style with Tailwind; use Radix for any nontrivial interactive behavior.
6. Add a component test covering interaction and empty/error states where relevant.

## Adding a hook

1. Place cross-feature hooks in `src/hooks/`; colocate feature-specific ones.
2. Name the file `camelCase.ts` with a `use` prefix, matching the exported function exactly (`useAuth.ts` exports `useAuth`).
3. Call it only from Client Components or other hooks.

## Adding a Server Action

1. Name the file `camelCase` with an `Actions` suffix, or group actions in an `actions/` folder.
2. Put `"use server"` at the top of the module, never on a component module.

## Environment configuration

- `.env.example` lists every required variable with a placeholder and a short comment: public identifiers, server-only credentials, feature flags, analytics IDs.
- New environment variables are added to `.env.example` in the same PR that introduces them (see [`documentation.instructions.md`](./documentation.instructions.md)).

## Root-level instructions complement

`.github/copilot-instructions.md` is the root complement to this folder, and the repo-wide invariants live in `AGENTS.md`. Keep both brief and let the domain-specific files here carry the detail, rather than duplicating content across all three.

## Anti-patterns to reject in review

- A new route added without deciding its rendering/caching strategy.
- A new external integration bypassing `services/`.
- Mixed package-manager lockfiles.
- New env vars introduced without an `.env.example` entry.
- A route directory in `PascalCase`/`camelCase`, or a component file not in `PascalCase`.
- A hook file whose name does not match its exported function, or an interface named with an `I` prefix.
