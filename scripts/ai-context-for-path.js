#!/usr/bin/env node
/**
 * PreToolUse hook. Given the file an Edit or Write is about to touch, names
 * the flow docs and specs that describe that area, before the edit happens.
 *
 * Documentation tends to outlive the code it describes. The
 * docs-sync skill asks an assistant to go and read the matching doc, but an
 * assistant that does not reach for it never learns the doc exists. This hook
 * removes that choice: the pointer arrives whether or not anything asked.
 *
 * It injects context and never blocks. A gate that fires on every rename
 * teaches people to work around it faster than it teaches them the docs.
 *
 * For a Write that creates a new file it also names the scoped instruction
 * files (.claude/rules/ is a symlink to .github/instructions/): Claude Code
 * loads a path-scoped rule when it reads a matching file, and a file that
 * does not exist yet has never been read.
 *
 * Fails silent by design: a hook that errors must not stop someone editing.
 */

const fs = require("fs");
const path = require("path");
const { areasForPath, ALWAYS } = require("./lib/ai-context-map.js");

const REPO_ROOT = path.resolve(__dirname, "..");

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function toRepoRelative(filePath) {
  if (!filePath) return "";
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(REPO_ROOT, filePath);
  const rel = path.relative(REPO_ROOT, abs);
  // A path outside the repo (or a worktree's own copy) still resolves to the
  // same shape once the leading ../ segments are dropped.
  return rel.replace(/^(\.\.\/)+/, "");
}

function build(areas, rel, rules) {
  const lines = [];
  if (rules.length) {
    lines.push(
      `\`${rel}\` is a new file, so its path-scoped rules have not loaded. Read and follow them before writing it: ${rules.map((r) => `\`${r}\``).join(", ")}.`,
    );
  }
  if (areas.length === 0) return lines.join("\n");
  if (lines.length) lines.push("");

  lines.push(
    `Before editing \`${rel}\`, this area has documentation that is expected to stay in step with the code.`,
  );

  for (const area of areas) {
    lines.push("");
    lines.push(`**${area.label}**`);
    if (area.docs && area.docs.length) {
      lines.push(
        `- Read: ${area.docs.map((d) => `\`${d}\``).join(", ")}`,
      );
    }
    if (area.flows.length) {
      lines.push(
        `- How it works: ${area.flows.map((f) => `\`docs/flows/${f}\``).join(", ")}`,
      );
    }
    if (area.specs.length) {
      lines.push(
        `- Invariants and open gaps: ${area.specs.map((s) => `\`.ai/specs/${s}\``).join(", ")}`,
      );
    }
    if (area.watchFor) lines.push(`- Watch for: ${area.watchFor}`);
  }

  lines.push("");
  lines.push(
    `Read the spec's \`> **Status (date):**\` header before trusting it as current behaviour. If this change alters what those documents describe, update them in the same change; that is what the \`docs-sync\` skill is for.`,
  );
  lines.push(
    `Blocking conditions for every change are in \`${ALWAYS.gate}\`. Some are enforced by nothing but review.`,
  );

  return lines.join("\n");
}

function main() {
  let input;
  try {
    input = JSON.parse(readStdin() || "{}");
  } catch {
    return; // Malformed payload is not this hook's problem to report.
  }

  const filePath = input?.tool_input?.file_path;
  const rel = toRepoRelative(filePath);
  if (!rel) return;

  const areas = areasForPath(rel);
  const isNewFile =
    input?.tool_name === "Write" && !fs.existsSync(path.join(REPO_ROOT, rel));
  let rules = [];
  try {
    if (isNewFile)
      rules = require("./check-claude-config.js").rulesForPath(rel);
  } catch {
    // A missing or broken helper must not block the edit.
  }
  if (areas.length === 0 && rules.length === 0) return; // Silent for anything unmapped.

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        additionalContext: build(areas, rel, rules),
      },
    }),
  );
}

try {
  main();
} catch {
  // Never break an edit because a documentation reminder failed.
}
