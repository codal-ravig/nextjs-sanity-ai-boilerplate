---
name: "Performance instructions"
description: "Performance budgets and practices for Core Web Vitals, caching, images, and bundle size."
applyTo: "**"
---

# Performance Instructions

## Purpose

Sites live or die on Core Web Vitals and time-to-interactive. These rules apply whenever writing or reviewing code that affects what ships to the browser or how data is fetched.

## Targets

- **LCP** < 2.5s, **INP** < 200ms, **CLS** < 0.1 on your highest-traffic templates (home, listing, detail) under standard mobile network throttling (Fast 3G/4G baseline).
- The hero image and the primary call-to-action on a template must be part of the initial server-rendered HTML, not client-fetched after hydration.

## Rendering and data fetching

- Follow the caching/tagging strategy in [`rendering.instructions.md`](./rendering.instructions.md). Under-caching hurts LCP via origin latency, over-caching serves stale data. Both are performance and correctness bugs.
- Parallelize independent data fetches (`Promise.all`); never create avoidable request waterfalls.
- Stream non-critical sections with `<Suspense>` so LCP isn't gated on the slowest data dependency.

## Images

- All images go through `next/image`; no raw `<img>` for content images. Set explicit `width`/`height` (or `fill` with a sized container) to prevent CLS.
- Mark the LCP image (hero or main image) with `preload` (Next 16 deprecated `priority`); do not mark more than one or two images per page `preload` or it defeats the purpose. Small above-the-fold images, such as the header logo, keep the default lazy loading: React's server render preloads every non-lazy image, so `loading="eager"` competes with the LCP image as much as `preload` does.
- Serve responsively sized images (`sizes` prop set to match actual rendered width per breakpoint) rather than shipping one large asset to all viewports.
- Source images from the owning system's asset service or an image CDN in front of it (for Sanity, `@sanity/image-url`); don't proxy or re-host images through a Next.js route handler unless there's a specific transformation need.

## JavaScript and bundle size

- Keep Client Components minimal (see [`nextjs.instructions.md`](./nextjs.instructions.md)). Every `"use client"` boundary adds to the client JS bundle.
- Dynamically `import()` heavy, below-the-fold, or interaction-gated components (rich text editors, chart libraries, modals not open on load) instead of bundling them into the initial page chunk.
- Avoid adding a new dependency for something a few lines of first-party code can do; check bundle impact (for example via `next build` output or a bundle analyzer) before adding a non-trivial library.
- Tree-shake icon and utility libraries via named imports (`import { CheckIcon } from "<icon-library>"`), imported one file per icon where the library requires it, never a barrel import of an entire icon set.

## Fonts

- Use `next/font` (self-hosted, zero layout shift by default) instead of a render-blocking external font `<link>`.

## Third-party scripts

- Load non-critical third-party scripts (analytics, chat widgets, marketing pixels) via `next/script` with `strategy="afterInteractive"` or `"lazyOnload"`. Never a blocking synchronous `<script>` in `<head>`.

## Caching headers

- Static assets and build output get long-lived immutable caching (handled by Next.js/hosting by default). Don't override with shorter TTLs without reason.
- API/route handler responses set explicit `Cache-Control` appropriate to their volatility; don't leave it to platform defaults for anything carrying user-specific or fast-changing data.

## Measuring

- New features touching high-traffic templates should be checked against Lighthouse/CrUX field data (where available) before merging, not just "feels fast" in dev.

## Anti-patterns to reject in review

- Raw `<img>` tags for content images.
- Client-fetching data in `useEffect` that could have been server-rendered.
- A new heavy dependency added for a one-off, small piece of functionality.
- Every image on a page marked `preload` (or the deprecated `priority`).
- Render-blocking third-party `<script>` tags in `<head>`.
