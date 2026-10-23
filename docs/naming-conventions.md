# Naming Conventions

The naming standard for this repository. ESLint enforces part of it, review enforces the rest. Cross-references: [`coding-rules.md`](../.github/rules/coding-rules.md), [`architecture.instructions.md`](../.github/instructions/architecture.instructions.md), [`component.instructions.md`](../.github/instructions/component.instructions.md), [`typescript.instructions.md`](../.github/instructions/typescript.instructions.md).

## 1. Routes (Next.js App Router)

The directory name is the URL segment.

| Thing | Casing | Example |
| --- | --- | --- |
| Route directory | `kebab-case` | `app/[locale]/(auth)/reset-password/` |
| Reserved route files | lowercase | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` |
| Dynamic segments | `[param]`, `[...param]`, `[[...param]]` | `products/[slug]/` |
| Route groups | `(group)` | `(marketing)`, `(auth)` |
| Private folders | `_prefix`, kept out of routing | `app/_components/` |

Route groups add no URL segment. Never use `PascalCase` or `camelCase` for a route directory.

## 2. React components

| Rule | Value |
| --- | --- |
| Component file | `PascalCase.tsx`, for example `ProductImage.tsx` |
| Component name in JSX | `PascalCase`, for example `<ProductImage />` |
| Exports | Named exports for components. Default export only where a framework file requires it (`page.tsx`, `layout.tsx`). |
| One component per file | Yes. Keep small variants and helpers beside it. Extract only on real reuse. |
| Props | An explicit `<Component>Props` type. Never `any`, never an index signature to dodge typing. |

| Pattern | Intent | Location | Example |
| --- | --- | --- | --- |
| UI primitive | Presentational, stateless design-system piece | `components/ui/` | `Button.tsx`, `Modal.tsx` |
| Feature component | Tied to one feature or data shape | `components/<feature>/` | `PricingTable.tsx` |
| Layout component | Single-instance structure | `components/<feature>/` | `SiteHeader.tsx` |
| Child component | Supports exactly one parent | Folder named after the parent | `Gallery/GalleryItem.tsx` |

## 3. Hooks

Hooks run only in Client Components or other hooks.

| Rule | Value |
| --- | --- |
| File | `camelCase.ts`, matching the exported function exactly |
| Name | Starts with `use`: `useMediaQuery`, `useLocalStorage` |
| Location | `src/hooks/` for cross-feature hooks. Colocate feature-specific ones. |

`useMediaQuery.ts` exports `useMediaQuery`. It is not `use-media-query.ts`.

## 4. Server Actions

| Rule | Value |
| --- | --- |
| File | `camelCase` with an `Actions` suffix (`profileActions.ts`), or a folder named `actions/` |
| Directive | `"use server"` at the top of the module. Never on a component module. |

## 5. Services

A service wraps an external system and maps its responses into project types.

| Rule | Value |
| --- | --- |
| File | `camelCase.ts` ending in `Service`, or a folder per system under `services/` |
| Name | `contentService.ts`, `searchService.ts` |

Vendor clients, config and cross-cutting concerns live in `lib/`. Keep the layering direction from [`architecture.md`](./architecture.md) intact.

## 6. Utilities

Pure, deterministic, synchronous functions with no React state and no side effects.

| Rule | Value |
| --- | --- |
| File | `camelCase.ts` |
| Group of related helpers | Plural noun: `formatters.ts`, `validators.ts` |
| Single purpose | Verb: `formatDate.ts`, `cn.ts` |

No `utils.ts` grab bag. Split by purpose or domain.

## 7. Constants and configuration

| Rule | Value |
| --- | --- |
| File | `camelCase.ts`: `httpStatuses.ts`, `appConfig.ts` |
| Scalar constants | `UPPER_SNAKE_CASE`, module level only |
| Read-only objects and dictionaries | `PascalCase`, declared `as const` |

```ts
export const MAX_RETRY_ATTEMPTS = 3;

export const AppConfig = {
  siteName: "Example",
} as const;
```

## 8. Types

| Rule | Value |
| --- | --- |
| File | `camelCase.ts` (`userTypes.ts`) or a feature folder's `types.ts` |
| Name | `PascalCase`, no `I` prefix: `UserProfile`, not `IUser` |
| `type` vs `interface` | `type` for unions and intersections, `interface` for object shapes |

Model only the fields you consume from an upstream response, and map at the service boundary instead of copying a type across layers. Prefer inline type imports: `import { type Foo, bar } from "./module";`.

## 9. Sanity

Schema names are part of the content contract, so keep them stable. Details are in [`sanity/content-model.md`](./sanity/content-model.md). In short: document and object type names in `camelCase`, field names in `camelCase`, one schema module per type, and shared fields built by a factory function.

## Quick reference

| Kind | Casing | Example |
| --- | --- | --- |
| Route directory | `kebab-case` | `reset-password/` |
| Reserved route file | lowercase | `page.tsx` |
| Component file and name | `PascalCase` | `ProductImage.tsx` |
| Hook file and function | `camelCase`, `use` prefix | `useMediaQuery.ts` |
| Server Action file | `camelCase` + `Actions` | `profileActions.ts` |
| Service file | `camelCase` + `Service` | `contentService.ts` |
| Util file (group) | plural `camelCase` | `formatters.ts` |
| Util file (single) | verb `camelCase` | `formatDate.ts` |
| Constants file | `camelCase` | `appConfig.ts` |
| Scalar constant | `UPPER_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS` |
| Read-only object | `PascalCase` | `AppConfig` |
| Types file | `camelCase` | `userTypes.ts` |
| Type or interface | `PascalCase`, no `I` | `UserProfile` |
| Function | verb | `getProductById` |
| Boolean | `is`, `has`, `should` | `isPublished` |
