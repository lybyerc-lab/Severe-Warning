# The reverting checkout: evidence, inference, and what is still untested

Written 2026-08-29 after a session in which the container's checkout reverted
twice, and after the analysis of it was challenged for leaning on assumption.
Everything below is sorted by how well it is actually known. Commands are
included so the next person can re-run them rather than trust this file.

---

## 1. Verified in this container

**The `.git` directory is restored, not re-cloned.** Commits made earlier the
same day, in this same conversation, are absent from its reflog:

    $ git reflog --date=iso | sed -n '1,7p'
    540b9d0 HEAD@{2026-08-29 03:32:36}: commit: fix(repo): correct how the ...
    342ea82 HEAD@{2026-08-29 03:31:43}: merge origin/qa: Fast-forward
    c4626ba HEAD@{2026-08-29 03:21:39}: commit: fix(repo): the stale-checkout ...
    3b27948 HEAD@{2026-08-29 03:00:03}: commit: feat(qa): give the visual gate ...
    c8212b5 HEAD@{2026-08-29 02:39:58}: merge origin/qa: Fast-forward
    8188a45 HEAD@{2026-08-21 14:37:04}: commit: fix(qa): stop the visual gate ...
    be6b582 HEAD@{2026-08-21 14:08:20}: commit: fix(qa): require agreement ...

`ddecd9c`, `18e2658` and `1e26b71` were all committed earlier on 2026-08-29 in
this conversation. None appear. The reflog steps straight from Aug 21 to
02:39:58 on Aug 29 — the moment the tree was manually fast-forwarded after the
staleness was noticed. Everything from 02:39 onward is this container.

**There is no clone event in the repository's history.**

    $ grep -c "clone:" .git/logs/HEAD
    0

`git clone` writes `clone: from <url>` as its first reflog line. There isn't
one. The first entry is a bare `0000000 -> f0e80da` at **2026-08-19 18:14:33Z**,
which is 104 seconds after this environment (`env_01JPML8FqjauwA3tTMBHongV`) was
created at **2026-08-19T18:12:49Z**.

**The guard could not have run from the restored tree.**

    $ git cat-file -e 8188a45:.claude/hooks/session-start.sh
    fatal: path '.claude/hooks/session-start.sh' exists on disk,
           but not in '8188a45'

The hook was added later, in `961fa35`. At `8188a45` neither it nor
`.claude/settings.json` exists.

**The restored filesystem carries more than the repository.** `node_modules`
is dated 2026-08-21 12:41 and was present without being installed this session.

**It happened twice, to the same commit.** Both reverts landed on `8188a45`.

---

## 2. Documented, but not verified here

Quoted from https://code.claude.com/docs/en/cloud-environments — accurate as
quotations, untested in this environment:

- A setup script "runs the first time you start a session in an environment",
  after which "Anthropic snapshots the filesystem and reuses that snapshot as
  the starting point for later sessions", and those sessions "skip the setup
  script step".
- It "runs again to rebuild the cache when you change the environment's setup
  script or allowed network hosts, and when the cache reaches its expiry after
  roughly seven days".
- A setup script must exit zero "or the session fails to start", and finish
  within "roughly five minutes".
- Setup scripts are edited by opening the cloud environment selector, hovering
  an environment and clicking its settings icon; the dialog carries name,
  network access, environment variables and **Setup script**. "Personal
  environments don't have a separate page in your claude.ai account settings."

**One documented statement conflicts with the evidence above.** The same docs
say "cloud sessions start from a fresh clone of your repository". The reflog
shows otherwise for this environment. Both cannot be true here. The design in
`scripts/sync-checkout.sh` follows the evidence, not the sentence, but this
conflict is unresolved and may mean this environment is in an unusual state
rather than that the documentation is wrong.

---

## 3. Inferred, and labelled as such

- **That the restore is the environment cache snapshot.** The evidence proves
  the filesystem is restored and carries Aug-21 state. It does not prove which
  mechanism does it. "Environment caching" is the best available explanation and
  fits, but no observation here names it.
