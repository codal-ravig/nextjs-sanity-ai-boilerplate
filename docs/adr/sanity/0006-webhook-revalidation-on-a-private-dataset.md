# 0006. Revalidate with a signed webhook; do not rely on defineLive

**Status:** Accepted

## Context

Two ways to keep published content fresh in Next.js:

| | `defineLive` (Live Content API) | Tag/webhook revalidation |
| --- | --- | --- |
| Freshness | Near real time, pushed to the browser | After the webhook fires, on next request |
| Dataset | Designed around public reads; private datasets need token handling | Works with a private dataset and server-only token |
| Cache control | Managed by the helper | You own tags and paths |
| Preview and published clients | Combined behind one helper | Kept as two separate clients |
| Extra moving parts | Live subscription, browser token for drafts | Webhook endpoint and secret |

A private dataset, an explicit two-client split, and a need to control cache keys per document favored the webhook approach. `defineLive` strict mode was also evaluated and not adopted for the same reasons.

## Decision

- Revalidate with a Sanity webhook calling `POST /api/revalidate`.
- The endpoint:
  1. Reads the **raw body** and verifies the signature **before** any side effect (see [`webhooks.md`](../../sanity/webhooks.md)).
  2. Compares secrets in constant time.
  3. Rejects replays (timestamp window, plus delivery ID tracking where the store supports it).
  4. Validates the payload and allowlists document types.
  5. Rejects draft IDs.
  6. Calls `revalidateTag` and `revalidatePath` for the affected entries only.
- Keep the published and preview clients separate. Perspective is never caller-supplied.

## Consequences

- Content is fresh within seconds of publish, not instantly.
- A new document type must be added to the allowlist and to the webhook filter, or it is silently ignored.
- Revisit if the dataset becomes public or instant updates become a requirement.

## Related

[`docs/sanity/caching-and-revalidation.md`](../../sanity/caching-and-revalidation.md)
