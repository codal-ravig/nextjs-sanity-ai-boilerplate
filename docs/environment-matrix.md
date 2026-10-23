# Environment matrix

Which value lives where. `.env.example` is the list of every variable. Update both together.

## Environments

| Environment | Sanity dataset | Draft Mode | Revalidation webhook | Notes |
| --- | --- | --- | --- | --- |
| Local | `development` | Enabled | Optional | AI assistants may only connect here |
| Preview or staging | `staging` | Enabled, authenticated | Yes | Mirrors production config |
| Production | `production` | Authenticated only | Yes | A human promotes content and schema, see [`sanity/promotion-workflow.md`](sanity/promotion-workflow.md) |

## Variables

Rename to match your `src/lib/env.ts`. Validate every one there, and fail fast at boot.

| Variable | Scope | Secret | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public | No | Sanity project identifier |
| `NEXT_PUBLIC_SANITY_DATASET` | Public | No | Dataset for this environment |
| `NEXT_PUBLIC_SITE_URL` | Public | No | Canonical origin for metadata and sitemap |
| `SANITY_API_READ_TOKEN` | Server | Yes | Scoped read token for drafts and Visual Editing |
| `SANITY_REVALIDATE_SECRET` | Server | Yes | Verifies the revalidation webhook signature |
| `SANITY_PREVIEW_SECRET` | Server | Yes | Authenticates `/api/draft` |

## Rules

1. A secret never gets a `NEXT_PUBLIC_` prefix and never reaches a Client Component.
2. A new variable is added to `.env.example`, `src/lib/env.ts` and this table in the same PR.
3. Each environment gets its own secrets. Never reuse a production secret elsewhere.
