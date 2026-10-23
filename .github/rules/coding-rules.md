# Coding Rules

Standards enforced in review. Most are also enforced by tooling, where they are, the tool is authoritative.

## Enforced by tooling

| Rule | Enforced by |
| --- | --- |
| `any` is prohibited | ESLint (error) |
| One-way layer dependencies | ESLint `no-restricted-imports` |
| No `console.log` (`warn`/`error` stay allowed for code that cannot reach the `server-only` logger) | ESLint `no-console` (error) |
| Secrets unreachable from the browser | `server-only` + build failure |
| Strict null handling and the extra flags listed in `typescript.instructions.md` (`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are **not** on) | `tsconfig.json` |
| Formatting | Prettier, applied to staged files by `lint-staged` in the pre-commit hook (`format:check` is not a CI check) |

Do not disable a rule globally to unblock one call site, and do not reach for an inline `eslint-disable` either: `pnpm audit:architecture` fails on any `eslint-disable` comment anywhere in `src/`, so a suppression does not merge however well it is commented. Where a rule genuinely cannot apply to a module, the exemption is scoped in `eslint.config.mjs` instead, which keeps every exception visible in one file rather than buried at a call site. The logger modules are the worked example.

## Naming

Full standard: [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

| Kind | Casing | Example |
| --- | --- | --- |
| Route directory | `kebab-case` | `reset-password/` |
| Reserved route file | lowercase | `page.tsx`, `route.ts` |
| Component file & name | `PascalCase` | `ProductImage.tsx` → `<ProductImage />` |
| Hook file & function | `camelCase`, `use` prefix, filename matches export | `useAuth.ts` → `useAuth()` |
| Server Action file | `camelCase` + `Actions`, or an `actions/` folder | `userActions.ts` |
| Service file | `PascalCase`/`camelCase` + `Service` suffix | `PaymentService.ts` |
| Util file | plural `camelCase` for a group, verb `camelCase` for one purpose | `formatters.ts`, `formatDate.ts` |
| Constants/config file | `camelCase` | `appConfig.ts` |
| Scalar constant | `UPPER_SNAKE_CASE` (true module-level constants only) | `MAX_RETRY_ATTEMPTS` |
| Read-only dict/object | `PascalCase` | `AppConfig` |
| Types file | `camelCase` | `userTypes.ts` |
| Type / interface name | `PascalCase`, **no `I` prefix**; `type` for unions, `interface` for shapes | `UserProfile` |

- Components use **named exports** (default export only for framework files that require it, e.g. `page.tsx`).
- Functions: verbs (`getProductById`, `resolveSeo`). Booleans: `is`/`has`/`should`.
- Say what it is, not what it is not. Avoid `data`, `info`, `handle`, `manager`.

## Functions

- One responsibility. If a name needs "and", split it.
- Prefer early returns over nested conditionals.
- Explicit return types on exported functions.
- Arguments: an options object beyond three parameters, so call sites stay readable and order-independent.

## Comments

Comments explain **why**, not what. The code already says what it does.

Earn the line: a non-obvious constraint, an upstream quirk, a business rule not evident from the code, or a decision a reader would otherwise undo.

```ts
// Unrecognised status maps to "unavailable" rather than "available": failing
// closed can hide an item, failing open promises something that may not exist.
```

Never leave commented-out code. Git history is the record.

Every exported symbol in `src/` carries a TSDoc block. Full rule: [`documentation.instructions.md`](../instructions/documentation.instructions.md).

## Error handling

- Map upstream errors to an application error type (for example `AppError`) at the service boundary.
- Never swallow an error silently. If it is genuinely ignorable, say why in a comment.
- Never expose raw upstream errors to users.
- Fail closed on anything security-relevant.

## Imports

- `@/` alias for internal modules; no deep relative paths.
- Inline type imports: `import { type Foo, bar } from "..."`.
- No barrel files that re-export an entire directory, they defeat tree-shaking and obscure the dependency graph.

## Dependencies

Do not add a library because it is popular. Prefer platform capabilities and existing dependencies. A new dependency needs a justification: what it does that we cannot reasonably do, and why its maintenance and bundle cost is worth it.

## Async

- Parallelize independent work with `Promise.all`.
- Always set a timeout on an external call.
- Never `await` in a loop over independent items, batch instead.

## React

- Use React 19's `use(Context)` instead of `useContext(Context)`. This allows conditional reading of context and is mechanically enforced by ESLint.
- Server Components natively support `async`/`await`. Use `await` for data fetching in RSCs.
- Use the `use` hook in Client Components to natively suspend and resolve Promises passed down from Server Components.
