#!/usr/bin/env node
/**
 * Enforces the Jira "Smart Commit" subject-line convention on every commit:
 *
 *   [<type>: ]<TICKET-KEY>[, <TICKET-KEY>...] [#time <duration>] <summary>
 *
 * The "<type>: " prefix is optional - a commit may start directly with its
 * ticket key. `conventionalTypes` only constrains which words are accepted
 * *if* a commit chooses to include one.
 *
 * Invoked by .husky/commit-msg as:
 *   node scripts/validate-commit-msg.js "$1"
 * where $1 is the path git gives the commit-msg hook to the commit message
 * file (COMMIT_EDITMSG).
 *
 * No external dependencies - only Node's built-in `fs`/`path`, so this runs
 * before `pnpm install` would even matter and can't be broken by a
 * dependency bump.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DEFAULT_CONFIG = {
  // Any Jira-style key: an uppercase project prefix (2-10 chars total,
  // starting with a letter) followed by "-" and a numeric issue number.
  // Deliberately not scoped to one project prefix (e.g. "PROJ") so the same
  // hook works for every project key this repo's commits ever reference.
  ticketKeyPattern: "[A-Z][A-Z0-9]{1,9}-\\d+",
  // Optional: governs which words are accepted before a "<type>: " prefix,
  // if a commit includes one at all. Omit this key (or set it to `[]`) in
  // .commit-rules.json to accept every commit without requiring or
  // recognizing a type prefix - the ticket key alone is enough.
  conventionalTypes: [
    "feat",
    "fix",
    "hotfix",
    "chore",
    "docs",
    "refactor",
    "test",
    "perf",
    "style",
    "ci",
    "build",
  ],
  requireTime: false,
};

// Commits matching any of these skip validation entirely - git and other
// tooling generate these subject lines verbatim, and they were never meant
// to carry a ticket reference.
//
// The Dependabot pattern below is deliberately shaped to match only its
// subject forms - not a bare `/^Bump /`, which would let a human dodge the
// ticket-key/summary requirements with any "Bump ..." message:
//   - individual update:      "Bump <dep> from <old> to <new>[ in <dir>]"
//   - grouped update:         "Bump the <group> group[ across N directories]
//                               with <N> update(s)[ in <dir>]"
//   - several deps, one PR:   "Bump <dep>[, <dep>...] and <dep>[ in <dir>]"
// Dependency names, versions and group names are single tokens, and <dir> is
// a path starting with "/", so prose such as "Bump x and fix y from 1 to 2"
// or "Bump x from 1 to 2 in order to fix y" does not match.
// Dependabot also prepends a Conventional-Commits type it infers from this
// repo's recent history ("Chore(deps): ", "Build(deps-dev): ", and once
// lowercase "build(deps): bump ..."), and re-infers it on every run. So the
// prefix is optional and the match ignores case. There is deliberately no
// Jira ticket behind an automated dependency-update PR.
const EXEMPT_PATTERNS = [
  /^Merge /,
  /^Revert /,
  /^Initial commit$/,
  /^wip$/i,
  /^(?:(?:build|chore)\(deps(?:-dev)?\): )?Bump (?:\S+ from \S+ to \S+|the \S+ group(?: across \d+ director(?:y|ies))? with \d+ updates?|\S+(?:, \S+)* and \S+)(?: in \/\S*)?$/i,
];

const MIN_SUMMARY_LENGTH = 10;

function loadConfig() {
  const configPath = path.join(process.cwd(), ".commit-rules.json");
  let overrides = {};
  if (fs.existsSync(configPath)) {
    try {
      overrides = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (err) {
      throw new Error(
        `commit-msg: could not parse ${configPath} (${err.message}); refusing to continue.`,
      );
    }
  }
  return { ...DEFAULT_CONFIG, ...overrides };
}

/**
 * Directories a commit-msg file is allowed to live under: the repo root
 * itself, plus git's own git-dir for the current checkout. The latter is
 * required for a git worktree - COMMIT_EDITMSG for a worktree lives under
 * the MAIN repository's `.git/worktrees/<name>/`, never under the
 * worktree's own working directory, so `process.cwd()` alone rejects every
 * commit made from a worktree (confirmed live: `git rev-parse --git-dir`
 * from inside a worktree returns exactly that path). Falls back to just the
 * repo root if `git rev-parse` itself fails for some reason, rather than
 * letting an unrelated git error crash the whole hook.
 */
