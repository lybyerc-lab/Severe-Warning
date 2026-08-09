---
name: Agent task
about: Bounded parallel worker handoff
labels: []
---

# TASK: SW-XXX-000

## Lane

`SW-...`

## Repository

`lybyerc-lab/Severe-Warning`

## Exact base

`<40-char SHA>`

## Worker branch

`agent/sw-...`

## Goal

One sentence describing the bounded outcome.

## Why this exists

Brief context. Explain the user-visible or throughput problem, not a history dump.

## Required reading

1. `AGENTS.md`
2. `Docs/ACTIVE_PRODUCTION_SLATE.md`
3. `Docs/MULTI_AGENT_OPERATING_MODEL.md`
4. Task-specific docs only

## Allowed file territory

- `path/**`

## Forbidden / protected territory

- gameplay steering/input/camera authority unless explicitly assigned
- Pull/Gust/Grid Zap authority unless explicitly assigned
- score/timer/campaign authority unless explicitly assigned
- target health/damage/collision/gameplay coordinates unless explicitly assigned
- Cow 17/animal safety authority unless explicitly assigned
- Neon persistence unless explicitly assigned
- unrelated worker-lane files

## Implementation constraints

- Verify `git rev-parse HEAD` equals the exact base SHA before editing.
- Work only on the named worker branch/worktree.
- Do not broaden scope.
- Stop and report if the task requires crossing a forbidden boundary.
- Do not merge or promote QA.

## Required verification

```text
<commands/checks>
```

## Definition of done

- [ ] bounded goal implemented
- [ ] required tests pass
- [ ] no intentional protected gameplay change
- [ ] evidence generated if required
- [ ] exact final commit SHA reported

## Return to Director

Return exactly:

1. Task ID
2. Final commit SHA
3. Changed files
4. Implementation summary
5. Verification commands and results
6. Evidence/screenshots/reports
7. Known limitations/dependencies
8. Statement: `No protected gameplay authority was intentionally changed.`

## Non-goals

List attractive adjacent work the agent must not absorb.
