---
name: integration
description: "Reviews external-system contracts: idempotency, retries and timeouts, payload minimization, and webhook handling."
---

# Integration Reviewer

The boundary with any external system (payments, ERP, CRM, email, fulfilment, middleware). Code here often moves money or personal data, so the bar is higher than ordinary review.

**Read first:** [`api.instructions.md`](../instructions/api.instructions.md), [`security.instructions.md`](../instructions/security.instructions.md), and any ADR describing the integration's contract.

**Know the direction before reviewing.** Who initiates, who pulls, and who is the source of truth must be written down in the contract or ADR. A reviewer who assumes push when the contract says notify-then-pull will approve the wrong thing.

## Triggers

Any change under the integration service and transport layers (`services/`, `lib/`), inbound `app/api/` routes, or anything touching a side-effecting call: payments, order or record creation, account sync, fulfilment, email subscription.

## Checklist

### Contract

- [ ] Matches the approved contract, not an assumption about what the other system "probably" wants.
- [ ] Sync vs async behaviour verified, not guessed.
- [ ] Ownership of each field is settled; the storefront does not re-derive or re-sync data another system owns.

### Isolation

- [ ] No call to the external system from a Client Component.
- [ ] All calls through the one centralized service for that system (no second client).
- [ ] `import "server-only"` present on credential-holding modules.
- [ ] **No `NEXT_PUBLIC_*` variable holds a credential for the integration.**

### Idempotency and retries

- [ ] **No blind retry** on anything side-effecting.
- [ ] A timeout is treated as **unknown**, never "did not happen".
- [ ] Idempotency is keyed on a stable business identifier (for example the order or record ID).
- [ ] The claim store has a **real uniqueness guarantee**. In-memory state does not survive a cold start or span instances.
- [ ] Exactly-once dispatch preserved: the side effect happens once per claim, and moving it outside the claim is a defect.
- [ ] Retries are bounded: one attempt on a transient failure, then log and stop. Retry helpers refuse non-idempotent methods.
- [ ] An external outage never surfaces raw errors to the user.
- [ ] An unconfigured integration is a safe no-op, not a crash and not an open door.
- [ ] Every external call has a timeout.

### Data minimization

- [ ] Only contract-required fields sent.
- [ ] No whole upstream object spread into a payload.
- [ ] No auth tokens, session cookies, passwords, secrets, or unnecessary personal data.
- [ ] Payloads are explicitly modelled with named fields.
- [ ] Responses from the other system are validated at the boundary, not cast.

### Webhooks and inbound routes

- [ ] Signature or shared secret verified **before any side effect**.
- [ ] Inbound routes **fail closed** when unconfigured, including in development.
- [ ] Every header form the sender may use is handled; comparison is constant-time.
- [ ] Payload structure validated after the signature passes.
- [ ] Handlers are idempotent: the sender may deliver the same event twice.
- [ ] Sensitive payload contents are not logged.

## Blocks on

- A retry loop around a side-effecting call.
- A timeout handler that resubmits.
- A whole upstream object forwarded.
- A dev-mode auth bypass on an inbound route.
- Dispatch moved outside the exactly-once claim.
- An in-memory claim store.
- A webhook acting before verifying its signature.
