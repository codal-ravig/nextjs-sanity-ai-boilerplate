# 0004. One dataset per environment, code and content promoted separately

**Status:** Accepted

## Context

Editors and developers share one Content Lake project. Mixing environments in one dataset leaks drafts, test content and schema experiments into production.

## Decision

| Environment | Dataset | Notes |
| --- | --- | --- |
| Local | `development` or a personal dataset | Never `production` |
| Staging | `staging` | Mirrors production schema |
| Production | `production` | Editors publish here |

- All datasets are **private**; the app reads with a server-only token.
- The dataset name comes from an environment variable, never a literal in code.
- Each environment has its own read token, webhook, webhook secret and CORS origins.
- **Code deploys and content publishes are separate.** Content does not travel with code. Copy it deliberately (export/import or a migration) and review the result.
- Feature flags, not datasets, gate rollout of new content-driven UI.
- Authoritative environment values live in `docs/environment-matrix.md` (or your equivalent), not in this ADR.

## Consequences

- A staging edit can never appear in production.
- Promotion of structural content is an explicit, reviewable step.

## Related

[`docs/sanity/environments.md`](../../sanity/environments.md), [`docs/sanity/promotion-workflow.md`](../../sanity/promotion-workflow.md)
