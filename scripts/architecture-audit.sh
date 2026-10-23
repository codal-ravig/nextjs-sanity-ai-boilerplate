#!/usr/bin/env bash
#
# Architecture drift audit.
#
# ESLint enforces where code lives (import boundaries). This script checks the
# invariants a linter does not express: patterns that compile, lint clean, and
# are still wrong. Every check skips gracefully when its directory does not
# exist yet, so it is safe to run in an empty template.
#
# Add a check when a pattern is found live in your codebase, with a one line
# reason. Keep them cheap: this runs in pre-commit and CI.
#
# Exit 0 = clean. Exit 1 = at least one finding.

set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
SRC=src

report() { # name, count, explanation
  if [ "$2" -gt 0 ]; then
    printf '  FAIL  %-44s %s found\n' "$1" "$2"
    printf '        %s\n' "$3"
    fail=1
  else
    printf '  ok    %-44s\n' "$1"
  fi
}

skip() { # name, reason
  printf '  skip  %-44s %s\n' "$1" "$2"
}

# Count grep matches under the given directories that exist. Prints 0 if none do.
count_in() { # pattern, dirs...
  local pattern="$1"; shift
  local dirs=() d
  for d in "$@"; do [ -d "$d" ] && dirs+=("$d"); done
  [ "${#dirs[@]}" -eq 0 ] && { echo 0; return; }
  grep -rnE "$pattern" "${dirs[@]}" --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' '
}

echo "Architecture audit"
echo

# --- Layering ------------------------------------------------------------
# app -> components -> domain -> services -> lib -> external system.
# A layer may import only from layers to its right. ESLint boundary rules are
# the primary enforcement; this is a cheap backstop that survives a lint
# misconfiguration.
if [ -d "$SRC" ]; then
  n=$(count_in "from ['\"]@/(app|components)/" "$SRC/lib" "$SRC/services" "$SRC/domain")
  report "lib, services, domain do not import UI" "$n" \
    "Lower layers must not import from app/ or components/."

  n=$(count_in "from ['\"]@/(services|app|components)/" "$SRC/lib")
  report "lib does not import services" "$n" \
    "lib/ is the bottom layer. It imports nothing from services/, app/ or components/."

  n=$(count_in "from ['\"]@/(services|lib)/|from ['\"]react['\"]" "$SRC/domain")
  report "domain is pure (no services, lib, React)" "$n" \
    "domain/ holds business rules with no vendor client, network or React."

  n=$(count_in "from ['\"]@/services/" "$SRC/components")
  report "components do not call services directly" "$n" \
    "Components receive data from server code or hooks. Put the call in app/ or a Server Component."
else
  skip "layering checks" "no $SRC/ directory yet"
fi

# --- Secrets -------------------------------------------------------------
n=$(count_in '===\s*`Bearer|[!=]==\s*process\.env\.[A-Z_]*(SECRET|TOKEN)' "$SRC")
report "constant-time secret comparison" "$n" \
  "Use a constant-time compare (crypto.timingSafeEqual); === leaks the secret via timing."

# Any NEXT_PUBLIC_ name that looks credential-shaped, minus the ones that are
# public by design. An explicit allowlist means a NEW credential-shaped variable
# fails this check and has to be justified here. Add names to PUBLIC_OK only
# with a comment saying why the value is safe in a browser.
PUBLIC_OK='NEXT_PUBLIC_(SANITY_PROJECT_ID|SANITY_DATASET)'
if [ -d "$SRC" ]; then
  n=$(grep -rhoE 'NEXT_PUBLIC_[A-Z0-9_]+' "$SRC" 2>/dev/null | sort -u \
        | grep -iE 'secret|password|private|_key|token|credential' \
        | grep -vxE "$PUBLIC_OK" \
        | wc -l | tr -d ' ')
else
  n=0
fi
report "no privileged credential is NEXT_PUBLIC_" "$n" \
  "A NEXT_PUBLIC_ prefix ships the value to the browser. If genuinely public, add it to PUBLIC_OK in this script with a reason."

# --- Server/client boundary ---------------------------------------------
n=0
if [ -d "$SRC" ]; then
  for f in $(grep -rl '^"use server"' "$SRC" --include='*.tsx' 2>/dev/null); do
    grep -q 'return (' "$f" && n=$((n+1))
  done
fi
report "no \"use server\" on a JSX component" "$n" \
  "That marks the module as a Server Actions endpoint, not a component."

# --- Markup and types ----------------------------------------------------
n=$(count_in '<img[ >]' "$SRC")
report "no raw <img>" "$n" \
  "Use next/image, or the Sanity image helper, so images are sized and optimized."

n=$(count_in ':\s*any\b|\bas any\b|<any>' "$SRC")
report "no any" "$n" \
  "any is prohibited. Use unknown and narrow, or a real type."

# --- Suppressions --------------------------------------------------------
n=$(count_in 'eslint-disable' "$SRC")
report "no eslint-disable" "$n" \
  "Fix the cause; the rules are the architecture."

n=$(count_in '@ts-ignore|@ts-expect-error' "$SRC")
report "no @ts-ignore / @ts-expect-error" "$n" \
  "Narrow the type instead of silencing the checker."

# --- Repository hygiene --------------------------------------------------
# Real .env files must never be committed. Examples and templates are fine.
n=0
if git rev-parse --git-dir >/dev/null 2>&1; then
  n=$(git ls-files 2>/dev/null | grep -E '(^|/)\.env(\.[A-Za-z0-9_-]+)?$' \
        | grep -vE '\.(example|sample|template)$' | wc -l | tr -d ' ')
fi
report "no .env file is committed" "$n" \
  "Commit .env.example only. Rotate any secret that was ever committed."

# --- AI configuration ----------------------------------------------------
# Claude Code reads .github/instructions and .github/agents through symlinks
# in .claude/. A broken link, or `paths` drifting from `applyTo`, means the
# two assistants work to different rules.
#
# Skipped on Windows: Git for Windows checks symlinks out as plain text files
# unless core.symlinks and Developer Mode are both on, so the check fails on a
# correct tree. WSL counts too, because `bash` run from cmd or PowerShell is
# often WSL's, working on that same Windows checkout. CI runs on Linux and
# still enforces it.
is_windows() {
  case "$(uname -s)" in
    MINGW* | MSYS* | CYGWIN*) return 0 ;;
  esac
  grep -qi microsoft /proc/version 2>/dev/null
}

if [ ! -f scripts/check-claude-config.js ]; then
  skip "Claude config matches .github/" "scripts/check-claude-config.js not found"
elif is_windows; then
  skip "Claude config matches .github/" "not checked on Windows; CI checks it"
else
  drift=$(node scripts/check-claude-config.js 2>&1); rc=$?
  n=$(printf '%s' "$drift" | grep -c .)
  [ "$rc" -ne 0 ] && [ "$n" -eq 0 ] && n=1
  report "Claude config matches .github/" "$n" \
    "Keep .claude/rules and .claude/agents symlinked to .github/, and each instruction file's paths equal to its applyTo."
  [ "$n" -gt 0 ] && printf '%s\n' "$drift" | sed 's/^/        /'
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "Clean: no architecture drift detected."
else
  echo "Drift detected. Each finding above is a pattern that compiles but violates docs/architecture.md."
fi
exit "$fail"