- **That the ~7-day cache expiry explains the Aug 21 to Aug 29 gap.** Eight days
  is suggestively close to seven, and that is all it is. Simple inactivity
  explains the same gap equally well. This was previously stated as though it
  lined up meaningfully; it does not rise above coincidence.

## 4. Claimed earlier without evidence, and withdrawn

- **"The guard has never fired."** Unknowable from here. What is verified is
  narrower and sufficient: it *cannot* fire from a tree at `8188a45`, because it
  does not exist there. Whether it has ever run in some other container is not
  something this session can determine.

---

## 5. The fix, and the test that would actually settle it

The two-layer design in `scripts/sync-checkout.sh` is **reasoned, not
demonstrated**. It rests on the documented cache behaviour in section 2, which
has not been observed here. It could be wrong in at least two ways: if the
snapshot does not in fact carry the repository, layer 1 is unnecessary; if
SessionStart hooks do not run when a container is re-provisioned mid-session,
layer 2 does not cover the case that actually bit us.

**The test.** After the setup script is set in the environment dialog, start a
*new* session and, before anything else, run:

    git rev-parse --short HEAD && git status -sb | head -1 && git reflog | head -3

- HEAD already at `origin/qa` with no manual fetch: layer 1 works.
- A `clone:` line, or a reflog with no Aug-21 entries: the environment was
  rebuilt, and section 1's conclusion needs revisiting.
- HEAD stale again at `8188a45`: the fix failed and the design in
  `sync-checkout.sh` is wrong. Record which, here.

### Result, 2026-08-29

The test was run in a new session. It printed:

    24d1aee
    ## claude/git-status-reflog-aus2gg
    24d1aee HEAD@{0}: checkout: moving from qa to claude/git-status-reflog-aus2gg
    24d1aee HEAD@{1}: checkout: moving from 24d1aee12eec... to qa
    24d1aee HEAD@{2}: end

**HEAD was current** — `24d1aee`, the tip at the time. And the reflog held three
entries, none from Aug 21, where the previous container's held thirty-nine going
back to Aug 19. So this was **not** the old filesystem fast-forwarded; it was a
fresh checkout. Saving the setup script invalidated the stale snapshot and the
rebuild started clean.

**This resolves the conflict in section 2.** Both documented statements are true
at different times: a fresh environment build clones fresh, then the snapshot
freezes that filesystem and later sessions restore it, accumulating whatever
those sessions did. The exposure was never the first session after a rebuild —
it is every session after the snapshot has been taken.

**What it does NOT establish.** A fresh clone at tip needs no fast-forward, so
the setup script's sync branch never executed. Layer 1 is confirmed only in its
snapshot-invalidating role. The genuine test of the design comes days from now,
when a session restores an aged snapshot: layer 2, the SessionStart hook, is what
has to catch that, and it has still never been observed doing so.

**It also found a defect.** The session was on `claude/git-status-reflog-aus2gg`,
not `qa`. The script's original `git checkout -B qa origin/qa` for the
"not on the branch" case would have dragged that session onto `qa`, at the start
of every session. Fixed: a checkout on another branch is now reported and never
rewritten. Verified — run against a worktree on `claude/probe-branch`, it left
both the branch and the HEAD untouched.

**Recorded for comparison across containers** (2026-08-29 03:3x UTC):

    CLAUDE_CODE_CONTAINER_ID=container_015qXayYTNPFmN5WcFGcVRkT--claude_code_remote--7512a2
    boot_id=c383c13a-20a4-481e-8499-e7b6488f2d00
    HEAD at restore=8188a45   first reflog entry=2026-08-19T18:14:33Z

---

## 6. What holds regardless

Everything survived both reverts because it had been pushed. Push early rather
than batching, and check `git status -sb` against origin before trusting a tree.
That rule needs no mechanism to be true and costs nothing if the fix works.
