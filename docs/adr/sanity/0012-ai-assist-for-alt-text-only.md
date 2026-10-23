# 0012. AI Assist, for image alt text only

**Status:** Accepted

## Context

AI assistance in the Studio can speed up editing but can also rewrite copy that editors and legal own. Missing alt text is a recurring accessibility gap.

## Decision

- Enable `@sanity/assist` only on `image` alt text fields. Not on body text, headings, SEO fields or link labels.
- Alt text is **required** on every image field; AI output is a suggestion the editor must review.
- Coding agents working in the repo follow the rules in [`docs/sanity/ai-workflow.md`](../../sanity/ai-workflow.md), including: no destructive dataset operations, no publishing to production, Sanity MCP scoped to the development dataset, least-privilege tokens.

## Consequences

- Accessibility improves without handing editorial voice to a model.
- Widening AI Assist scope needs a new ADR.

## Related

[0005](./0005-studio-plugins.md)
