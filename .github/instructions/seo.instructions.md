---
name: "SEO instructions"
description: "Metadata, structured data, sitemap, and crawlability conventions for public routes."
applyTo: "src/app/**/*.tsx,src/app/**/sitemap.ts,src/app/**/robots.ts"
paths:
  - "src/app/**/*.tsx"
  - "src/app/**/sitemap.ts"
  - "src/app/**/robots.ts"
---

# SEO Instructions

## Purpose

Organic traffic depends on correct metadata, structured data and crawlable URLs. These rules apply to any route-level file and to metadata and structured-data code.

## Metadata API

- Use the Next.js Metadata API exclusively. No manual `<head>`/`<meta>` tags in page bodies.
- Static, content-independent pages export a `metadata` object. Data-dependent pages export an async `generateMetadata({ params })` that reads from the same `services/` call already used to render the page. Don't issue a second, duplicate fetch just for metadata. The reuse comes from the reader, not from Next's `fetch` dedupe (SDK and service clients often do not use it): wrap readers in React `cache`, and cache published CMS reads with `'use cache'`. A reader with neither runs twice; wrap it in `cache` rather than threading data by hand if that matters.
- Every indexable page sets: `title`, `description` (unique, derived from real page copy, not a generic template repeated across pages), canonical `alternates.canonical`, and Open Graph (`openGraph.images` using an actual image) and Twitter card fields.
- Set `metadataBase` once in the root layout so relative OG and canonical URLs resolve correctly across environments.
- Resolve SEO through a fallback chain: page SEO, then global SEO, then a safe default. A CMS outage falls back to defaults rather than failing the render.

## Structured data (JSON-LD)

- Emit structured data for the page's primary entity (`Article`, `Product`, `Event`, and so on) sourced from the same normalized service response used to render the page, never hand-maintained separately from the visible content.
- Emit `BreadcrumbList` matching the visible breadcrumb UI exactly.
- Emit `Organization`/`WebSite` (with `SearchAction` if on-site search exists) once, at the layout level.
- Render JSON-LD via a small typed helper that serializes to a `<script type="application/ld+json">`, not string-concatenated by hand. Malformed JSON-LD is worse than none.

## Canonicalization and duplicate content

- Faceted or filtered list URLs (for example `?topic=news&sort=date`) set a canonical pointing to the unfiltered URL unless the filtered view is intentionally meant to be indexed as its own landing page.
- Paginated lists use real, crawlable pagination links (`?page=2` as an actual navigable link, not a client-only state change with no URL), so crawlers can reach deeper pages.
- Removed or unpublished content returns an appropriate status (404, or 410 where permanent) rather than silently returning 200 for a broken page.

## Sitemap and robots

- Generate `sitemap.ts` dynamically from the content service rather than hand-maintaining a static list. It must reflect what is actually published.
- `robots.ts` disallows non-indexable routes (account area, preview routes, internal search result permutations) and points to the sitemap.
- Large sites split the sitemap into an index plus multiple sitemap files, per the sitemap protocol size limits.

## Performance as SEO

- Core Web Vitals affect ranking. Follow [`performance.instructions.md`](./performance.instructions.md): LCP and CLS regressions are SEO regressions, not just UX ones.

## Anti-patterns to reject in review

- Duplicate `<title>`/description templates producing near-identical text across hundreds of pages.
- JSON-LD values that can drift out of sync with the visible page.
- Client-only pagination with no crawlable URL per page.
- Indexable account, preview or draft routes.
- Hand-written `<meta>` tags in a page body instead of the Metadata API.
