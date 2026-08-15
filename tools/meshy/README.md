# SW-ART-003 Meshy candidate asset tooling

This lane converts reviewed 2D art references into **candidate-only** 3D models. It is not imported by the shipped Three.js runtime and it cannot replace a production asset without separate review and acceptance.

## Credential law

The CLI reads `MESHY_API_KEY` from the environment. GitHub Actions maps the repository secret named exactly `Meshy_API` into that environment variable. Never commit, print, or archive the secret value.

## First proof

`cow17-meshy-v1` is intentionally bounded to the existing Google-generated Cow 17 source from SW-ART-002 run `31895535943`, artifact `9249708267`. The workflow reproduces the already-reviewed 3/4 crop from that source board, verifies its source and pixel hashes, then submits one Smart Topology `meshy-t2` request with a 12,000-face target, 2K texture, and GLB-only output.

The first proof is capped at one authorized task and 15 credits. Actions reruns are blocked before the credit-bearing POST. A new paid attempt requires a new reviewed request commit.

Generated media belongs under `art-source/generated/meshy/`, which is ignored by Git. CI uploads the GLB, preview, crop, receipts, and hashes as an Actions artifact for review.
