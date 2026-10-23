# Security Rules

Hard requirements. A change violating any of these does not merge.

Detail and rationale: [`security.instructions.md`](../instructions/security.instructions.md).

---

## Secrets

1. **No privileged credential carries a `NEXT_PUBLIC_` prefix.** Only values safe to publish (public project IDs, public keys) may use it.
2. Server-only values live in one server config module (for example `lib/config/env.ts`); public values in a separate one (for example `lib/config/public-env.ts`). Do not merge the two.
3. Every credential-holding module carries `import "server-only"`.
4. A secret is never passed as a prop into a Client Component.
5. A secret never appears in a log, an error message, telemetry, a URL, or a test fixture.

## Authorization

6. Authorization is enforced **server-side**, always. Hiding an action in the UI is not enforcing it.
7. Never trust a client claim about identity, role, account, or permission.
8. Resource ownership is verified before any mutation. An ID from a request (a record, order, or account ID, for example) is a claim, not a fact.

## Business values

9. Prices, totals, quantities, permissions and entitlements are **derived server-side from the owning system** on every request that depends on them.
10. A client-supplied index, collection or tenant name is rejected where it selects what a user may see. It is an entitlement bypass.

## Input

11. All external input is validated at the boundary with Zod: bodies, query params, route params, webhook payloads, **and upstream API responses**. CMS content, user-supplied content and AI-generated content are untrusted input.
12. No string concatenation into a query language (GROQ, SQL). Parameterize.
13. No `dangerouslySetInnerHTML` for CMS or user content.

## Webhooks

14. Verify the signature or secret **before any side effect runs**.
15. Fail closed: an unset secret rejects, in every environment including development.
16. Compare secrets in constant time.
17. Validate payload structure even after the signature passes.

## Side-effecting calls

18. **Never blindly retry a side-effecting call** (payments, order or record creation, anything that cannot safely run twice).
19. A timeout means **unknown**, never failed.
20. Idempotency is keyed on a stable business identifier, backed by a store with a real uniqueness guarantee.

## Data and caching

21. Never log PII, tokens, secrets, full request payloads, or payment data.
22. **Personalized responses are cache-isolated per user or account.** A shared cache key across users is a data breach.
23. Per-session state (forms in progress, one-time tokens) and draft content are never cached.
24. Only contract-required fields are sent to an external integration; payloads are explicitly modelled, never spread from an upstream object.

## Errors

25. Raw upstream errors never reach a user.

## Environments

26. Each environment has its own credentials and endpoints. **Never point local development at production services.**
27. Preview and draft endpoints are authenticated. Draft mode is never activated by a query parameter alone.

---

## Automated enforcement

| Rule | Enforced by |
| --- | --- |
| No secret in a PR's commits | `.github/workflows/security-scans.yml`, job `secret-scan-diff` (gitleaks), required check, blocking |
| No secret anywhere in history (catches direct pushes and admin merges) | The scheduled run of `security-scans.yml` covers new commits; a full-history scan is **not automated**, so run gitleaks over the whole history by hand now and then |
| Constant-time secret comparison; no privileged `NEXT_PUBLIC_` credential | `pnpm audit:architecture` |
| Static analysis for common vulnerability classes in JavaScript and TypeScript | `.github/workflows/codeql.yml` |
| No dependency with a known high/critical CVE | `.github/workflows/dependency-audit.yml` (`pnpm audit --audit-level=high`), required check, blocking |

Everything else above is a review-only requirement, checked in `.github/agents/security.md`.

## Review triggers

Any change touching these gets an explicit security review: authentication · authorization · user data · pricing · payments · personalized content · credentials · webhooks · cache keys.

Never choose convenience over security.
