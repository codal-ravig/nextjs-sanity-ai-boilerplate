# Architecture

Read this before writing code. It holds the layering every change must respect and the question that is most expensive to get wrong: which system owns which data.

> Template note: sections marked **Fill in** are placeholders. Replace them when you adopt this baseline, then delete this note.

## 1. Principle

Next.js orchestrates the experience. Each external platform stays the source of truth for its own domain. The storefront never re-creates another system's job.

## 2. Layering

```
app -> components -> domain -> services -> lib -> external system
```

A layer may import only from layers to its right. Nothing imports upward.

| Layer | Path | Holds | May import |
| --- | --- | --- | --- |
| UI routes | `src/app/` | Pages, layouts, route handlers, Server Actions. Composes services and components. | components, domain, services, lib |
| Components | `src/components/` | React UI. Server Components by default, small client leaves. | components, domain, hooks, lib (types and helpers only) |
| Domain | `src/domain/` | Business rules and pure functions. No React, no vendor client, no network. | domain, types |
| Services | `src/services/` | Adapters for external systems. Map upstream responses into this project's own types. | services, lib, domain, types |
| Lib | `src/lib/` | Transport, vendor clients, config, cache helpers. The bottom layer. | lib, types |

Rules that follow:

- A React component never calls an external API directly. Data arrives from a Server Component, a route handler or a hook that calls one.
- Vendor response shapes stop at `services/`. Everything above sees the project's own types.
- Enforce layering with ESLint import boundaries. `scripts/architecture-audit.sh` is a backstop for the cases lint cannot see.

## 3. Source of truth

One system owns each kind of data. The storefront reads from it, caches it carefully, and does not keep a second writable copy.

| Domain | Owner | Storefront role |
| --- | --- | --- |
| Editorial content: pages, navigation, banners, SEO fields | **Sanity** | Reads published content. Reads drafts only in authenticated preview. |
| Commerce or application data | **Fill in**: your commerce or data API | Calls it through `services/`. Never trusts values the browser sends back. |
| Search | **Fill in**: your search provider | Queries it. Does not duplicate its index rules. |
| Identity and sessions | **Fill in**: your identity provider | Verifies sessions server-side. Does not store credentials. |
| Marketing and CRM | **Fill in**: your marketing or CRM tool | Sends sign-ups through one service. Does not own subscription state. |

### How to fill this in

1. List every kind of data the product shows or changes.
2. Name exactly one owner for each. If two systems both hold it, pick one and write down why.
3. For each row add: where the code lives (`services/<name>/`), how it is cached, and what happens when the owner is down.
4. Record the decision as an ADR (see [`adr/0001-source-of-truth-boundaries.md`](./adr/0001-source-of-truth-boundaries.md)).

If ownership of a new field is unclear, stop and settle it before writing code. Discovering halfway through that another system owns the data means rewriting the change.

## 4. Integration boundaries

- **One service module per external system**, under `src/services/<system>/`. A second integration with the same system is a defect.
- **Transport in `lib/`.** Timeouts, retries, auth headers and error mapping live in one place per system.
- **Typed at the edge.** Validate and narrow upstream data once, at the service boundary, then use project types.
- **Content from Sanity** goes through the content service and generated types. See [`sanity/architecture.md`](./sanity/architecture.md).
- **Environment variables** are read in `lib/` config, validated at startup, and documented in `.env.example` in the same change that adds them.

## 5. Security posture

| Concern | Stance |
| --- | --- |
| Secrets | Server-only. No privileged credential ever gets a `NEXT_PUBLIC_` prefix. The audit script fails on credential-shaped public names. |
| Authorization | Never trust client-controlled values. A resource ID in a request body is a claim, not a fact: verify ownership server-side before acting on it. |
| Idempotency | Any call that changes state needs a key and a store with a real uniqueness guarantee. Never in-memory state. |
| Cache isolation | Per-user content is never cached under a shared key. See [`adr/0003-caching-and-personalization.md`](./adr/0003-caching-and-personalization.md). |
| Webhooks | Verify the signature on the raw body with a constant-time comparison, reject stale timestamps, fail closed when the secret is not configured. |
| Preview and Draft Mode | Draft Mode bypasses published content, so its token check is a security boundary. Use a read token that is server-only and scoped to read. |
| Input | Validate every request body, query and header at the boundary with a schema. |
| Dependencies | Audited in CI. A new runtime dependency needs a stated reason. |

Security and source-of-truth boundaries beat implementation convenience. Details live in [`.github/rules/security-rules.md`](../.github/rules/security-rules.md).

## 6. Failure and retry stance

- **A timeout means unknown, not failed.** Do not blindly retry a call that changes state. Retry only idempotent reads, or writes carrying an idempotency key.
- **Fail closed** for security checks, **degrade gracefully** for content. A missing banner is fine, a skipped authorization check is not.
- **Bound everything:** timeouts on every outbound call, a cap on retries, backoff with jitter.
- **Make failure visible.** Log with a correlation ID and no personal data. An error boundary per route segment, with a safe fallback.
- Document the failure scenarios for each flow in `docs/flows/` (see [`flows/_template.md`](./flows/_template.md)).

## 7. Rendering and caching (Next 16)

The project uses Cache Components. Summary of the model:

- **Static shell, dynamic holes.** Prerender what is the same for everyone. Wrap request-time and per-user parts in `<Suspense>` so they stream.
- **`"use cache"` with `cacheLife` and `cacheTag`** for shared data. Tag by entity so a publish can revalidate exactly what changed.
- **Per-user data is never inside a shared cache entry.** Read cookies or headers outside `"use cache"` and pass only the narrow value in as an argument, or render the part at request time.
- **Revalidate by tag from a verified webhook**, not by a short TTL alone. See [`sanity/caching-and-revalidation.md`](./sanity/caching-and-revalidation.md).
- **Decide the strategy per route**, explicitly. Do not leave it to defaults.
- Read the Next.js guide in `node_modules/next/dist/docs/` before changing caching behavior: APIs here may differ from older versions.

Decision record: [`adr/0003-caching-and-personalization.md`](./adr/0003-caching-and-personalization.md). Skills: `next-cache-components-adoption`, `next-cache-components-optimizer`.

## 8. Where to go next

| Need | Read |
| --- | --- |
| Naming a file, component or hook | [`naming-conventions.md`](./naming-conventions.md) |
| Why a decision was made | [`adr/`](./adr/README.md) |
| How a journey works end to end | [`flows/`](./flows/README.md) |
| Sanity content modeling and delivery | [`sanity/README.md`](./sanity/README.md) |
| How the AI configuration works | [`ai-workflow.md`](./ai-workflow.md) |
| Which reviewers a change needs | [`.github/agents/orchestrator.md`](../.github/agents/orchestrator.md) |
| The mandatory workflow for every change | [`.github/rules/validation-gate.md`](../.github/rules/validation-gate.md) |
