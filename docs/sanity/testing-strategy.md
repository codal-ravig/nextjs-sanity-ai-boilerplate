# Testing Strategy

## Automated

| Level | Covers |
| --- | --- |
| Unit | Query helpers, resolvers (unknown type renders nothing), link and image helpers, SEO resolution, webhook signature and allowlist logic |
| Component | Portable Text rendering, block components with empty or missing fields |
| Type | Generated types match the schema; TypeGen drift check fails CI on a stale file |
| Schema | `sanity schema validate` in CI |
| E2E | Critical pages render with content, Draft Mode requires authentication |

## Manual checks on a deployed environment

- Publish a document and confirm the page updates within seconds.
- Unpublish and confirm the fallback.
- Open Presentation and confirm click-to-edit works.
- Send a webhook with a bad signature and confirm rejection.

## Rules

- Mock the Sanity client at the fetch boundary, not inside components.
- A change that touches revalidation tests tag selection and allowlist behavior.
- Record known gaps here instead of leaving them implicit.
