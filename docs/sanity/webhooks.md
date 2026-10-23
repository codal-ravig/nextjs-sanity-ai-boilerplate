# Sanity Webhooks

## Configuration (once per environment)

| Setting | Value |
| --- | --- |
| URL | `<app-url>/api/revalidate` |
| Method | `POST` |
| Dataset | The environment's own dataset |
| Trigger on | Create, update, delete |
| Drafts | Off (published events only) |
| Filter | Allowlisted document types only |
| Projection | `{_id, _type, "slug": slug.current}` plus fields the handler needs |
| Secret | Unique per environment, stored in the secret store |
| API version | Pinned |

Also grant the app's read token and add the app origin to CORS if Studio is embedded.

## What the endpoint does, in order

1. Read the **raw** body (signature verification needs the exact bytes).
2. Verify the Sanity signature with the secret. Use the official helper (`@sanity/webhook` / `next-sanity/webhook`) or a constant-time comparison. Reject on failure with 401 before any other work.
3. Check replay protection: reject deliveries outside a short timestamp window; track delivery IDs in a store with a uniqueness guarantee when you need strict once-only handling. Revalidation is idempotent, so replays are low impact but still rejected.
4. Validate the payload shape (schema validation, not casts).
5. Check the document type against the allowlist. Unknown types are acknowledged and ignored.
6. Reject draft IDs (`drafts.` prefix).
7. Compute tags and paths; call `revalidateTag` / `revalidatePath`.
8. Return 200 with a small JSON body.

## Failure handling

| Case | Response |
| --- | --- |
| Bad or missing signature | 401, no side effects |
| Malformed payload | 400 |
| Type not allowlisted | 200, ignored |
| Revalidation error | 500 so Sanity retries |

Never log the secret or the full signature.

## Observability

Log delivery ID, type, tags dropped and outcome. Alert on sustained 401s or 500s.

## Local testing

Use a tunnel or send a signed request with the local secret; or restart the dev server. Never point a production webhook at a tunnel.
