# PlayCanvas Prairie Junction Expansion Proof — 2026-08-07

## Status

Browser-playable Prairie Junction scale-test candidate is verified in GitHub Actions and deployed to the guarded QA PlayCanvas path for owner hands-on testing.

This is **not** Android or physical acceptance. PR #34 remains draft/unmerged pending owner hands-on feedback.

## Provenance

Antigravity map implementation branch:

- branch: `agent/playcanvas-prairie-expansion-antigravity`
- AG map-code head before CI routing sync: `60f3cf5807645d4a303bff3ec1bcf7c5f75989f2`
- exact GitHub Actions tested head: `b3164a11cf56884ff9ca38c91e99976d6b9d86b4`
- difference between the two heads: workflow-routing sync only (`.github/workflows/playcanvas-production-slice.yml`); no gameplay/map code changed in the CI sync commit

PR:

- PR #34: `Expand Prairie Junction PlayCanvas test world`
- target: `agent/playcanvas-prairie-expansion-handoff`
- state at proof time: draft, open, unmerged

## Exact browser verification

PlayCanvas Production Slice Bootstrap:

- workflow run: **39**
- run ID: `31210691734`
- event: `pull_request`
- exact head: `b3164a11cf56884ff9ca38c91e99976d6b9d86b4`
- conclusion: **success**
- artifact: `severe-weather-playcanvas-slice-39`
- artifact ID: `9006600564`
- artifact digest: `sha256:3931243ca3e99469aa31adfaca2c2d6fbdc3a144bdfbf6ecef42db7076c70e3d`
- downloaded ZIP SHA-256: `3931243ca3e99469aa31adfaca2c2d6fbdc3a144bdfbf6ecef42db7076c70e3d`
- SOURCE_SHA.txt: `b3164a11cf56884ff9ca38c91e99976d6b9d86b4`

Verification results:

- static contracts: **54/54**
- browser QA: **47/47**
- failed checks: none
- console errors: none
- page errors: none
- PlayCanvas engine: `2.21.3`
- engine revision: `b1767d5`
- gameplay authority: `PLAYCANVAS_AUTHORITY_V1`
- entity count: `233`

## Expanded-world contract

Verified presentation scope:

- terrain footprint: `190 x 190` PlayCanvas world units
- road network: 3x3 connected grid
- connected junction count: `9`
- distinct landmark blocks: `4`
- chase-camera feel constants remain frozen from the accepted small-arena baseline
- camera-relative joystick/keyboard input remains green
- visible storm-speed parity remains inside the sealed-parent gate
- Pull, Gust, Zap, scoring/combo, Cow 17 safety, road/tornado clearance, reset, and cleanup remain green

## Screenshot review

Run 39 artifact includes:

- `playcanvas-slice-evidence/playcanvas-slice.png`
- `playcanvas-slice-evidence/playcanvas-slice-turn.png`
- `playcanvas-slice-evidence/playcanvas-slice-travel.png`
- `playcanvas-slice-evidence/playcanvas-slice-junction.png`

Manual review verdict for the browser scale proof: **PASS**.

The expanded grid is coherent and readable, the chase framing remains usable over longer travel, the separated junction view shows no obvious terrain/road overlap, and the candidate is suitable for owner hands-on camera/world-scale testing. This is not final art acceptance.

## QA deployment

Deploy QA Pages:

- workflow run: **70**
- run ID: `31211220166`
- QA branch source: `1228d7daf68e095d417d8d6f1dd4184201aa5b2b`
- conclusion: **success**

The deployment workflow:

- rebuilt and re-tested the existing QA root
- downloaded exact Run 39 artifact
- required all four expansion screenshots
- required static 54/54 and browser 47/47
- required the expanded-terrain, nine-junction, camera-baseline, gameplay-authority, ability, safety, clearance, and error gates
- overlaid the candidate only under `/playcanvas/`
- preserved the existing QA root
- performed a public post-deploy verification

Live public verification confirmed:

- QA root: `https://lybyerc-lab.github.io/Severe-Warning/`
- PlayCanvas path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`
- live PlayCanvas source: `b3164a11cf56884ff9ca38c91e99976d6b9d86b4`
- metadata includes `prairie-expansion`, `nine-connected-junctions`, and `190x190`

## Next gate

Owner hands-on testing of the larger Prairie Junction build should judge:

- long straight travel
- sweeping turns
- camera lag/catch-up over longer distances
- orientation/readability across multiple junctions
- whether tornado/world scale feels natural
- whether the frozen small-arena chase values still hold up at this scale

Do not merge PR #34 or begin broad camera retuning solely from automated evidence. Owner hands-on feedback is the next authority.

Android PlayCanvas APK: **not built**.  
Galaxy S26 Ultra physical acceptance: **not performed**.
