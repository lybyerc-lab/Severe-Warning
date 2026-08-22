#!/usr/bin/env bash
# Create one archive/<branch> tag per remote branch, then push them.
#
# Why this is a script you run rather than something the QA automation did:
# the automation session is scoped to push the `qa` branch only, and the remote
# rejects tag pushes from it with HTTP 403. Creating these tags needs a token
# with write access to refs/tags/*.
#
# Run this BEFORE deleting any branch. Tags are what keep the commits reachable;
# Docs/BRANCH_ARCHIVE_MANIFEST.md only records the SHAs, which is not the same
# thing - unreachable objects are eventually garbage-collected.
#
# Safe to re-run: existing tags are left alone.
set -euo pipefail

REMOTE="${REMOTE:-origin}"
LIVE="${LIVE:-qa}"

git fetch --prune "$REMOTE"

created=0
existing=0
while read -r ref; do
  branch="${ref#refs/remotes/$REMOTE/}"
  [ "$branch" = "HEAD" ] && continue
  [ "$branch" = "$LIVE" ] && continue
  tag="archive/$branch"
  if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
    existing=$((existing + 1))
    continue
  fi
  git tag "$tag" "$REMOTE/$branch"
  created=$((created + 1))
done < <(git for-each-ref --format='%(refname)' "refs/remotes/$REMOTE")

echo "archive tags created: $created (already present: $existing)"

if [ "$created" -gt 0 ]; then
  git push "$REMOTE" --tags
fi

echo
echo "Verify before deleting anything:"
echo "  git ls-remote --tags $REMOTE | grep -c 'refs/tags/archive/'"
