# runtime/ — no longer a build input

These files used to be bundled into the gameplay source at build time by
`scripts/apply-v510-production-slice.mjs`. That patch chain has been flattened:
their content now lives **inline** in `MechanicsLab/SevereWeather_3D_Lab.html`,
marked with `[SW:SOURCE:<file>]`.

**Edit the gameplay source, not these files.** Changes made here do not reach the
game. They are retained only because several `scripts/verify-*.mjs` checks and the
modernization-phase workflows still read them.

Follow-up: point those verifications at the inlined regions in the gameplay source
and delete this directory. Until then, treat anything here as a stale copy.
