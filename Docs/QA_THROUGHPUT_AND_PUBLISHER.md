# QA Throughput and Manifest Publisher Contract

Status: SW-QA-001 implementation contract. This is process documentation, not owner visual acceptance.

## Build once, test many

`threejs-hero-slice6.yml` now produces one sealed candidate web artifact before browser QA starts. Core gameplay QA and presentation QA download that exact artifact, validate its embedded contract and tree digest, then run independently. The controlled Slice 5-versus-Slice 6 performance comparison remains a separate same-runner job because its methodology requires both builds on the same machine.

The Slice 5 baseline uses a cache key pinned to commit `f42f12b3e4e6b38d49f6bcc0b129b4e335f13ecf`. A cache hit is not trusted by itself: the restored `www` tree must pass the sealed contract's source, marker, file, and tree-digest checks. A cache miss builds the baseline, seals it, validates it, and only then saves it.

The expensive Slice 6 workflow ignores only task/process memory paths (`Docs/**`, issue templates, `AGENTS.md`, and `CURRENT_STATUS.md`). Runtime, scripts, assets, dependencies, and workflow changes still run the workflow.

## Candidate manifest

The generic `scripts/qa-candidate-contract.mjs` writes and validates `SEVERE_WEATHER_QA_CANDIDATE_V1` manifests. A manifest contains:

- exact source commit, branch, and workflow run identity;
- renderer and acceptance vocabulary;
- a recursive SHA-256 digest of the web-preview tree;
- required files and runtime markers;
- required report files that must contain `"passed": true`;
- required screenshot/evidence files.

The final Slice 6 package includes `package-manifest.json`, `SOURCE_COMMIT.txt`, `WORKFLOW_RUN_ID.txt`, the sealed web preview, and the full blocking QA evidence. The publisher validates that package before it can upload Pages content.

## Deliberate QA-root promotion

No branch push automatically rebuilds and replaces the QA root. After the Director has reviewed a successful exact evidence artifact, run **Deploy sealed QA candidate to Pages** manually and supply:

1. the successful source workflow run ID;
2. the exact final evidence artifact name;
3. the exact source commit from its manifest.

The workflow downloads that artifact from the named run, validates its contract and source file, and only then exposes `web-preview` to the Pages deployment job. It rejects wrong source SHAs, altered web bits, missing markers/evidence, and failed/missing reports. The publisher has no Slice 4/5/6 branch-specific rebuild logic.

## Android cadence

Android packaging remains opt-in. It is available only through the Hero Slice 6 manual dispatch input `package_android`; it consumes the already validated final browser candidate instead of becoming part of ordinary browser iterations.

## Director-side Actions confirmation

The local tests prove the deterministic contract behavior. The Director should next run the workflow on a non-doc Slice 6 change and confirm cache miss/hit behavior, fan-out artifact downloads, and final artifact assembly in GitHub Actions. Then use a reviewed artifact to exercise the manual Pages publisher. Neither action is performed by this worker task.
