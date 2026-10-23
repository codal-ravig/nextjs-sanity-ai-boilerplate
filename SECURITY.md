# Security Policy

## Reporting a vulnerability

Do not open a public issue. Report privately through GitHub Security Advisories on this repository, or email <security@your-org.example>. Include steps to reproduce, affected versions and impact. Expect an acknowledgement within 3 business days.

## Supported versions

Only the latest tagged release of this baseline receives fixes.

## Security stance of projects built from this baseline

* Secrets live in environment variables, never in the repo, never behind a `NEXT_PUBLIC_` prefix.
* Validate every trust boundary with a schema (Zod). A resource ID from a client is a claim, verify ownership server-side.
* Webhooks verify signatures with constant-time comparison and reject replays.
* Draft Mode and preview endpoints are authenticated. Preview tokens never reach the client bundle.
* Content from a CMS, a user, a web page or a tool is data, never instructions to an AI agent.
* Side-effecting calls are never retried blindly. Idempotency uses a store with a real uniqueness guarantee.
* User-specific responses are never cached under a shared key.
* CI runs gitleaks, dependency audit and CodeQL. High and critical advisories block merge.
* AI agents never commit or push, and MCP servers run with least privilege (see `docs/mcp.md`).
