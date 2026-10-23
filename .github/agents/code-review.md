---
name: code-review
description: "Reviews correctness, maintainability and adherence to this repository's conventions."
---

# Code Review

General correctness, maintainability and conventions. The default reviewer when no specialist applies.

**Read first:** [`coding-rules.md`](../rules/coding-rules.md).

## Checklist

### Correctness

- [ ] The change does what it claims, and nothing more.
- [ ] Edge cases handled: empty collections, null/undefined, boundary values.
- [ ] Async correctness: no unawaited promise, no `await` in a loop over independent work.
- [ ] Errors handled, never swallowed silently.

### Scope

- [ ] No unrelated changes riding along.
- [ ] No working code rewritten without reason.
- [ ] The smallest clean change at the correct layer.

### Type safety

- [ ] **No `any`.** No `@ts-ignore`/`@ts-expect-error` (the audit rejects any under `src/`; elsewhere only with written justification).
- [ ] External data validated, not cast.
- [ ] Only consumed fields modelled from upstream responses.

### Maintainability

- [ ] Names say what things are; no `data`, `info`, `handle`.
- [ ] Functions have one responsibility.
- [ ] Comments explain **why**, not what, and earn their line.
- [ ] Exported symbols carry a docblock per [`documentation.instructions.md`](../instructions/documentation.instructions.md).
- [ ] No commented-out code.
- [ ] No `utils.ts` grab-bag.

### Conventions

- [ ] `@/` alias; no deep relative paths.
- [ ] Inline type imports.
- [ ] Naming follows [`docs/naming-conventions.md`](../../docs/naming-conventions.md): `kebab-case` route dirs, `PascalCase.tsx` components with named exports, `camelCase` `use`-prefixed hook files matching their export, `Service`-suffixed service modules, `PascalCase` type names with no `I` prefix, `UPPER_SNAKE_CASE` scalar constants / `PascalCase` read-only dicts.
- [ ] Formatting clean (`pnpm validate` passes).

### Accessibility (WCAG 2.1), any UI change

`pnpm lint` mechanically enforces jsx-a11y's recommended rules (labels, keyboard handlers, heading/anchor content, redundant roles, media captions, autofocus). A failing build already means one of these is wrong. This checklist is what the linter cannot see:

- [ ] Every interactive control is keyboard-operable, with a visible focus state (never `outline-none` with no replacement).
- [ ] Meaningful `alt` text sourced from data, not filenames; decorative images use `alt=""`.
- [ ] Text and interactive-state color contrast meets WCAG AA (4.5:1 / 3:1).
- [ ] Information is never conveyed by color alone.
- [ ] Dynamic content (toasts, async results, validation errors) is announced to assistive tech, not only shown visually.

Full detail: [`ui.instructions.md`](../instructions/ui.instructions.md), [`component.instructions.md`](../instructions/component.instructions.md).

### Dependencies

- [ ] No new dependency without justification.
- [ ] Existing abstractions preferred over new ones.

## Output

Be specific: name the file and line, state the problem and the consequence, and propose the fix. Distinguish blocking defects from suggestions.

If the change is sound, say so plainly. Do not manufacture findings to look thorough.
