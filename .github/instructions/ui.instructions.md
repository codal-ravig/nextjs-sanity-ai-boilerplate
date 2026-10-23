---
name: "UI instructions"
description: "Design system, Tailwind CSS conventions, Radix/shadcn usage, and accessibility."
applyTo: "src/components/**/*.tsx,src/styles/**/*.css,components.json"
paths:
  - "src/components/**/*.tsx"
  - "src/styles/**/*.css"
  - "components.json"
---

# UI Instructions

## Purpose

Visual and interaction conventions for the UI layer: **Tailwind CSS** for styling, **Radix Primitives** (via shadcn/ui) for unstyled, accessible interactive behavior.

## Styling approach

- Tailwind utility classes are the default. Avoid hand-written CSS files except for genuinely global concerns (font-face, CSS variables, resets) in `styles/globals.css`.
- Use Tailwind CSS v4 (CSS-first config); there is no `tailwind.config.ts`. Design tokens (colors, spacing, radii, typography scale) are defined once in a tokens stylesheet (for example `src/styles/token.css`, imported by `globals.css`) and referenced by class name. No hardcoded hex colors or pixel values in component `className`s.
- Reach for **semantic** colour tokens (surface, text, border roles, with dark pairs), not primitives (`bg-ramp-purple-500`). Semantics describe the job a colour does. Apply text as a whole text style (heading, body) rather than separate size/weight/leading classes.
- **Do not add `--background`/`--foreground`/`--primary`/`--ring`/etc. (shadcn's default semantic token names) to `@theme`/`:root` without checking first.** If existing components already reference those names (`bg-background`, `border-input`, `ring-ring`) as dead classes, because Tailwind silently drops a utility it can't resolve, defining those variables would make them resolve unexpectedly elsewhere. Audit usages first.
- For components with more than a couple of conditional class branches, use `cva` (class-variance-authority) or an equivalent variant helper instead of stacking ternaries inline in `className`.
- New presentational, stateless design-system primitives go in `src/components/ui/` and may be added via `shadcn/ui` (`components.json`). Reuse an existing component first, and don't migrate an existing one to a shadcn equivalent as a side effect of unrelated work.
- Use `clsx`/`tailwind-merge` (a `cn()` helper) to combine conditional and consumer-overridable classes safely, rather than string concatenation.

## Interactive primitives

- Reach for **Radix Primitives** for complex interactive patterns that need correct keyboard/focus/ARIA behavior: `Dialog`, `Popover`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`, `RadioGroup`. Don't hand-roll a modal or dropdown's focus-trap and keyboard handling from scratch.
- Don't introduce a second unstyled-component library for a pattern Radix already covers. If the codebase already uses another (for example Headless UI) for a given pattern, keep to it rather than mixing.
- Every dialog needs an accessible name (a title element or `aria-label`). If a dialog should open focused on a particular control, set that deliberately and verify on touch devices, where a library may focus the dialog itself instead.
- Style primitives entirely with Tailwind classes passed via `className`/`asChild`. Primitives supply behavior, not visuals.

## Component variants

- Define a small, closed set of variants per component (`variant: "primary" | "secondary" | "ghost" | "destructive"`, `size: "sm" | "md" | "lg"`) rather than open-ended style props. New visual needs extend the variant set deliberately, not via one-off inline overrides scattered through call sites.

## Responsive design

- Design mobile-first: base classes target mobile, `sm:`/`md:`/`lg:`/`xl:` layer up. Don't write desktop-first styles with `max-*` overrides as the default approach.
- Test your highest-traffic templates at minimum at mobile (375px), tablet (768px), and desktop (1280px+) breakpoints.

## Accessibility (WCAG 2.1 AA)

- Every interactive element is reachable and operable by keyboard; verify visible focus states aren't suppressed (`outline-none` without a replacement focus style is not acceptable).
- Images have meaningful `alt` text sourced from content (not the filename); purely decorative images use `alt=""`.
- Color contrast meets WCAG AA (4.5:1 text, 3:1 large text and UI components). Check new brand or theme colors against this before adopting them for text or interactive states.
- Form fields have associated `<label>`s (visible or `sr-only`), not placeholder-only labeling.
- Radix primitives get you correct ARIA roles and states by default. Don't override `role`/`aria-*` attributes they already manage unless there's a specific documented reason.
- Announce dynamic content changes (status messages, async results) to assistive technology.
- `pnpm lint` enforces jsx-a11y's recommended rules at error severity; contrast, focus order and meaningful alt text remain review judgment calls.

## Icons and imagery

- Import icons by name from the chosen icon set (tree-shakeable named imports). See [`performance.instructions.md`](./performance.instructions.md).
- Content imagery follows `next/image` conventions from `performance.instructions.md`; UI chrome icons and illustrations are SVG, inlined or imported as components, not raster images.

## Anti-patterns to reject in review

- Inline hex colors or magic pixel values bypassing the Tailwind theme.
- A hand-rolled modal or dropdown reimplementing focus-trap logic instead of using Radix's `Dialog`/`Popover`.
- Removing focus outlines without a replacement visible focus style.
- A new unstyled-component library introduced for a pattern Radix already covers.
- Placeholder-only form labels.
- Information conveyed by colour alone.
