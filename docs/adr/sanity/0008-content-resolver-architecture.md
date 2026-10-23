# 0008. Render content through an explicit, typed `_type` map

**Status:** Accepted

## Context

Page builder arrays contain blocks of many `_type`s. A dynamic lookup (importing a component by a string from the CMS) lets content choose which code runs.

## Decision

- One closed map keyed on the generated block type: `Record<PageBuilderBlock["_type"], ComponentType>`.
- A new block type fails type-checking until it has an entry, so schema and renderer cannot drift.
- Unknown `_type` renders `null` and is logged; it never throws and never executes content-supplied names.
- Blocks needing request-time data are supplied by the route through a second typed `renderers` map. The base map holds a `() => null` placeholder for them.
- Adding a block needs four edits: the schema object, its registration, its resolver entry, and (if needed) a route renderer.

## Consequences

- CMS content cannot select arbitrary code.
- Resolver changes are confined to two files.
