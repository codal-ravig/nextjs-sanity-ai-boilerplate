#!/usr/bin/env node
/**
 * Claude Code reads the Copilot configuration through two symlinks:
 *
 *   .claude/rules  -> .github/instructions
 *   .claude/agents -> .github/agents
 *
 * Copilot scopes an instruction file with `applyTo`, Claude Code with `paths`,
 * so each scoped file carries both. Run directly, this checks the symlinks and
 * that every file's `paths` still equals its `applyTo`; architecture-audit.sh
 * runs it. The PreToolUse hook uses `rulesForPath`.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const INSTRUCTIONS = ".github/instructions";
const LINKS = {
  ".claude/rules": INSTRUCTIONS,
  ".claude/agents": ".github/agents",
};

function instructionFiles() {
  return fs
    .readdirSync(path.join(REPO_ROOT, INSTRUCTIONS))
    .filter((f) => f.endsWith(".instructions.md"))
    .sort()
    .map((f) => {
      const file = `${INSTRUCTIONS}/${f}`;
      const text = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
      const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
      const applyTo = (/^applyTo:\s*"([^"]*)"/m.exec(frontmatter)?.[1] ?? "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
      const block = /^paths:\n((?:\s+- .*\n?)*)/m.exec(frontmatter)?.[1] ?? "";
      const paths = [...block.matchAll(/- "([^"]*)"/g)].map((m) => m[1]);
      return { file, applyTo, paths };
    });
}

// `**` means everywhere, which in Claude Code is no `paths` at all. A Next.js
// segment such as `[orderId]` is a character class to a glob matcher, so `*`.
function expectedPaths(applyTo) {
  if (applyTo.includes("**")) return [];
  return applyTo.map((g) => g.replace(/\[[^\]/]+\]/g, "*"));
}

// Scoped instruction files whose `paths` match a repo-relative path.
function rulesForPath(rel) {
  if (typeof path.matchesGlob !== "function") return [];
  return instructionFiles()
    .filter((r) => r.paths.some((p) => path.matchesGlob(rel, p)))
    .map((r) => r.file);
}

function problems() {
  const found = [];
  for (const [link, target] of Object.entries(LINKS)) {
    let real = null;
    try {
      real = fs.realpathSync(path.join(REPO_ROOT, link));
    } catch {
      // Missing link: reported below.
    }
    if (real !== fs.realpathSync(path.join(REPO_ROOT, target))) {
      found.push(`${link} must be a symlink to ${target}`);
    }
  }
  for (const { file, applyTo, paths } of instructionFiles()) {
    const want = expectedPaths(applyTo);
    if (JSON.stringify(want) !== JSON.stringify(paths)) {
      found.push(
        `${file}: paths ${JSON.stringify(paths)} should be ${JSON.stringify(want)}`,
      );
    }
  }
  return found;
}

if (require.main === module) {
  const found = problems();
  if (found.length) process.stdout.write(`${found.join("\n")}\n`);
  process.exit(found.length ? 1 : 0);
}

module.exports = { rulesForPath };
