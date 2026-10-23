# Validation Gate

The mandatory workflow for every code change. No change merges without it.

---

## 1. Understand

Read the relevant existing code before writing any. Identify:

- Which **architectural layer** the change belongs in.
- Which **external systems** it touches.
- Which system is the **source of truth** for any data involved.

If source-of-truth ownership is unclear, **stop and resolve it before implementing**. Discovering mid-build that data has a different owner means rewriting the change.

## 2. Check what exists

- Is there already a service, type, or utility for this?
- Is the data already available from the system that owns it, or through an existing sync?
- Can an existing abstraction be extended instead of a new one added?

Do not introduce a duplicate integration or a second client for a system that already has one.

## 3. Assess implications

Before writing code, consider:

| Dimension | Question |
| --- | --- |
| **Security** | Secrets, authz, input validation, cache isolation |
| **Accessibility** | WCAG 2.1, semantic HTML, keyboard/focus, labels, contrast; see `ui.instructions.md`/`component.instructions.md` |
| **Privacy** | What user data is collected, sent, or logged |
| **Caching** | What tags apply; is this personalized |
| **Performance** | Waterfalls, N+1s, client bundle impact |
| **Failure** | What happens on timeout, outage, or duplicate submission |

## 4. Implement

Make the **smallest clean change** at the correct layer. Do not rewrite working code that is not part of the task.

Follow the file-scoped instructions in `.github/instructions/`, which apply automatically by path.

## 5. Test

Add or update tests: positive, negative, and edge cases. Failure scenarios are mandatory for anything touching money, entitlement, or an external boundary.

A regression test is required for every bug fix.

### E2E when a feature is done

A feature that adds or changes a journey on the E2E list in [`testing.instructions.md`](../instructions/testing.instructions.md) (for example sign-in and registration, the primary content or product journeys, account access, and user-specific visibility) is not done until either:

- a Playwright spec in `e2e/` covers the new path, in the same PR, following `e2e/README.md`; or
- a follow-up ticket for that spec exists and is linked from the PR description, saying why it could not land with the feature (for example, a test identity the fixture account cannot provide yet).

In the same PR, update the flow doc in `docs/flows/` that describes the journey, so it says how the journey is now covered (the `docs-sync` skill).

If no CI workflow runs E2E, run `pnpm test:e2e` locally and say in the PR what it covered. A spec that needs credentials reads them from `.env.test`, never a committed file.

## 6. Validate

```bash
pnpm validate   # lint + typecheck + test + architecture audit
```

All four must pass. A failing check is not "pre-existing" unless you have verified it fails identically on the base branch, say so explicitly if it does.

`.husky/pre-commit` runs `lint-staged` and then the whole gate, including the Sanity TypeGen drift check and `pnpm build`, on every commit. So the build is not something CI discovers first; a commit that fails to build never gets made locally. CI runs the same sequence on every push and PR to the protected branches.

## 7. Report

State plainly:

- What changed and at which layers.
- Which external systems and source-of-truth boundaries are affected.
- What was tested, and what was **not**.
- Any assumption made, and any standard deviated from (with an ADR if significant).

Report outcomes faithfully. If tests fail, say so with the output. If a step was skipped, say that.

---

## Blocking conditions

Do **not** merge if any of these is true. The right-hand column says what would actually stop it, because a condition no tool checks depends entirely on a reviewer noticing, and it is worth knowing which is which.

| Condition | What stops it |
| --- | --- |
| Source-of-truth ownership for a new field is unresolved. | Review only. |
| A secret is reachable from browser code. | Partly mechanical: the audit rejects any credential-shaped `NEXT_PUBLIC_` name outside its allowlist, and `server-only` fails the build on a server module imported into client code. A secret reaching the browser another way, as a prop or in a log or under a name that does not look credential-shaped, is review only. |
| Authorization is enforced only in the UI. | Review only. |
| A side-effecting call is retried blindly. | Partly mechanical: the shared retry helper (for example `fetchWithRetry`) throws on any method other than GET or HEAD. A hand-rolled retry loop or a resubmitting timeout handler written without it is review only. |
| User-specific content shares a cache key across users or accounts. | Review only. |
| `any` was introduced. | ESLint `@typescript-eslint/no-explicit-any`, error, across all of `src/`. |
| A feature on the E2E journey list ships with neither a spec nor a linked follow-up ticket (§5). | Review only. |
| A boundary rule was disabled globally to unblock one call site. | Partly mechanical: the audit fails on any `eslint-disable` anywhere in `src/`. Weakening a rule by editing `eslint.config.mjs` itself is review only, and shows up as a diff to that file. |

## What each stage catches

Four stages, because each catches a class the others cannot:

| Stage | Catches | Blind to |
| --- | --- | --- |
| `lint` | Layering (5 `no-restricted-imports` blocks, one per layer: `domain/`, `services/`, `lib/`, `components/`, `app/`), `any`, stray `console`, WCAG-relevant markup (`jsx-a11y`'s recommended set, e.g. labels, keyboard handlers, heading/anchor content, media captions) | Anything that compiles in the right folder; contrast, focus order, and other judgment-based accessibility issues |
| `type:check` | Shape and nullability errors | Correct types doing the wrong thing |
| `test` | Behaviour | Untested paths |
| `audit:architecture` | Patterns that pass all three and still violate the architecture | Anything not yet encoded as a check |
| CI `build` | RSC/client boundary, route collection, `generateStaticParams` |, |

**The build is not optional.** Lint, tsc and tests all pass on code that fails to build; importing a server-only module into a Client Component is the usual way. CI runs it on every PR.

## When a check fires

Fix the cause. Do not add `eslint-disable`, widen a type, or delete the check. Every rule here exists because the pattern it catches has caused a real defect. Keep the reason next to each audit check so the next reader can tell a check that is wrong from one that is merely inconvenient.

If a check is genuinely wrong for a new case, change the check deliberately and say why in the PR. That is a different act from silencing it.
