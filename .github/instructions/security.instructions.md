---
name: "Security instructions"
description: "Secrets, authentication, authorization, input validation, webhooks, and user data."
applyTo: "src/**"
paths:
  - "src/**"
---

# Security Instructions

Apply on every change, not only ones that look security-related.

## Authentication vs authorization

| | Question | Owner |
| --- | --- | --- |
| **Authentication** | "Who is the user?" | Your identity provider |
| **Authorization** | "What may they do?" | The owning system's permissions plus account context |

Never collapse these into one UI check. **Hiding an action is not enforcing it.** The request can still be made directly.

Server-side enforcement is mandatory for: account access and switching, user-specific content, resource access, user management, account permissions, restricted content.

A valid session says who someone is. It says nothing about which account's resources they may read.

## Secrets

**No privileged credential carries a `NEXT_PUBLIC_` prefix.**

| Never public | Safe as public |
| --- | --- |
| `SANITY_API_READ_TOKEN` | `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` |
| `SANITY_REVALIDATE_SECRET` | Public OAuth client IDs |
| Search admin API keys | Search-only keys scoped to read |
| Webhook shared secrets | Payment-provider public client keys |
| Third-party API tokens | Site keys that are public by design (read at runtime and passed as a prop if you prefer to avoid the prefix) |

**There must never be a `NEXT_PUBLIC_*` variable for a webhook secret, admin key or service token.**

- Server-only values live in one module (for example `lib/config/env.ts`); public values in another (`lib/config/public-env.ts`). The split is deliberate. Keep it.
- Every credential-holding module carries `import "server-only"`, so a client import fails at build time rather than leaking at runtime.
- Never pass a secret as a prop into a Client Component.

## Never trust the client

Derive server-side, on every request, from the owning system: prices and amounts, inventory and quotas, permissions and entitlements, content or index visibility, totals and any other authoritative value.

A value in a request body is an **input to a lookup**, never the answer. The canonical failures: accepting a client-supplied amount (fraud) or a client-supplied search index name (entitlement bypass).

## Verify ownership of resource IDs

A resource ID in a request body, query string or route param is a **claim**, not a fact. Before acting on it, verify the authenticated caller owns it, using a session-derived check, and do so before any mutation.

## Input validation

Validate at the boundary with Zod: form submissions, search params, route params, API payloads, webhook bodies, **and external API responses**. An upstream response is external input too.

Never interpolate user input into a URL, HTML string, or query language. Never build a GROQ query by concatenation; parameterize.

## Webhooks

1. Verify the signature/secret **before any side effect runs**, comparing in constant time.
2. Validate payload structure and expected types.
3. Fail closed: an unset secret rejects; it never means "accept anything".
4. Be idempotent, using a store with a real uniqueness guarantee, never in-memory state.
5. Never log sensitive payload contents.

## Side-effecting calls and retries

**Never blindly retry a side-effecting call.** A timeout means _unknown_, not _failed_. Retry helpers refuse non-idempotent methods; a hand-rolled retry loop that resubmits a write is a defect.

## User data and privacy

- Collect, send and log only what is required.
- **Never log** personal data, authentication data, tokens, secrets, full request payloads, or payment data. Log identifiers and outcomes.
- **Cache isolation is a security control.** A personalized response sharing a cache key with another account is a data breach, not a caching bug.

## Errors

Raw upstream errors never reach users. They leak internal structure, identifiers, and sometimes credentials in URLs. Map to `AppError` at the service boundary: a safe, actionable message for the user via its public shape; full diagnostic detail (`cause`, upstream code, source) with a correlation ID in the logs only.

See the [API route checklist](./api.instructions.md#route-checklist) for the full set of things a new route must satisfy, including this one.

## Payments

If the app takes payments, card data is handled by the payment provider's hosted fields or SDK. Raw card numbers never touch this application's server or client state.

## Review triggers

Review security implications explicitly before changing anything involving: authentication, authorization, user data, pricing or amounts, payments, personalized content, credentials, webhooks, cache keys.

Never choose convenience over security.

## Blocking conditions

Three of the Validation Gate's merge blockers are security conditions. They are restated here rather than linked, because a reviewer reading this file does not open [`.github/rules/validation-gate.md`](../rules/validation-gate.md).

Do not approve or merge a change where any of these holds:

| Condition | What actually catches it |
| --- | --- |
| A secret is reachable from browser code | Partly mechanical. An architecture audit can reject any credential-shaped `NEXT_PUBLIC_` name outside an allowlist, and `server-only` fails the build when a server module is imported into client code. A secret reaching the browser as a prop, inside a log, or under a name that does not look credential-shaped is caught by review alone. |
| Authorization is enforced only in the UI | **Review only.** No tool checks this. |
| Personalized content shares a cache key across accounts | **Review only.** No tool checks this. |

Two of the three have nothing watching them, so the reviewer is the control. When a change claims a check happens server-side, find that check and name it. An unverified claim is a missing check.

## Anti-patterns to reject in review

- A privileged credential with a `NEXT_PUBLIC_` prefix, or a secret passed as a prop.
- Authorization enforced only by hiding UI.
- A client-supplied amount, index name or resource ID acted on without a server-side lookup.
- A secret compared with `===`, or an unset secret that accepts requests.
- A write retried on timeout without an idempotency guarantee.
- A personalized response cached under a shared key.
- A raw upstream error body returned to the client.
