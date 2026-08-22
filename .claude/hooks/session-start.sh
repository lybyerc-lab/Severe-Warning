#!/bin/bash
# Fail loudly if this container's checkout is not the branch tip.
#
# WHY THIS EXISTS
# ---------------
# Remote sessions are reclaimed after inactivity and re-provisioned from a
# cached container image. That image carries a git checkout pinned to whatever
# revision it was built at - NOT the current tip of the working branch. On
# 2026-08-22 this session came back twice at 8188a45 while origin/qa was eight
# commits ahead, and the second time it went unnoticed: an agent edited the
# gameplay source, rebuilt, screenshotted, and spent several minutes reasoning
# about a render that had been produced from a week-old build.
#
# The tell is subtle and easy to rationalise, so this checks mechanically. The
# proof that it is re-provisioning rather than a stray `git reset` is the
# reflog: none of the eight commits appear in it at all. They were made in a
# different container.
#
# Dependencies survive in the image, so this deliberately does not reinstall
# anything. The checkout is the thing that goes stale.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ -z "$BRANCH" ] || [ "$BRANCH" = "HEAD" ] && BRANCH="qa"

git fetch --quiet origin "$BRANCH" 2>/dev/null || {
  echo "session-start: could not reach origin; working offline against $(git rev-parse --short HEAD)"
  exit 0
}

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH" 2>/dev/null)" || exit 0
[ "$LOCAL" = "$REMOTE" ] && exit 0

BEHIND="$(git rev-list --count "$LOCAL..$REMOTE" 2>/dev/null || echo '?')"
AHEAD="$(git rev-list --count "$REMOTE..$LOCAL" 2>/dev/null || echo '?')"
DIRTY="$(git status --porcelain | wc -l)"

# Clean tree, strictly behind: fast-forwarding is safe and loses nothing.
if [ "$DIRTY" -eq 0 ] && [ "$AHEAD" = "0" ]; then
  git merge --ff-only "origin/$BRANCH" >/dev/null 2>&1 && {
    echo "session-start: checkout was $BEHIND commit(s) behind origin/$BRANCH; fast-forwarded to $(git rev-parse --short HEAD)."
    exit 0
  }
fi

# Anything else needs a human: never discard uncommitted or unpushed work.
echo "=============================================================="
echo "session-start: THIS CHECKOUT IS NOT origin/$BRANCH"
echo "  local  $(git rev-parse --short "$LOCAL")   behind:$BEHIND  ahead:$AHEAD  uncommitted:$DIRTY"
echo "  remote $(git rev-parse --short "$REMOTE")  (origin/$BRANCH)"
echo
echo "  Do not edit, build, or screenshot until this is resolved -"
echo "  you would be working against a stale tree."
echo
if [ "$AHEAD" != "0" ]; then
  echo "  This checkout has $AHEAD commit(s) origin does not. Push or inspect them first:"
  echo "    git log origin/$BRANCH..HEAD --oneline"
elif [ "$DIRTY" -ne 0 ]; then
  echo "  There are $DIRTY uncommitted change(s). Inspect, then sync:"
  echo "    git status"
  echo "    git stash && git merge --ff-only origin/$BRANCH && git stash pop"
fi
echo "=============================================================="
exit 0