function allowedRoots() {
  const roots = [path.resolve(process.cwd())];
  try {
    const gitDir = execFileSync("git", ["rev-parse", "--git-dir"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    if (gitDir) roots.push(path.resolve(process.cwd(), gitDir));
  } catch {
    // Best-effort - fall through with just the repo root above.
  }
  return roots;
}

/**
 * Reads the commit message file and returns the first real (non-comment,
 * non-blank) line - the subject line git itself uses.
 */
function readSubjectLine(commitMsgFile) {
  const resolvedPath = path.resolve(commitMsgFile);
  const isInsideAnAllowedRoot = allowedRoots().some(
    (root) =>
      resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`),
  );
  if (!isInsideAnAllowedRoot) {
    throw new Error(
      `commit-msg: commit message path must be inside the repository: ${commitMsgFile}`,
    );
  }

  const raw = fs.readFileSync(resolvedPath, "utf8");
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    return trimmed;
  }
  return "";
}

function isExempt(subject) {
  return EXEMPT_PATTERNS.some((pattern) => pattern.test(subject));
}

/**
 * Builds the subject-line regex from config. Uses named capture groups
 * (`type`, `tickets`, `time`, `summary`) rather than positional ones
 * deliberately: the "<type>: " prefix's capturing group is present only
 * when `conventionalTypes` is non-empty, which would otherwise shift every
 * later positional group index depending on config - a silent, config-
 * dependent bug. Named groups stay stable regardless of which optional
 * pieces of the pattern exist.
 *
 * The "<type>: " prefix is optional: `conventionalTypes` only constrains
 * *which* types are accepted when a commit chooses to include one (e.g. a
 * team that doesn't do Conventional-Commit-style typing can leave
 * `conventionalTypes` out of `.commit-rules.json`, or a commit can just
 * start straight from its ticket key: "PROJ-1234 Fix the navigation focus order").
 */
function buildSubjectRegex(config) {
  const types = config.conventionalTypes ?? [];
  const typeAlternation = types
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  // No configured types at all -> there is nothing valid to match before a
  // colon, so the "<type>: " prefix is dropped from the pattern entirely
  // rather than emitting an always-empty alternation.
  const typePrefix =
    typeAlternation.length > 0 ? `(?:(?<type>${typeAlternation}): )?` : "";
  const ticketKey = config.ticketKeyPattern;
  const ticketList = `(?<tickets>${ticketKey}(?:,\\s*${ticketKey})*)`;
  // A single token duration, e.g. "1h", "30m", "2d" - Jira's #time accepts
  // compound values like "1d 4h" too, but a single token keeps the regex
  // unambiguous about where the duration ends and the summary begins.
  const duration = "(?<time>[0-9]+[a-zA-Z]+)";
  // Summary min-length is a loose 5-char floor here so a badly-formed
  // subject line fails on *shape* first; validateSubject() applies the
  // real MIN_SUMMARY_LENGTH afterwards with its own dedicated message.
  return new RegExp(
    `^${typePrefix}${ticketList}(?: #time ${duration})? (?<summary>.{5,})$`,
  );
}

/**
 * Validates a subject line against config.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
function validateSubject(subject, config) {
  const regex = buildSubjectRegex(config);
  const match = subject.match(regex);

  if (!match) {
    return { ok: false, reason: "format" };
  }

  const { time, summary } = match.groups;

  if (config.requireTime && !time) {
    return { ok: false, reason: "missing-time" };
  }

  if (summary.trim().length < MIN_SUMMARY_LENGTH) {
    return { ok: false, reason: "short-summary", summary };
  }

  return { ok: true };
}

function printFormatError(subject, config) {
  const types = config.conventionalTypes ?? [];
  const validTypesBlock =
    types.length > 0
      ? `
  Valid types (optional prefix):
    ${types.join(", ")}
`
      : "";
  console.error(`
Commit message does not follow the required Smart Commit format.

  Received:
    "${subject}"

  Required format:
    [<type>: ]<TICKET-KEY>[, <TICKET-KEY>...] [#time <duration>] <summary>

  The "<type>: " prefix is optional - a commit can start directly with its
  ticket key.
${validTypesBlock}
  Examples:
    fix: PROJ-1234 #time 1h Fix the navigation focus order
    PROJ-1234 Fix the navigation focus order

  Exempt (skip validation): commit subjects starting with "Merge " or
  "Revert "; exactly "Initial commit" or "wip" (any case); or a Dependabot
  update subject, optionally prefixed "Chore(deps): " / "Build(deps-dev): "
  ("Bump <dep> from X to Y[ in <dir>]", "Bump the <group> group[ across N
  directories] with N update(s)[ in <dir>]", or "Bump <dep> and <dep>").
`);
}

function printMissingTimeError(subject) {
  console.error(`
Commit message is missing a required #time entry.

  Received:
    "${subject}"

  This repo's .commit-rules.json sets "requireTime": true, so every commit
  must include a Jira time-tracking entry, e.g.:

    fix: PROJ-1234 #time 1h Fix the navigation focus order
`);
}

function printShortSummaryError(subject, summary) {
  console.error(`
Commit summary is too short.

  Received:
    "${subject}"

  Summary text:
    "${summary.trim()}" (${summary.trim().length} characters)

  The summary must be at least ${MIN_SUMMARY_LENGTH} characters so it
  actually describes the change, e.g.:

    fix: PROJ-1234 Fix the navigation focus order on partial refunds
`);
}

function main() {
  const commitMsgFile = process.argv[2];
  if (!commitMsgFile) {
    console.error(
      "commit-msg: no commit message file path provided (expected $1 from git).",
    );
    process.exit(1);
  }

  const config = loadConfig();
  const subject = readSubjectLine(commitMsgFile);

  if (isExempt(subject)) {
    process.exit(0);
  }

  const result = validateSubject(subject, config);
  if (result.ok) {
    process.exit(0);
  }

  switch (result.reason) {
    case "missing-time":
      printMissingTimeError(subject);
      break;
    case "short-summary":
      printShortSummaryError(subject, result.summary);
      break;
    case "format":
    default:
      printFormatError(subject, config);
      break;
  }
  process.exit(1);
}

// Allow this module to be `require()`d by tests without running main().
if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_CONFIG,
  EXEMPT_PATTERNS,
  MIN_SUMMARY_LENGTH,
  loadConfig,
  readSubjectLine,
  isExempt,
  buildSubjectRegex,
  validateSubject,
};
