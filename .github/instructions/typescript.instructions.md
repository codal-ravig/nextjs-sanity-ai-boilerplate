---
name: "TypeScript instructions"
description: "Strictness, type modelling, and validation of external data."
applyTo: "src/**/*.ts,src/**/*.tsx,sanity/**/*.ts"
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "sanity/**/*.ts"
---

# TypeScript Instructions

## `any` is prohibited

Enforced as an ESLint **error**, not a warning. A warning is a rule nobody obeys under deadline.

No `@ts-ignore` or `@ts-expect-error`. Under `src/`, an architecture audit (`pnpm audit:architecture`) should fail on any occurrence, justified or not, so narrow the type instead. Outside `src/` (for example `sanity/`), where the audit does not look, one is acceptable only with a written justification in the same commit explaining why the type is genuinely wrong.

## Enabled strictness

Beyond `strict`, enable these in `tsconfig.json`:

| Flag | Catches |
| --- | --- |
| `noImplicitReturns` | A branch that falls out of a function without returning |
| `noFallthroughCasesInSwitch` | A `case` that runs into the next one |
| `noUnusedParameters` | Dead parameters |
| `forceConsistentCasingInFileNames` | An import that resolves on macOS and fails on Linux |

Check `tsconfig.json` before assuming a stricter flag is on. If `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes` is off, do not flag code as violating it in review.

That is a reason for care, not licence. An indexed read is still `T | undefined` at runtime whatever the compiler says, so narrow it rather than trusting the type:

```ts
const first = items[0];
if (!first) return null;
```

## External data is not typed data

A response is `unknown` until validated. Casting an upstream payload straight into a domain type is a lie the compiler will happily accept.

- Validate external input at the boundary with Zod: form data, params, webhook bodies, API responses.
- Model **only the fields consumed** from an upstream response. A narrow interface means an upstream addition cannot silently change behaviour.
- Use generated types where available (Sanity TypeGen). Do not hand-write a duplicate.

## Modelling

- Prefer explicit domain types over structural guesswork.
- Keep types near their layer; share cross-layer shapes in `types/`.
- Avoid duplicating a type across layers. Map at the service boundary instead.
- Use `readonly` for arrays a function does not mutate.
- Discriminated unions over optional-field soup.

## Naming

- Type and interface names are `PascalCase`. **No `I` prefix**: `UserProfile`, not `IUser`.
- `type` for unions and intersections; `interface` for object shapes.
- Type files are `camelCase.ts` (`userTypes.ts`) or a feature folder's `types.ts`.

```ts
export interface UserProfile {
  id: string;
  email: string;
}

export type ButtonVariant = "primary" | "secondary" | "ghost";
```

Full standard: [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

## Imports

Prefer inline type imports. This is a review convention unless you enable `consistent-type-imports`.

```ts
import { type Foo, bar } from "./module";
```

## Anti-patterns to reject in review

- `any`, or a cast through `unknown` that skips validation.
- `@ts-ignore` / `@ts-expect-error` to silence an error instead of fixing the type.
- An upstream payload cast directly into a domain type.
- A hand-written type that duplicates a generated one.
- An `I`-prefixed interface name.
- An unchecked indexed access used as if it were defined.
