# 0003. Singletons use Studio's singleton support

**Status:** Accepted

## Context

Site-wide documents (`siteSettings`, `navigation`) must exist exactly once. Hand-rolled guards (a fixed Structure entry, filtered "new document" options, stripped actions) work but spread across several config sites.

## Decision

- Keep one list of singleton type names (`SINGLETONS`) and use it everywhere.
- Register them with Studio's first-class singleton support where the installed Studio version provides it. Check the current Studio docs and your installed version before relying on it.
- Place them explicitly in the Structure so editors open the document directly.
- Where the platform does not remove Delete, strip it with `document.actions`.
- Use the type name as the document ID (`_id == "siteSettings"`). Queries and the revalidation webhook rely on this.

## Consequences

- Adding a singleton is two edits: the list and the Structure.
- This is an editorial guard, not access control. Use dataset roles for real restrictions.

## Related

[0001](./0001-entity-first-content-modeling.md)
