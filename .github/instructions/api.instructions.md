---
name: "API route instructions"
description: "Route handlers: validation, authentication, error responses, and webhooks."
applyTo: "src/app/api/**"
paths:
  - "src/app/api/**"
---

# API Route Instructions

**Documentation for this area.** Keep a route-by-route reference in `docs/flows/` (see [`docs/flows/README.md`](../../docs/flows/README.md)). Read the matching document before changing behaviour, and update it in the same change if the behaviour moves.

Route handlers are a trust boundary. Everything arriving is untrusted until validated.

## Order of operations

1. **Authenticate**: verify the secret, session or signature.
2. **Validate**: parse the payload with Zod.
3. **Authorize**: confirm this caller may affect this resource.
4. Then, and only then, perform the side effect.

Doing work before step 1 turns a handler into a lever for anyone who finds the URL.

## Authentication

- Webhooks verify a shared secret or signature. **Fail closed**: an unset secret rejects; it never means "accept anything".
- Compare secrets in **constant time**. A plain `===` leaks the secret through timing given enough attempts.
- Session-authenticated routes re-verify server-side. Never trust a client claim about identity or role.

## Validation

Parse every input with Zod: body, query params, route params. Reject with a 400 and a safe message. Never echo the raw input back in an error.

Validate structure even after a signature passes: a signed request can still be malformed.

## Responses

- Map every error to a shared `AppError` (for example `lib/errors/app-error.ts`) before it reaches the client and return its public shape: a safe message, no upstream detail. Routes that predate `AppError` are expected to return the same shape (`{ success: false, message: "<safe message>" }` with an appropriate status). The invariant is "no raw upstream text or structure", not the literal import.
- Never leak an upstream status body, stack trace, internal identifier, or a caught error's own `.message` unless that error is one of ours (a domain error you threw yourself, whose message was written to be user-safe) rather than something surfaced from a third-party system.
- Use the status from `AppError.status` (or the equivalent explicit status).

## Route checklist

Every new or changed route handler satisfies all of these before merging. Reviewers check each one explicitly. "Looks fine" is not a substitute for confirming the file does it.

- [ ] **Schema**: the body, query params, and route params are parsed with a Zod schema. Invalid input gets a 400 with a safe message; nothing from the raw input is echoed back.
- [ ] **Ownership gate before the first mutation**: if the request carries a resource ID (an order ID, a document ID, an account ID), it is verified against the caller's own session, using a session-derived check, and that check runs _before_ anything the request does is allowed to take effect. A client-supplied ID is a claim, not a fact.
- [ ] **AppError mapping**: every error path returns an `AppError`-shaped body (see Responses): a safe user-facing message and the right HTTP status, never upstream text, a stack trace, or an internal identifier.
- [ ] **Constant-time secret check**: any shared-secret or signature comparison (webhooks, cron triggers, revalidate and draft endpoints) goes through a shared constant-time helper (for example `lib/auth/constant-time-equal.ts`), never `===`, and fails closed when the expected secret is unconfigured.
- [ ] **Correlation ID propagation**: the request's correlation ID is read rather than regenerated, included in log entries for this request, and forwarded on any outbound call so the request is traceable end to end.

Back this checklist with a mechanical backstop where you can, for example an architecture audit script that flags a `===`/`!==` comparison against a `*_SECRET` env var. The rest are review items because they depend on request-specific context a grep pattern cannot see.

## Logging

Log identifiers and outcomes with a correlation ID. **Never log** payload contents that may carry user data, tokens, or unpublished content.

## Idempotency

Any handler with a side effect that a client might retry needs an idempotency strategy keyed on a stable business identifier, backed by a store with a real uniqueness guarantee, never in-memory state. Assume every request will arrive twice.

## Redirects

Never redirect to a caller-supplied URL without validating it against an allowlist. That is an open redirect.

## Caching

Route handlers with side effects are never cached. Read-only handlers returning personalized data must be account-scoped or uncached.

## Anti-patterns to reject in review

- A side effect that runs before authentication, validation or the ownership check.
- A secret compared with `===`, or an unset secret that lets the request through.
- A raw upstream error body, stack trace or caught `.message` returned to the client.
- A resource ID from the request body trusted without a session-derived ownership check.
- A redirect to a caller-supplied URL with no allowlist.
- A mutating handler with no idempotency strategy.
