# runtime/ — not a build input

Nothing in this directory is loaded by the game. Every file here has been
flattened **inline** into `MechanicsLab/SevereWeather_3D_Lab.html`, marked with
`[SW:SOURCE:<file>]`.

**Edit the gameplay source, not these files.** Changes made here do not reach the
game.

- `v510-*.js` — the Three.js production slice, inlined by the patch-chain flatten.
- `modernization-phase*.js` — the four lexical bridges the modern TypeScript shell
  attaches to. These *must* be inline: they close over `let` bindings in the
  gameplay script (`runTimeRemaining`, `cooldowns`, `triggerAbility`, ...), so
  they cannot work as separate `<script src>` files. They were never copied into
  the shipping bundle, which is why `modern-shell.js` threw
  `Legacy runtime contract is incomplete` on every page load until they were
  inlined.

These copies are retained only because several `scripts/verify-*.mjs` checks still
read them. Follow-up: point those verifications at the inlined regions in the
gameplay source and delete this directory.
