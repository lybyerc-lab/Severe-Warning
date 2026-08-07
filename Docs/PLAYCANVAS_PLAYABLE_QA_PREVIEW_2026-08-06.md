# PlayCanvas Playable QA Preview — 2026-08-06

Status: Browser-QA passed and live QA preview verified. Android and physical-device acceptance remain pending.

## Owner milestone

The owner instructed the project to continue until a PlayCanvas build could actually be played. This document records the first browser-playable PlayCanvas migration candidate and its public QA delivery.

## Active implementation

- Repository: `lybyerc-lab/Severe-Warning`
- Draft PR: #32 `Build first playable PlayCanvas authority-backed slice`
- Implementation branch: `agent/playcanvas-playable-moo-brew-slice`
- Verified playable source SHA: `5936bb12e022741a0964b2c80be9304780ee68d0`
- Base/migration-memory branch: `agent/playcanvas-production-slice-handoff`

PR #32 remains draft and unmerged because browser playability is not physical Android acceptance.

## Transitional architecture

The accepted gameplay executor remains authoritative in a hidden same-origin authority frame while PlayCanvas owns the visible presentation.

Authoritative legacy behavior retained for this candidate:

- storm movement
- Pull, Gust, and Zap executor semantics
- warning-run timing
- destruction scoring and combo
- production-barn destruction state
- campaign/runtime state
- reset behavior
- safe-animal state

PlayCanvas consumes that live state through `PLAYCANVAS_AUTHORITY_V1` and renders the visible tornado, world, HUD, Cow 17, vehicle, electrical target, and destruction proxy.

This architecture is deliberately transitional. The hidden legacy renderer is not the final mobile-performance architecture.

## Playable browser proof

Workflow: `PlayCanvas Production Slice Bootstrap`

- Run ID: `31136370444`
- Run number: `18`
- Conclusion: success
- Exact source SHA: `5936bb12e022741a0964b2c80be9304780ee68d0`
- Artifact: `severe-weather-playcanvas-slice-18`
- Artifact ID: `8978121767`
- Artifact size: `2923240` bytes
- Artifact digest: `sha256:169784d02b11170d3e0f24d6e61fdc8a01d5ccb07b3561680fdf2cce909b3bc2`
- Downloaded ZIP SHA-256: `169784d02b11170d3e0f24d6e61fdc8a01d5ccb07b3561680fdf2cce909b3bc2`

The downloaded archive digest exactly matched GitHub's artifact digest.

### Engine evidence

- PlayCanvas version: `2.21.3`
- PlayCanvas exported revision: `b1767d5`
- Engine file: `playcanvas-2.21.3.min.mjs`
- Engine bytes: `2370651`
- Engine SHA-256: `d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4`
- Pinned checksum gate: passed

### Static and browser gates

- Static verifier: `42/42` passed
- Chromium browser QA: `37/37` passed
- Failed checks: `[]`
- Console errors: `[]`
- Page errors: `[]`

### Real-executor gameplay evidence

The browser harness exercised the actual accepted executor through the PlayCanvas control surface.

- authoritative storm movement: `24.489997958350216` world units
- distance to live production-barn target: `28.30194339616981 -> 3.841874542459748`
- Gust: accepted by actual executor
- Pull: accepted by actual executor
- Zap: accepted by actual executor
- production-barn health: `760 -> 437.19999999999976`
- destruction score: `0 -> 217`
- combo: `1.00x -> 1.10x`
- protected combo cap check: passed, never above `3.5x`
- Cow 17: `safe: true`
- reset: restored an active `180` second warning run
- cleanup: removed PlayCanvas canvas, hidden authority frame, global handle, and telemetry

### Manual screenshot review

Evidence screenshot: `playcanvas-slice-evidence/playcanvas-slice.png`

Verdict: coherent first playable PlayCanvas candidate.

The frame contains the PlayCanvas tornado, clean road planes, HUD, joystick, Pull/Gust/Zap controls, Cow 17, vehicle, electrical target, and authored buildings. It is valid for hands-on browser testing, but it is not final art acceptance.

## QA Pages delivery

The existing QA root remains the accepted Phase 5 QA site. The PlayCanvas candidate is mounted separately under `/playcanvas/` so it can be tested without replacing the old root.

Live PlayCanvas QA URL:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

Live metadata URL:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/qa-playcanvas-build.json`

QA Pages workflow:

- Workflow: `Deploy QA Pages`
- Run ID: `31136838498`
- Run number: `67`
- QA branch SHA: `14c1b3945957cb480aa7734e9a277580e42772dc`
- Build job: success
- Deploy job: success
- Existing Phase 5 QA root rebuild: success
- Deterministic QA4: success
- Run 18 artifact download: success
- sealed artifact verification: success
- PlayCanvas overlay into Pages artifact: success
- GitHub Pages deployment: success
- live public URL verification: success

The post-deploy runner fetched all three public resources and verified:

- QA root contains `MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2`
- `/playcanvas/` contains `PLAYCANVAS PLAYABLE SLICE`
- live `qa-playcanvas-build.json` contains exact playable source SHA `5936bb12e022741a0964b2c80be9304780ee68d0`

## Current classification

- Committed: yes
- Built: yes
- Browser-QA passed: yes
- Live QA preview verified: yes
- Playable in browser: yes
- Android APK built for PlayCanvas: no
- Physically accepted on Galaxy S26 Ultra: no
- PR #32 merged: no

## Next gate

Collect owner hands-on feedback from the live PlayCanvas QA preview. Fix presentation/control defects without weakening the accepted gameplay authority. After the browser slice is acceptable, package the same bounded candidate through Capacitor Android and begin exact-APK Galaxy S26 Ultra acceptance.
