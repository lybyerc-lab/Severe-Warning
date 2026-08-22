# Unity tree — inactive

**This code does not ship and is not built by CI.** It is kept for reference.

The production game is `MechanicsLab/SevereWeather_3D_Lab.html` (Three.js r128),
packaged for Android with Capacitor. See `CURRENT_STATUS.md` for the canonical
active-source declaration.

## What this is

A Unity 6 (`6000.3.0f1`) implementation slice from the engine evaluation that
preceded the decision to stay on HTML/WebGL: 34 C# files covering storm
controllers, a damage and cascade model, region generation, a hybrid storm
camera, mobile input, and an editor-side production slice builder. Project
metadata lives in `Packages/manifest.json` and `ProjectSettings/`.

Last functional change: `be1d4e6` (2026-08-04). Nothing here has been maintained
against the gameplay work that has landed on `qa` since.

## Why it is still here

The evaluation and its reasoning are recorded across
`Docs/DECISION_2026-08-03_PRODUCTION_DIRECTION.md`,
`Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`, `Docs/MIGRATION_FROM_HTML.md` and
`Docs/DECISION_LOG.md`. Deleting the code would leave that record pointing at
nothing, and the tree is small (~400 KB). It is cheaper to keep and label than
to remove and re-explain.

`Tools/validate_project.py` treats several files here as required and lints every
`.cs` file for the `SevereWeather` namespace. Removing this tree means updating
that validator in the same change.

## If you are looking for the live game

- Gameplay source: `MechanicsLab/SevereWeather_3D_Lab.html`
- Modern layers: `src/`
- Build and packaging: `scripts/`, `.github/workflows/`
