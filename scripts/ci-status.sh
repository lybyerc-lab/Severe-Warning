#!/bin/bash
# [SW:CI:ALERT] Print the state of every workflow at the start of a session.
#
# WHY THIS RUNS BEFORE ANY WORK
# -----------------------------
# CI failure in this project has always been passive: it waits to be discovered.
# Two workflows sat red for ten-plus consecutive commits and nobody noticed, and
# on 2026-09-02 four runs went red or cancelled in one night and were found only
# because the director asked what was still running. Nothing was unassigned --
# the signal simply never arrived anywhere.
#
# .github/workflows/ci-alert.yml covers the long gap by opening an issue in the
# repository. This covers the other gap: an agent session is episodic, starts
# with no memory of the last one, and is exactly the wrong moment to be relying
# on anybody's diligence. The state is on screen before the first edit.
#
# It NEVER fails a session. A missing token, an unreachable API or a rate limit
# prints one line and exits zero; a startup hook that can block work is worse
# than no startup hook, and this one is a convenience, not a gate.
set -uo pipefail

REPO="${SW_CI_REPO:-lybyerc-lab/Severe-Warning}"
BRANCH="${SW_BRANCH:-qa}"
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

command -v curl >/dev/null 2>&1 || { echo "ci: curl unavailable; skipping the CI check."; exit 0; }
command -v python3 >/dev/null 2>&1 || { echo "ci: python3 unavailable; skipping the CI check."; exit 0; }

AUTH=()
[ -n "$TOKEN" ] && AUTH=(-H "Authorization: Bearer $TOKEN")

# Written to a file rather than passed as an argument: thirty runs of JSON is
# well past ARG_MAX and the first version of this died with "Argument list too
# long", which the exit-zero contract then swallowed into silence.
BODY_FILE="$(mktemp -t sw-ci-XXXXXX.json 2>/dev/null || echo /tmp/sw-ci-status.json)"
trap 'rm -f "$BODY_FILE"' EXIT

curl -sS -m 15 "${AUTH[@]}" \
  -H 'Accept: application/vnd.github+json' \
  -o "$BODY_FILE" \
  "https://api.github.com/repos/${REPO}/actions/runs?branch=${BRANCH}&per_page=30" 2>/dev/null || {
  echo "ci: could not reach the GitHub API; skipping the CI check."
  exit 0
}

HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo '')"

CI_REPO="$REPO" CI_HEAD="$HEAD_SHA" python3 - "$BODY_FILE" <<'PY'
import json
import os
import sys

repo = os.environ.get('CI_REPO', '')
head = os.environ.get('CI_HEAD', '')  # kept for context in future checks

try:
    with open(sys.argv[1], 'r', encoding='utf-8') as handle:
        payload = json.load(handle)
except Exception:
    print('ci: unreadable API response; skipping the CI check.')
    raise SystemExit(0)

runs = payload.get('workflow_runs')
if not isinstance(runs, list) or not runs:
    message = payload.get('message')
    print(f"ci: no workflow runs returned{' (' + message + ')' if message else ''}.")
    raise SystemExit(0)

# Newest run per workflow. The API returns newest first.
latest = {}
for run in runs:
    latest.setdefault(run.get('name', '?'), run)

failing = [r for r in latest.values() if r.get('conclusion') == 'failure']
running = [r for r in latest.values() if r.get('status') != 'completed']

if failing:
    print('=' * 62)
    for run in failing:
        sha = (run.get('head_sha') or '')[:7]
        print(f"ci: {run.get('name')} is FAILING on {sha}")
        print(f"    {run.get('html_url')}")
    print('    AGENTS.md: CI is owned by whoever pushed, and a red run is the')
    print('    next task, ahead of whatever was planned.')
    print('=' * 62)
else:
    parts = []
    for name, run in latest.items():
        sha = (run.get('head_sha') or '')[:7]
        if run.get('status') != 'completed':
            mark = '…'
        elif run.get('conclusion') == 'success':
            mark = 'ok'
        else:
            # cancelled, skipped, timed_out: not a failure, but nothing was measured.
            mark = str(run.get('conclusion'))
        parts.append(f"{name} {mark} {sha}")
    print('ci: ' + ' | '.join(parts))

if running:
    print(f"ci: {len(running)} run(s) still in progress.")

# Deliberately NOT reported: "workflow X has not run against HEAD". Two of the
# three workflows are path-filtered -- the full round only runs when
# MechanicsLab, assets, scripts, src or the build config change -- so a docs
# commit legitimately leaves them behind, and a line saying so would fire on
# most commits and become the thing everyone learns to skip. That is the failure
# this script exists to prevent, so it prints the SHA each workflow was actually
# measured on and lets the reader draw the comparison.
PY
exit 0
