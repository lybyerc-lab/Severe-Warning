#!/bin/bash
# Bring this container's checkout up to the tip of its working branch.
#
# WHY THIS IS A SEPARATE, SELF-CONTAINED SCRIPT
# ---------------------------------------------
# Because the in-repo SessionStart hook cannot solve the problem it was written
# for, and this is the proof:
#
#   $ git cat-file -e 8188a45:.claude/hooks/session-start.sh
#   fatal: path '.claude/hooks/session-start.sh' exists on disk,
#          but not in '8188a45'
#
# Remote containers are provisioned from a cached image, and this project's
# image carries a checkout pinned at 8188a45 (2026-08-21). The hook was added
# afterwards, in 961fa35. So every re-provision restores a tree in which the
# hook and its settings file DO NOT EXIST -- the guard is deleted by the exact
# event it is meant to catch, and cannot fire from that tree. On 2026-08-29 the
# container reverted mid-session and an edit was applied to a 228-commit-old copy
# of the file being changed; the resulting failure read as a real finding until
# the error was read properly.
#
# Evidence, and an explicit account of what is proved versus inferred versus
# still untested, is in Docs/CONTAINER_CHECKOUT_EVIDENCE.md. Read it before
# trusting the design below: the two-layer fix is reasoned from documented cache
# behaviour that has NOT been observed in this environment.
#
# Anything that lives inside the repository has this bootstrap problem. AGENTS.md
# at 8188a45 is the old AGENTS.md. scripts/ at 8188a45 is the old scripts/. The
# fix has to bootstrap from OUTSIDE the checkout, which means the environment's
# setup script -- configured in the Claude Code environment settings and stored
# server-side, where a stale checkout cannot delete it.
#
# IMPORTANT, AND NOT WHAT IT LOOKS LIKE: a setup script does NOT run on every
# provision. Per the docs it "runs the first time you start a session in an
# environment", then the filesystem is snapshotted and later sessions "skip the
# setup script step". It runs again only "when you change the environment's setup
# script or allowed network hosts, and when the cache reaches its expiry after
# roughly seven days". That caching is the whole bug: the snapshot carries the
# repository directory with it, which is why two sessions eight days apart both
# came up at exactly 8188a45.
#
# So this script alone would fix nothing. It would sync once, be frozen into the
# new snapshot, and drift again. It takes both layers:
#
#   1. THE SETUP SCRIPT (this file, pasted into the environment settings).
#      Changing it forces the stale snapshot to be rebuilt, and guarantees the
#      new snapshot's checkout is recent enough to contain .claude/ at all.
#   2. THE SessionStart HOOK (.claude/hooks/session-start.sh), which runs on
#      every session start and resume and calls this same script. Once step 1
#      has put it into the snapshot, it keeps every later session current --
#      including after each cache rebuild re-pins the snapshot.
#
# Neither is sufficient alone: the setup script re-pins weekly and drifts, and
# the hook cannot bootstrap itself into a snapshot that predates it.
#
# See https://code.claude.com/docs/en/cloud-environments#environment-caching
#
# It is deliberately conservative: it fast-forwards a clean checkout and refuses
# to touch anything else, because a container that has unpushed commits is a
# container whose work would be destroyed by a reset.
set -uo pipefail

REPO="${SW_REPO_DIR:-/home/user/Severe-Warning}"
BRANCH="${SW_BRANCH:-qa}"

cd "$REPO" 2>/dev/null || { echo "sync-checkout: no repo at $REPO; nothing to do."; exit 0; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "sync-checkout: $REPO is not a git checkout."; exit 0; }

if ! git fetch --quiet origin "$BRANCH" 2>/dev/null; then
  echo "sync-checkout: could not reach origin; leaving checkout at $(git rev-parse --short HEAD)."
  exit 0
fi

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH" 2>/dev/null)" || {
  echo "sync-checkout: origin/$BRANCH does not exist."
  exit 0
}

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "sync-checkout: already at origin/$BRANCH ($(git rev-parse --short HEAD))."
  exit 0
fi

BEHIND="$(git rev-list --count "$LOCAL..$REMOTE" 2>/dev/null || echo '?')"
AHEAD="$(git rev-list --count "$REMOTE..$LOCAL" 2>/dev/null || echo '?')"
DIRTY="$(git status --porcelain | wc -l)"

CURRENT="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

# NEVER move a session off the branch it is working on.
#
# An earlier version of this did `git checkout -B qa origin/qa` whenever HEAD was
# not on qa, which looked harmless until a real session was observed: sessions
# are given their own working branch, e.g.
#
#   $ git status -sb | head -1
#   ## claude/git-status-reflog-aus2gg
#
# On that session this script would have dragged the checkout onto qa, and the
# SessionStart hook would have done it at the start of every session. Being
# behind is a nuisance; being silently moved off your own branch mid-task is
# worse than the problem this script exists to solve.
#
# So a checkout on some other branch is reported, never rewritten. It is not
# necessarily stale -- a session branch legitimately diverges from the tip.
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "sync-checkout: on '$CURRENT', not '$BRANCH'; leaving it alone."
  echo "  origin/$BRANCH is $(git rev-parse --short "$REMOTE"); this checkout is $(git rev-parse --short HEAD)."
  echo "  If this branch should be current, merge or rebase it yourself."
  exit 0
fi

# On the target branch, clean, and strictly behind: fast-forwarding loses
# nothing, and it is the case this script exists for.
if [ "$DIRTY" -eq 0 ] && [ "$AHEAD" = "0" ]; then
  git merge --ff-only "origin/$BRANCH" >/dev/null 2>&1 || {
    echo "sync-checkout: fast-forward refused; leaving checkout alone."
    exit 0
  }
  echo "sync-checkout: checkout was $BEHIND commit(s) behind origin/$BRANCH; now at $(git rev-parse --short HEAD)."
  exit 0
fi

# Never destroy work. A container with unpushed commits or uncommitted edits is
# reporting something a human needs to look at, not something to reset past.
echo "=============================================================="
echo "sync-checkout: THIS CHECKOUT IS NOT origin/$BRANCH AND WAS LEFT ALONE"
echo "  local  $(git rev-parse --short "$LOCAL")   behind:$BEHIND  ahead:$AHEAD  uncommitted:$DIRTY"
echo "  remote $(git rev-parse --short "$REMOTE")  (origin/$BRANCH)"
echo
echo "  Do not edit, build, or screenshot until this is resolved:"
echo "  work done here would be against a stale tree."
[ "$AHEAD" != "0" ] && echo "    git log origin/$BRANCH..HEAD --oneline    # $AHEAD unpushed commit(s)"
[ "$DIRTY" -ne 0 ] && echo "    git status                                # $DIRTY uncommitted change(s)"
echo "=============================================================="
exit 0
