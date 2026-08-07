# PlayCanvas Moo-Brew Production Slice

This directory is an isolated renderer proof. It does not replace or initialize the accepted Three.js game.

Current checkpoint:

- PlayCanvas 2.21.3 is fetched from an exact CDN URL during the dedicated workflow.
- The preview builds into `playcanvas-slice-dist`, never `modern-dist` or `www`.
- Prairie Junction uses one authored road intersection with explicit terrain, road, sidewalk, and tornado height contracts.
- Browser QA verifies a real PlayCanvas canvas, renderer identity, scene population, road clearance, tornado clearance, clean console state, and renderer disposal.
- No Android artifact is produced or claimed by this bootstrap workflow.

Before Android packaging, the discovered PlayCanvas engine SHA-256 must be pinned through `PLAYCANVAS_EXPECTED_SHA256` and recorded in repository memory.
