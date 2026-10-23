#!/usr/bin/env node
/**
 * SessionStart hook. Puts an index of this repository's flow docs and specs
 * into context once, at the start, so an assistant knows what exists before
 * it decides it needs anything.
 *
 * Deliberately an index and not the contents. Naming what exists and where
 * costs a few dozen lines per session; injecting the documents themselves
 * would cost thousands and crowd out the work. The PreToolUse hook
 * (ai-context-for-path.js) pulls the specifics for whatever is being edited.
 *
 * Fails silent: a session must start even if this does not.
 */

const fs = require("fs");
const path = require("path");
const { AREAS, ALWAYS } = require("./lib/ai-context-map.js");

const REPO_ROOT = path.resolve(__dirname, "..");

function count(dir, filter) {
  try {
    return fs.readdirSync(path.join(REPO_ROOT, dir)).filter(filter).length;
  } catch {
    return 0;
  }
}

function build() {
  const specCount = count(
    ".ai/specs",
    (f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("_"),
  );
  const flowCount = count(
    "docs/flows",
    (f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("_"),
  );

  const lines = [];
  lines.push(
    "## This repository documents its own behaviour, and expects that documentation to stay true",
  );
  lines.push("");
  lines.push(
    `\`docs/flows/\` holds ${flowCount} flow documents describing how each area works. \`.ai/specs/\` holds ${specCount} specs: some state intended behaviour for work still to do, and others are retrospective, recording the invariants shipped code already holds so a later change does not quietly undo one.`,
  );
  lines.push("");
  lines.push(
    "Before changing an area, read its documents. Before finishing, update them if the change made them untrue.",
  );
  lines.push("");
  lines.push("| Area | Docs | Flow docs | Specs |");
  lines.push("| --- | --- | --- | --- |");

  for (const area of AREAS) {
    const docs = area.docs && area.docs.length ? area.docs.join(", ") : "-";
    const flows = area.flows.length
      ? area.flows.map((f) => f.replace(/\.md$/, "")).join(", ")
      : "-";
    const specs = area.specs.length
      ? area.specs.map((s) => s.replace(/\.md$/, "")).join(", ")
      : "-";
    lines.push(`| ${area.label} | ${docs} | ${flows} | ${specs} |`);
  }

  lines.push("");
  lines.push("Two things to know before trusting either set:");
  lines.push("");
  lines.push(
    "- Every spec opens with a `> **Status (date):**` header stating what is actually built. Read it first; a spec is a claim about the day it was written.",
  );
  lines.push(
    `- \`${ALWAYS.gate}\` lists the blocking conditions for every change. Some of them are enforced by nothing but a reviewer noticing.`,
  );
  lines.push("");
  lines.push(
    `Start at \`${ALWAYS.architecture}\` for layering and source-of-truth ownership, and \`${ALWAYS.workflow}\` for how this AI configuration is used.`,
  );

  return lines.join("\n");
}

try {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: build(),
      },
    }),
  );
} catch {
  // A session must start even if the index does not.
}
