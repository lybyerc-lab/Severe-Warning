# Implementation Truth Gate

This gate exists because structural markers, class files, and helper-only QA can look complete while the accepted game executor never calls the new code.

## Binding rules

1. **Executor integration is mandatory.** A feature is implemented only when the accepted runtime path calls it during normal gameplay. A direct QA-only helper call is not implementation proof.
2. **Integration must be observable.** Every migrated subsystem must expose bounded counters or telemetry that identify calls from the real executor, cleanup, and reset paths.
3. **Behavioral QA outranks marker QA.** Token and file checks protect structure, but blocking browser QA must trigger the real player-facing path and verify its effects.
4. **Base and candidate use the same runner.** Performance evidence must build the accepted base and candidate in one workflow and capture both with the same browser/runtime configuration.
5. **No fabricated performance certainty.** CI frame timings are advisory. Deterministic integration, pool bounds, cleanup, listener counts, and telemetry integrity are blocking.
6. **One source change, one automatic run.** Milestone workflows use `pull_request` plus optional `workflow_dispatch`. Do not combine branch `push` and PR triggers for the same work.
7. **Artifacts are contracts.** Required reports, screenshots, logs, hashes, source identity, and changed-file ledgers are validated with `test -s`; upload uses `if-no-files-found: error`.
8. **Packaging language must be exact.** `assembleDebug` produces a debug APK, never a signed release APK.
9. **Documentation follows evidence.** Repository memory and PR descriptions may cite only a completed run for the exact source commit. A docs-only follow-up must distinguish itself from the verified source commit.
10. **No absolute leak claims without measurement.** Use bounded allocation, stable listener count, reset-to-zero, or no-growth evidence. Do not claim “zero memory leaks” from marker tests.
11. **Control characters are forbidden.** PR text and repository Markdown must contain normal UTF-8 prose without hidden control characters.
12. **Physical acceptance remains human.** Automated green status never proves touch feel, heat, battery behavior, or sustained device performance.

## Required evidence for a modernization milestone

- exact source commit and workflow run ID
- inherited blocking QA results
- milestone behavioral QA report
- accepted-base report
- candidate report
- comparison report
- screenshots from meaningful scenarios
- browser and server logs
- changed-module ledger
- APK filename, type, and SHA-256
- explicit physical-device status

`pnpm run verify:process` enforces the machine-checkable portion of this gate.
