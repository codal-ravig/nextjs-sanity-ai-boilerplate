# Content Lifecycle

```text
Draft -> Review (human process) -> Published -> Live (after revalidation) -> Unpublished / Deleted
```

| State | Meaning |
| --- | --- |
| Draft | A `drafts.<id>` document with unpublished changes. Visible only through Draft Mode and Presentation. |
| Review | Not a Sanity state by default. A team convention until you adopt a Sanity workflow feature. |
| Published | Editor clicks Publish. The webhook fires. |
| Live | Revalidation has run; the next request returns fresh content. Usually seconds. |
| Unpublished | The published perspective no longer returns it; consumers fall back. |
| Deleted | Permanent. Check for references first. |

## Rules

- Evaluate Sanity's own workflow and scheduled publishing features before building custom states.
- A missing document must never break a page. Every consumer has a defined fallback.
- Do not add expiry or scheduling fields without a requirement and a job to act on them.
