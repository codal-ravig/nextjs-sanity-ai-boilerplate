/**
 * Maps a source path to the documents that describe it.
 *
 * One source of truth for three consumers: the PreToolUse hook
 * (scripts/ai-context-for-path.js), the SessionStart index
 * (scripts/ai-context-index.js), and the flow-context skill.
 *
 * Matching is prefix-based on the repo-relative path, deliberately not glob:
 * a prefix is readable, cheap, and cannot silently stop matching the way a
 * glob can when a config file is renamed.
 *
 * When a new area is added, add it here rather than in a consumer.
 *
 * Each area can point at three kinds of document:
 *   - docs:  any repo-relative path (architecture notes, Sanity docs, ADRs)
 *   - flows: file names under docs/flows/ (how a user journey works)
 *   - specs: file names under .ai/specs/ (invariants and open gaps)
 * Only list files that exist. A pointer to a missing file is worse than none.
 */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   prefixes: string[],
 *   docs?: string[],
 *   flows: string[],
 *   specs: string[],
 *   watchFor?: string
 * }} Area
 */

/** @type {Area[]} */
const AREAS = [
  {
    id: "app-routes",
    label: "App routes and pages",
    prefixes: ["src/app/"],
    docs: ["docs/architecture.md"],
    flows: [],
    specs: [],
    watchFor:
      "Routes compose services and render. They do not call external APIs directly, and they decide their caching strategy explicitly.",
  },
  {
    id: "api-routes",
    label: "API route handlers and webhooks",
    prefixes: ["src/app/api/"],
    docs: ["docs/architecture.md"],
    flows: [],
    specs: ["cache-revalidation-and-personalization-isolation.md"],
    watchFor:
      "Authenticate before acting, verify webhook signatures with a constant-time comparison, and treat any resource ID in a request body as a claim to verify, not a fact.",
  },
  {
    id: "components",
    label: "Components and UI",
    prefixes: ["src/components/"],
    docs: ["docs/architecture.md", "docs/naming-conventions.md"],
    flows: [],
    specs: [],
    watchFor:
      "Server Component by default. Keep client boundaries small, never fetch from an external API inside a component, and meet WCAG 2.1 AA.",
  },
  {
    id: "domain",
    label: "Domain rules",
    prefixes: ["src/domain/"],
    docs: ["docs/architecture.md"],
    flows: [],
    specs: [],
    watchFor:
      "Domain code is pure business rules: no React, no vendor client, no network.",
  },
  {
    id: "services",
    label: "Services (external system adapters)",
    prefixes: ["src/services/"],
    docs: ["docs/architecture.md"],
    flows: [],
    specs: ["feature-flags.md"],
    watchFor:
      "Services map upstream responses into the project's own types. Never blindly retry a call that changes state: a timeout means unknown, not failed.",
  },
  {
    id: "lib",
    label: "Libraries, clients and transport",
    prefixes: ["src/lib/"],
    docs: ["docs/architecture.md"],
    flows: [],
    specs: ["cache-revalidation-and-personalization-isolation.md"],
    watchFor:
      "lib/ holds transport, vendor clients and config. It imports nothing from the layers above it. Personalized data must never share a cache key across users.",
  },
  {
    id: "sanity",
    label: "Sanity content, schema and visual editing",
    prefixes: [
      "sanity/",
      "sanity.config.",
      "src/lib/sanity/",
      "src/services/content/",
      "src/components/portable-text/",
      "src/components/page-builder/",
    ],
    docs: [
      "docs/sanity/README.md",
      "docs/sanity/content-model.md",
      "docs/sanity/caching-and-revalidation.md",
      "docs/adr/sanity/README.md",
    ],
    flows: [],
    specs: ["content-and-visual-editing.md"],
    watchFor:
      "Regenerate TypeGen after any schema or query change. Draft Mode is an authenticated bypass of published content, so its token check is a security boundary. Image alt text is required.",
  },
  {
    id: "cache",
    label: "Caching and per-user isolation",
    prefixes: ["src/lib/cache/", "src/app/api/revalidate/"],
    docs: ["docs/adr/0003-caching-and-personalization.md"],
    flows: [],
    specs: ["cache-revalidation-and-personalization-isolation.md"],
    watchFor:
      "A personalized response that shares a cache key with another user is a data disclosure, not a caching bug.",
  },
  {
    id: "flags",
    label: "Feature flags",
    prefixes: ["src/lib/feature-flags/"],
    docs: [],
    flows: [],
    specs: ["feature-flags.md"],
    watchFor:
      "A flag must never be the only thing enforcing a security property.",
  },
  {
    id: "ai-config",
    label: "AI configuration",
    prefixes: [
      ".github/instructions/",
      ".github/agents/",
      ".github/rules/",
      ".github/prompts/",
      ".github/copilot-instructions.md",
      ".agents/",
      ".claude/",
      ".cursor/",
      ".ai/",
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
    ],
    docs: [
      "docs/ai-workflow.md",
      "docs/adr/0004-ai-configuration-architecture.md",
    ],
    flows: [],
    specs: [],
    watchFor:
      "Changing an instruction file's applyTo means changing its paths too. Run scripts/check-claude-config.js (or audit:architecture) afterwards.",
  },
  {
    id: "ci",
    label: "CI, hooks and repository workflow",
    prefixes: [".github/workflows/", ".husky/", "scripts/"],
    docs: ["docs/repository-workflow.md"],
    flows: [],
    specs: [],
    watchFor:
      "Hooks that inject context must never block and must fail silent. Pre-commit and CI should run the same checks.",
  },
  {
    id: "tests",
    label: "Tests and end-to-end journeys",
    prefixes: ["e2e/", "tests/", "src/__tests__/"],
    docs: [".github/rules/testing-rules.md"],
    flows: [],
    specs: [],
    watchFor:
      "Cover the failure scenarios, not only the happy path. A bug fix needs a regression test.",
  },

  // ADD YOUR AREAS HERE. Example for a checkout area:
  //
  // {
  //   id: "checkout",
  //   label: "Checkout",
  //   prefixes: ["src/app/api/checkout/", "src/components/checkout/"],
  //   docs: ["docs/architecture.md"],
  //   flows: ["checkout.md"],            // docs/flows/checkout.md
  //   specs: ["checkout-totals.md"],     // .ai/specs/checkout-totals.md
  //   watchFor: "One sentence on what has gone wrong here before.",
  // },
];

/** Applies to any source change, regardless of area. */
const ALWAYS = {
  architecture: "docs/architecture.md",
  gate: ".github/rules/validation-gate.md",
  workflow: "docs/ai-workflow.md",
};

/**
 * Resolve the areas a repo-relative path belongs to. A path can match more
 * than one, and all matches are returned rather than the first.
 *
 * @param {string} repoRelativePath
 * @returns {Area[]}
 */
function areasForPath(repoRelativePath) {
  if (!repoRelativePath) return [];
  const p = repoRelativePath.replace(/^\.\//, "");
  return AREAS.filter((area) =>
    area.prefixes.some((prefix) => p.startsWith(prefix)),
  );
}

module.exports = { AREAS, ALWAYS, areasForPath };
