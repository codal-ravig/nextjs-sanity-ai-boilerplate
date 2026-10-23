---
name: figma-to-component
description: Use whenever building, updating, reviewing or checking a component, section or page against a Figma design, or turning Figma MCP output into code. Triggers on "implement this Figma", "check UI against Figma", "match the design", or a figma.com URL. Maps design tokens to this repo's tokens, translates MCP output to the repo's Tailwind setup, and applies the component, naming and accessibility rules.
version: "1.0.0"
---

# Figma to component

## Rule zero: the design system comes first

Every UI built or checked through Figma must use the design system the repo already has, in the structure it already has. Before writing or changing UI:

1. **Check the repo's design system first.** Reuse the primitives in `src/components/ui/` and the tokens in your global stylesheet or token file. Never restyle a raw element when a primitive exists. Never add raw hex values, one-off font sizes or a parallel palette.
2. **Then find the matching component in Figma.** Open the component's own set and compare variants, states, sizes and bound variables against the repo primitive. A screen frame shows instances. The component set is the spec.
3. **Follow the same structure.** If the Figma component maps to an existing primitive, use it, and add a variant if Figma has one the primitive lacks. If no primitive exists, build it in `src/components/ui/` following the existing ones. Feature UI goes in `components/<feature>/` and composes `ui/`. If a Figma value has no token, that is a token gap: add the token, do not inline the value.

## Before you start

1. **Use the configured Figma MCP.** `.vscode/mcp.json` and `.mcp.json` register Figma's remote MCP server. If a tool cannot reach it, ask for the node, a screenshot or the variables from an MCP-enabled client instead of guessing the design. See `docs/mcp.md`.
2. **Confirm the file and node.** Know which Figma file holds primitives and tokens, and which holds page designs. Building a page before its primitives exist is out of order: stop and flag it.
3. **Confirm the value has a token.** If your token set does not cover a color or size, that is a gap to fix first.

## The loop

1. **Map every value to an existing token.** MCP output names Figma variables. Map each to a semantic token in your token file. If there is none, stop and add the token first.
2. **Translate the MCP output to this repo's Tailwind setup, not as is.** MCP output is often written for an older Tailwind major version. Check the repo's version and rename utilities that changed between versions (shadow, radius, ring and outline utilities are the usual ones). Configuration lives in CSS, not a `tailwind.config` file. A one-off effect becomes a `@utility` rule in the global stylesheet.
3. **Write the component by hand**, using any existing component only for reusable behavior and accessibility details, never for unverified visual values.
   - Follow [`component.instructions.md`](../../../.github/instructions/component.instructions.md) and [`naming-conventions.md`](../../../docs/naming-conventions.md): `PascalCase.tsx`, named export, explicit `<Component>Props`, Server Component unless interactivity forces `"use client"` on the smallest leaf.
   - Follow [`ui.instructions.md`](../../../.github/instructions/ui.instructions.md): variants with `cva`, Radix primitives for interactive behavior, `cn()` for conditional classes, no hardcoded colors or pixel values.
4. **Visual QA.** Compare against the Figma reference for each variant and state the design defines (default, hover, focus, active, disabled, error at minimum) and check contrast to WCAG 2.1 AA.
5. **Test.** A component test covering interaction and empty and error states.
6. **Validate.** Run `corepack pnpm validate`, and `corepack pnpm build` too if the change touched the server and client boundary or route structure.

## Content from Sanity

If the design shows editor-controlled text or images, model them in the Sanity schema (see the `sanity-content-modeling` skill) instead of hardcoding them. Images need alt text.

## After you finish

Run `docs-sync` if the change alters documented behavior, and list any token gaps you found in your report.
