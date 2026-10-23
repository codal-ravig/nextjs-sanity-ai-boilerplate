# Environments

Record real values in your environment matrix (for example `docs/environment-matrix.md`). Do not guess; leave unknowns as `-`.

| | Local | Staging | Production |
| --- | --- | --- | --- |
| App URL | `http://localhost:3000` | `<staging-url>` | `<production-url>` |
| Studio | `<app>/studio` | `<app>/studio` | `<app>/studio` |
| Project | `<project-id>` | `<project-id>` | `<project-id>` |
| Dataset | `development` | `staging` | `production` |
| Visibility | private | private | private |
| Read token | `.env.local` | secret store, own token | secret store, own token |
| Publish webhook | not used locally | own webhook and secret | own webhook and secret |
| CORS origins | localhost | staging URL | production URL |

## Isolation rules

- Never share a token between environments.
- Never share a webhook secret: reuse would let a staging delivery pass production's signature check.
- The dataset name comes from an environment variable.
- Cache tags are per running app, so one environment's webhook cannot revalidate another's.

## Moving changes

Code goes through the normal pipeline. Content does not travel with code. See [`promotion-workflow.md`](./promotion-workflow.md) and [`migration-workflow.md`](./migration-workflow.md).
