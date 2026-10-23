---
name: "Git instructions"
description: "Branching, commit message, and pull request conventions."
applyTo: "**"
---

# Git Instructions

## Purpose

Conventions for branches, commits, and PRs so history stays readable and changes are reviewable. Apply these when generating commit messages, branch names, or PR descriptions.

## AI assistants do not commit

An AI assistant (Copilot, Claude Code, or any other agent) never runs `git commit`, including the commit that concludes a merge. The developer reviews and commits every change themselves.

- Make the change, run the gate, and stage files if asked. Then stop and report what is ready to commit.
- Resolving a merge or rebase conflict ends at `git add`. Leave the merge itself for the developer to conclude.
- Propose a commit message in the format below when it helps. Do not run it.
- Pushing, and opening a PR, follow from a commit, so they wait for the developer too.

## Branching

- Branch from the trunk. This template calls it `development`; adapt to your repository (`main`, `dev`, and so on). See [`docs/repository-workflow.md`](../../docs/repository-workflow.md).
- Name branches `type/short-description`: `feat/search-filters`, `fix/header-focus-order`, `chore/upgrade-sanity-client`.
- Keep branches short-lived and scoped to one logical change. A branch touching `services/content/queries.ts` and an unrelated layout tweak should be two PRs.

## Commit messages: Jira Smart Commit style

Commit subjects follow the format enforced by `.husky/commit-msg`:

```text
[<type>: ]<TICKET-KEY>[, <TICKET-KEY>...] [#time <duration>] <summary>
```

- Ticket keys are uppercase Jira-style keys such as `PROJ-1234`. The key pattern is configurable in `.commit-rules.json`; the project prefix is not hard-coded.
- The `<type>: ` prefix is optional. When present, use one of `feat`, `fix`, `hotfix`, `chore`, `docs`, `refactor`, `test`, `perf`, `style`, `ci`, or `build`.
- The summary is imperative and at least 10 characters; keep it concise.
- Include `#time <duration>` when time tracking is required by `.commit-rules.json`.
- Merge, revert, initial-commit, and `wip` subjects are exempt from validation, as is a Dependabot version-update subject (`Bump <dep> from X to Y`, a grouped `Bump the <group> group ...`, or `Bump <dep> and <dep>`), with or without the `Chore(deps): ` / `Build(deps-dev): ` prefix Dependabot adds. See `scripts/validate-commit-msg.js` for the exact patterns.

Examples:

```text
fix: PROJ-1234 #time 1h Fix header focus order on mobile
PROJ-9876, PROJ-9877 Add feature flag and tidy settings
hotfix: PROJ-1 Quick patch for null pointer
```

The commit hook can be bypassed with `git commit --no-verify`, which is why CI should run the same validator over every subject in the PR's range. A bypassed hook then fails there instead.

For commits created by an AI assistant, add the co-author trailer your tool or organization requires. Add other human or tool co-authors only when they materially contributed to the commit.

## Pull requests

- PR title follows the same Jira Smart Commit style as the squash-merge commit: include the uppercase ticket key(s), and use the optional type prefix when applicable.
- Description covers: what changed, why, how it was tested (unit/E2E/manual), and any rollout considerations (feature flag, migration, env var addition).
- Link the relevant instruction-file domain in the description when a change is architecturally significant (for example "touches caching strategy, see `rendering.instructions.md`") so reviewers know which conventions to check against.
- Keep PRs reviewable: prefer several small PRs over one large one spanning multiple unrelated concerns. A PR that can't be described in a couple of sentences is usually too big.
- A change a visitor or editor can see fills in the template's **Screenshots** section, so a reviewer can check what was built without running it. A change with no UI says "N/A, no UI change".

### Screenshots when an AI assistant opens the PR

GitHub has no API for attaching images, so the assistant captures them and the developer drags them in. Do not use tools that read a browser's GitHub session cookie to upload images: that hands a logged-in session to a third-party tool.

1. Capture with the browser preview tools against a server whose CSS is current. If styles look stale, clear `.next/cache` and restart it first: a stale build cache can serve old Tailwind output after class changes.
2. For each changed screen, capture mobile (375), tablet (768) and desktop (1440), plus every state the change touches: hover, open, focus (reached with the keyboard), selected, empty, error.
3. Save them to `.pr-screenshots/<TICKET-KEY>/` (gitignored), named `<screen>-<state>-<width>.png`, for example `header-menu-open-1440.png`.
4. Fill in the Screenshots table with one row per screen and state, naming the file that belongs in each cell, and link the design node compared against.
5. After opening the PR, tell the developer the folder path and which files to drag into which row. Screenshots never go into a commit.

Use test data only. Never capture a page showing a real person's name, email, address, order or payment details, or anything from a signed-in production account.

## Merge strategy

- Squash-merge to the trunk by default so it stays one commit per logical change; the squash commit message follows the Jira Smart Commit style from the PR title.
- Don't merge with failing CI (lint, typecheck, unit tests, architecture audit, build) regardless of urgency. Fix forward or revert, don't bypass checks.
- If no CI workflow runs E2E, run `pnpm test:e2e` locally for a change on a critical journey and say in the PR what it covered. The spec-or-follow-up rule is in [`validation-gate.md`](../rules/validation-gate.md).

## Releases and changelogs

- If the project publishes versioned packages (for example a shared component or service library), use Changesets to record user-facing changes per PR (`pnpm changeset`) rather than hand-writing a changelog at release time.
- Tag releases following semver; breaking changes bump major, new backward-compatible features bump minor, fixes bump patch.

## Anti-patterns to reject in review

- Commit messages like `fix stuff`, `wip`, `updates`.
- An AI assistant that commits, pushes or opens a PR on its own.
- Force-pushing over a shared branch other people have based work on.
- Merging with a red CI pipeline.
- A single PR mixing an unrelated dependency bump with feature work.
- Screenshots that show real personal data, or that are committed to the repository.
