---
name: "Component instructions"
description: "Component conventions, accessibility, and the Server/Client boundary."
applyTo: "src/components/**"
paths:
  - "src/components/**"
---

# Component Instructions

## Components render; they do not fetch

A component takes props and returns UI. It must not:

- Call an external API, a vendor client, or a service.
- Contain business logic: pricing rules, entitlement checks, merge logic.
- Read request state directly.

Data is fetched in a Server Component or route handler, through a service, and passed down. This is enforced by ESLint; a violation fails the build.

## Server by default

Add `"use client"` only where interactivity or a browser API requires it, and push it to the **smallest interactive leaf**. Marking a page client ships its whole subtree to the browser.

## Structure

- One component per file; **named exports** (default export only for Next.js framework files that require it: `page.tsx`, `layout.tsx`).
- File and component name are `PascalCase` and match: `ProductImage.tsx` exports `ProductImage`, used as `<ProductImage />`.
- Props are an explicit `interface`/`type` named `<Component>Props`. Never `any`, never an index signature used to dodge typing.
- Every exported component and its Props type get a TSDoc block. See [`documentation.instructions.md`](documentation.instructions.md) for the full rule.
- Colocate a component's variants and helpers; extract only on real reuse.
- Keep presentational components free of layout assumptions about their parent.

### Categorization

| Pattern | Intent | Location | Example |
| --- | --- | --- | --- |
| **UI primitive** | Presentational, stateless design-system component | `components/ui/` | `Button.tsx`, `Modal.tsx` |
| **Domain / feature** | Tied to business logic or a data shape; prefixed by the feature | `components/<feature>/` | `ContactForm.tsx`, `ArticleSummary.tsx` |
| **Layout / structural** | Single-instance layout or global element | `components/<feature>/` | `GlobalHeader.tsx`, `SidebarNavigation.tsx` |
| **Child component** | Sub-component that only supports one parent | Folder named after the parent, or prefixed identically | `TodoList/TodoListItem.tsx` |

Full standard: [`docs/naming-conventions.md`](../../docs/naming-conventions.md).

### One copy of each primitive

- Every primitive (button, input, select, spinner, sheet, and so on) lives in `components/ui/`, **once**. If a feature needs a new look, add a variant to that component's `cva`; do not add a second component.
- Feature folders compose `ui/`; `ui/` never imports from a feature folder or a service.
- No loose files at the root of `components/`. A feature with sub-parts nests them rather than adding sibling folders.
- Buttons are `ui/Button`; a form submit that shows its pending state is `ui/SubmitButton`.
- A form field is `ui/Label` + `ui/Input` (or `ui/Textarea`, `ui/Select`, `ui/Checkbox`, `ui/RadioGroup`) + `ui/FieldMessage`; mark an invalid field with `aria-invalid`, never an error colour class. Anything loading shows `ui/Spinner`.

## Rendering values

Values arrive already resolved and authoritative. **Never recompute a derived or authoritative value (a price, a discount, an entitlement) in a component.** Those come from the system that owns them, via a service.

## Accessibility

- Semantic elements before ARIA. `<button>` for actions, `<a>`/`<Link>` for navigation.
- Every image has `alt`; decorative images get `alt=""`.
- **Never remove a focus outline.** Replace it with a visible style.
- Interactive elements are keyboard-reachable and have a visible focus state.
- Form inputs have associated labels.
- Do not convey information by colour alone.

## Images

`next/image` with explicit `width`/`height` to reserve layout space. Blur placeholders from LQIP where available. `preload` **only** on the LCP image (`priority` is deprecated in Next 16).

## Links

External links carry `rel="noopener noreferrer"`. Without it the opened page can reach back through `window.opener`.

## Styling

Tailwind CSS v4, CSS-first (there is no `tailwind.config.ts`): design tokens live in a tokens stylesheet that `globals.css` imports. Reference tokens by Tailwind class name (semantic colours, text styles, spacing and radii; see [`ui.instructions.md`](ui.instructions.md)), and avoid hardcoding colours that will need to be swapped.

Do not define shadcn/ui's default semantic tokens (`--background`, `--foreground`, `--primary`, `--ring`, and so on) casually if existing components already use those class names as dead, no-op classes. Defining the variables would make them resolve unexpectedly. See [`ui.instructions.md`](ui.instructions.md) before adding any of them.

## Anti-patterns to reject in review

- A component that imports a service or vendor client, or fetches in `useEffect` what a Server Component could pass down.
- `"use client"` on a page or layout because one child needs a handler.
- A second copy of a primitive that already exists in `components/ui/`.
- A derived value (price, discount, entitlement) recomputed in JSX.
- A removed focus outline with no replacement.
- An external link without `rel="noopener noreferrer"`.
