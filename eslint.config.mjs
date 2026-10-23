// Reference ESLint flat config for a Next.js 16 + Sanity project.
//
// Layering (see .github/instructions/architecture.instructions.md):
//   app / components -> domain -> services -> lib -> external system
// A lower layer never imports a higher one. Each layer below gets one
// `no-restricted-imports` block, so a violation fails the build.
//
// Adapt the VENDOR_CLIENTS list to the vendor clients your project keeps in
// `src/lib/`. Add a vendor here and the boundary rules pick it up everywhere.

import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import jsdoc from "eslint-plugin-jsdoc";

/** Vendor client modules that only `services/` (and `lib/`) may import. */
const VENDOR_CLIENTS = ["@/lib/sanity/*", "@/lib/clients/*"];

/** Names that must never carry a NEXT_PUBLIC_ prefix, because it ships them to the browser. */
const SECRET_LIKE = "(SECRET|TOKEN|PRIVATE|PASSWORD|ADMIN|WEBHOOK)";

export default [
  // Generated code is not hand-edited, so lint rules do not apply to it.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "src/lib/sanity/sanity.types.ts",
    ],
  },

  ...nextConfig,
  prettierConfig,

  {
    rules: {
      "react/jsx-curly-brace-presence": "error",
      "react/no-unused-prop-types": "error",
      "react/no-array-index-key": "error",
      "@next/next/no-html-link-for-pages": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='useContext']",
          message:
            "Use React 19's `use(Context)` instead of `useContext(Context)`.",
        },
        // A NEXT_PUBLIC_ variable is inlined into the browser bundle. A name
        // that looks like a credential must be server-only.
        {
          selector: `MemberExpression[object.object.name='process'][object.property.name='env'][property.name=/^NEXT_PUBLIC_.*${SECRET_LIKE}/]`,
          message:
            "Never expose a secret-like value through a NEXT_PUBLIC_ variable. Keep credentials server-only.",
        },
        {
          selector: `Literal[value=/^NEXT_PUBLIC_.*${SECRET_LIKE}/]`,
          message:
            "Never expose a secret-like value through a NEXT_PUBLIC_ variable. Keep credentials server-only.",
        },
      ],
      "no-console": "off",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
    },
  },

  // TypeScript files use the TypeScript-aware unused-vars rule. The base rule
  // does not understand type-only constructs and reports false positives on
  // interface method signatures and declaration files.
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // ---- Project standards ------------------------------------------------
  //
  // Applied repo-wide under src/, so a new file cannot escape them by living
  // somewhere an enumerated list forgot.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // `any` is prohibited. An error, not a warning.
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      // Check dependency arrays on project effect wrappers too, so a custom
      // hook does not become a hole in the rule. Replace the hook name below.
      "react-hooks/exhaustive-deps": [
        "error",
        { additionalHooks: "(useDebouncedEffect)" },
      ],
      // React 19 needs no React in scope for JSX. Keep this explicit so a
      // preset upgrade cannot reintroduce the obsolete requirement.
      "react/react-in-jsx-scope": "off",
      // Content images must use next/image.
      "@next/next/no-img-element": "error",
      // WCAG 2.1: eslint-config-next enables only a few jsx-a11y rules, at
      // "warn". The plugin's recommended set restores the rest at error
      // severity. Contrast, focus order and meaningful alt text remain review
      // judgment calls (see ui.instructions.md).
      ...jsxA11y.flatConfigs.recommended.rules,
      // Keep Next's next/image-aware option: the generic recommended rule only
      // knows a raw <img>, not the <Image> component this project requires.
      "jsx-a11y/alt-text": ["error", { elements: ["img"], img: ["Image"] }],
      // Components that accept their own `autoFocus` prop and apply it via a
      // ref + effect are already the accessible pattern. Only flag the
      // attribute on an actual DOM element.
      "jsx-a11y/no-autofocus": ["error", { ignoreNonDOM: true }],
    },
  },

  // ---- Architectural boundaries (one block per layer) -------------------

  // 1. domain/: business rules. No UI, no request state, no vendor clients.
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components/*"],
              message:
                "Domain code must not depend on UI. Move the rule down, or pass the value in from the caller.",
            },
            {
              group: ["next/headers", "next/navigation"],
              message:
                "Domain code must not read request state. The caller reads cookies/headers and passes them in, which keeps a business rule callable from a job or a test.",
            },
            {
              group: VENDOR_CLIENTS,
              message:
                "Domain code depends on the service boundary, never on a vendor client directly. Fetch in services/ and pass the data in.",
            },
          ],
        },
      ],
    },
  },

  // 2. services/: talk to external systems. No UI.
  {
    files: ["src/services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components/*"],
              message:
                "Services must not depend on UI. Return data; let the caller render it.",
            },
          ],
        },
      ],
    },
  },

  // 3. lib/: the lowest layer. No upward dependencies.
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/*",
                "@/components/*",
                "@/domain/*",
                "@/services/*",
              ],
              message:
                "lib/ is the lowest layer. If it needs a higher layer, it belongs in that layer instead.",
            },
          ],
        },
      ],
    },
  },

  // 4. components/: render props. Never reach an external system themselves.
  //    Self-fetching Server Components live in `app/_server/`.
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [...VENDOR_CLIENTS, "@/services/*"],
              message:
                "Never call an external API from a component. Fetch in a Server Component or route handler via a service, and pass data down as props.",
            },
          ],
        },
      ],
    },
  },

  // 5. app/: composes services. Does not call an external system itself.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/_server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/sanity/client", "@/lib/clients/request"],
              message:
                "Route handlers and pages compose services; they do not call an external system directly. Add or extend a function in services/ and call that.",
            },
          ],
        },
      ],
    },
  },

  // ---- Logging boundary --------------------------------------------------
  //
  // `no-console` routes callers to the shared logger. The logger itself and
  // browser-only modules are the destination, so the rule cannot apply there.
  // Scoped in config rather than suppressed inline, so the exemption is
  // visible in one place.
  {
    files: [
      "src/lib/observability/logger.ts",
      "src/lib/observability/client-debug.ts",
    ],
    rules: { "no-console": "off" },
  },

  {
    // Client components render in the browser and cannot import a
    // `server-only` logger. `warn`/`error` stay available there; `log` does
    // not, so debug logging cannot ship to production.
    files: [
      "src/components/**/*.tsx",
      "src/app/**/*.tsx",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: { "no-console": ["error", { allow: ["warn", "error"] }] },
  },

  // ---- TSDoc docblock requirement ----------------------------------------
  //
  // Every exported symbol in src/ gets a TSDoc block: one-line summary, how it
  // fails, @param/@returns only when non-obvious. "typescript" mode flags
  // {Type} braces in tags, because TypeScript holds the types.
  // See documentation.instructions.md for the full prose rule.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.{test,spec}.{ts,tsx}"],
    plugins: { jsdoc },
    settings: {
      jsdoc: { mode: "typescript" },
    },
    rules: {
      "jsdoc/no-types": "error",
    },
  },
  {
    // Require a docblock on exported functions under src/app/. Widen `files`
    // to the rest of src/ as each area is brought into compliance.
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/**/*.{test,spec}.{ts,tsx}"],
    plugins: { jsdoc },
    settings: {
      jsdoc: { mode: "typescript" },
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: [
            "ExportDefaultDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
            "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > FunctionExpression",
          ],
          checkGetters: false,
          checkSetters: false,
          checkConstructors: false,
        },
      ],
    },
  },

  // Tests may reach across layers to set up fixtures.
  {
    files: ["src/**/*.{test,spec}.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
      "no-console": "off",
    },
  },
];
