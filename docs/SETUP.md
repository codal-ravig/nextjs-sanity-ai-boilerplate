# Setup

How to get a working local environment. Keep this true: update it in the same PR that changes a step.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node | See `.nvmrc` | `nvm use` |
| pnpm | Pinned by `packageManager` in `package.json` | Always run `corepack pnpm`, never a bare global `pnpm` |
| Git | Current | Husky hooks install on `pnpm install` |

## First run

```bash
corepack enable
corepack pnpm install
cp .env.example .env.local   # then fill in values, see docs/environment-matrix.md
corepack pnpm dev
```

Then run the gate once to confirm a clean start: `corepack pnpm validate`.

## Sanity

1. Create a Sanity project and a **development** dataset. Never point local work at production.
2. Set the project ID and dataset in `.env.local`.
3. Create a read token scoped to the development dataset. It is server-only.
4. Deploy the schema, run `corepack pnpm sanity:typegen`, and commit the generated types.
5. Add a CORS origin for `http://localhost:3000` with credentials.
6. Add the revalidation webhook and its secret, see [`sanity/webhooks.md`](sanity/webhooks.md).

## Secrets

* `.env*` files are gitignored except `.env.example`. Never commit a real value.
* Only identifiers that are safe to publish (project ID, dataset name, public site URL) may carry a `NEXT_PUBLIC_` prefix. Tokens, webhook secrets and API keys never do. `pnpm audit:architecture` fails on a secret-looking `NEXT_PUBLIC_` variable.
* Rotation: generate the new value, set it in the host's environment and in the owning system, redeploy, then revoke the old one. Rotate immediately if a value was ever pasted into chat, a ticket or a log.
* E2E credentials live only in `.env.test`, which is never committed.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Store location or lockfile errors | Bare `pnpm` on `PATH` differs from the pinned version. Use `corepack pnpm` |
| Stale Tailwind output after class changes | Clear `.next/cache` and restart the dev server |
| TypeGen drift check fails | Run `corepack pnpm sanity:typegen` and commit the result |
| Commit rejected | See `.commit-rules.json` and [`repository-workflow.md`](repository-workflow.md) |
