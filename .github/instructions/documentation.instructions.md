---
name: "Documentation instructions"
description: "Code comments, TSDoc, README, and repository documentation conventions."
applyTo: "**/*.md,**/*.mdx,README.md,src/**/*.ts,src/**/*.tsx"
paths:
  - "**/*.md"
  - "**/*.mdx"
  - "README.md"
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Documentation Instructions

## Purpose

What to document, where, and how, so the codebase stays understandable without needing to ask the original author.

## Code-level documentation

- Comments explain **why**, not what. The code already says what it does. A comment earns its place by covering a non-obvious constraint, a workaround for an upstream quirk, or a business rule that is not self-evident from the code. A docblock that only restates the function or component name does not meet the rule.
- Every exported symbol in `src/` gets a TSDoc block. This includes functions, components, hooks, page and layout default exports, route handlers, and server actions.
- Do not comment out dead code "just in case". Delete it; git history is the record of what used to be there.

### What each kind needs

**Functions and hooks** (including those in `services/`, `lib/`, `domain/`, and `hooks/`):

- A one-line summary of what it does and why a caller would reach for it.
- `@param` and `@returns` only where the name and type leave the reader guessing. Skip them when the signature is self-documenting.
- How it fails: throws, returns `null`, returns a discriminated result. Callers need this to decide their error path.

```ts
/**
 * Fetch an article by slug and normalize it into the app's Article shape.
 * Returns null (not an error) if the article does not exist or is not published,
 * so callers can render a 404 without special-casing an exception.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> { ... }
```

**Components** (`components/`, `app/_server/` presentational exports):

- A summary of what the component renders and when to use it. Note whether it is a Server or Client Component when that is not obvious from the file (no `"use client"` directive means Server).
- Document individual props on the fields of the `<Component>Props` type, not repeated in the component docblock.

```tsx
export interface ArticleCardProps {
  article: ArticleCardData;
  /** Muted line above the button, e.g. "Updated 2 days ago". */
  meta?: string;
  /**
   * Turns the button into "Read again" for articles the reader has opened.
   * When omitted the card shows the default "Read more" label.
   */
  isVisited?: boolean;
}

/**
 * Card for a published article: title, summary, and a read-more link.
 * When the reader is signed out the card hides member-only badges.
 */
export function ArticleCard({ article, meta, isVisited }: ArticleCardProps) { ... }
```

**Pages, layouts and `generateMetadata`** (`app/**/page.tsx`, `layout.tsx`):

- What renders or what the layout wraps.
- The rendering or caching choice if it is not the default (for example `'use cache'` with a `cacheLife`, or a `<Suspense>`-wrapped request-time read). Segment `dynamic`/`revalidate` exports are rejected under Cache Components; see [`rendering.instructions.md`](rendering.instructions.md).
- What each route param means when the name alone is not enough.
- In Next 16 `params` and `searchParams` are `Promise` types. Await them before use.

```tsx
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Article page. Resolves the article by slug, renders the body from Portable
 * Text, and returns notFound() when the article does not exist.
 *
 * @param props.params - `slug` is the URL slug of the article.
 * @returns The article page or a 404.
 */
export default async function ArticlePage(props: Props) { ... }
```

**Route handlers** (`app/api/**/route.ts`):

- What the endpoint does, which HTTP methods it handles, and any side effects (writes to an external system).
- Auth requirements and notable error responses.

**Server actions** (`"use server"` functions):

- What the action mutates and what it returns to the client.
- Validation or authorization the caller can expect.

### Anti-patterns

- **`@param {Type}` braces in TypeScript files.** TypeScript holds the types. Write `@param name` with a description, never `@param {string} name`.
- **Docblocks that restate the code.** `/** Gets the article. */` on `getArticle` adds nothing. State the contract: what it returns, how it fails, or when a caller should prefer it over an alternative.
- **Replacing an existing comment's reasoning with a summary.** When adding or reformatting a docblock, keep every "why" the old comment carried: a constraint confirmed against a live system, a decision and who made it, a security note, a TODO. Restructure it into the new block; never drop it. A generic summary is easy to regenerate, and the reasoning is not.

## READMEs

- Root `README.md` covers: what the project is, prerequisites, setup (`pnpm install`, required env vars referencing `.env.example`), common scripts (`dev`, `build`, `test`, `test:e2e`, `lint`), and a pointer to `.github/instructions/` for contribution conventions.
- Any non-trivial subfolder (a shared package, a complex feature module) gets its own short `README.md` if its purpose isn't obvious from file names alone. Don't require tribal knowledge to navigate the repo.
- Keep an `.env.example` in sync with actually-required environment variables, with placeholder values and a comment on where to obtain each one. Never real values.

## Architecture and decision records

- Significant, hard-to-reverse decisions (choice of rendering strategy for a route type, adopting a new state management approach, switching a vendor) get a short ADR (Architecture Decision Record) at `docs/adr/<NNNN>-<title>.md` (or `docs/adr/sanity/` for a decision whose subject is the Sanity integration), following the template in `docs/adr/`: context, decision, consequences. This is for decisions future contributors will otherwise re-litigate, not routine changes.

## Instruction files themselves

- Keep `.github/instructions/*.instructions.md` files current when a convention changes. An out-of-date instruction file is worse than none, since it actively misleads. Update the relevant file in the same PR that changes the underlying convention.
- Each scoped instruction file carries both `applyTo` (for Copilot) and `paths` (for Claude Code) with identical globs. Keep the two in step.
- Each instruction file stays scoped to its stated domain (see its `description`); cross-reference other instruction files by name rather than duplicating their content.
- Naming conventions are defined once in [`docs/naming-conventions.md`](../../docs/naming-conventions.md); instruction files link to it rather than restating the rules.

## API and type documentation

- Complex shared types (those in `src/types/` and `src/lib/types/`) get a short comment on non-obvious fields: units, currency handling, and whether nullable and optional mean different things. Types are documentation too, not just compiler input.

## Anti-patterns to reject in review

- Comments that restate the code (`// increment i` above `i++`).
- A README that's out of date with actual setup steps, causing new contributors to hit avoidable friction.
- Large commented-out code blocks left in place.
- New env vars added to `.env` usage without a corresponding `.env.example` entry.
