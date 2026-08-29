#!/bin/bash
# Fail loudly if this container's checkout is not the branch tip.
#
# READ THIS BEFORE TRUSTING THIS HOOK
# -----------------------------------
# This hook cannot fix the problem it was written for, and it is important that
# whoever finds it next knows that rather than assuming they are covered.
#
# Remote containers are provisioned from a cached image, and this project's
# image carries a checkout pinned at 8188a45 (2026-08-21). This hook was added
# afterwards, in 961fa35:
#
#   $ git cat-file -e 8188a45:.claude/hooks/session-start.sh
#   fatal: path '.claude/hooks/session-start.sh' exists on disk,
#          but not in '8188a45'
#
# So every re-provision restores a tree in which this file and its settings.json
# DO NOT EXIST. The guard is deleted by the exact event it is meant to catch, and
# no amount of care inside this file changes that. It has never fired on a stale
# checkout, because it cannot: by the time there is something to catch, it is
# gone. Anything else stored in the repository -- AGENTS.md, scripts/, a check
# wired into the build -- has the same bootstrap problem for the same reason.
#
# The fix that does work runs from OUTSIDE the checkout: the environment's setup
# script, stored server-side and run on every provision. scripts/sync-checkout.sh
# is the body to paste there, and this hook calls the same script so there is one
# implementation rather than two that can drift.
# See https://code.claude.com/docs/en/claude-code-on-the-web
#
# What this hook is still good for: a session that resumes into a container whose
# image IS current, where it catches ordinary drift. Treat it as a second line,
# never as the reason to skip checking.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" || exit 0

if [ -x scripts/sync-checkout.sh ]; then
  SW_REPO_DIR="$PWD" bash scripts/sync-checkout.sh
else
  echo "session-start: scripts/sync-checkout.sh is missing, which usually means"
  echo "this checkout predates it. Verify the tree before doing any work:"
  echo "    git fetch origin qa && git status -sb"
fi
exit 0
