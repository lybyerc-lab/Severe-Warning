# PlayCanvas Moo-Brew Production Slice

This directory is an isolated renderer proof. It does not replace or initialize the accepted Three.js game.

Current checkpoint:

- PlayCanvas 2.21.3 is fetched from an exact CDN URL during the dedicated workflow.
- Verified vendor payload: 2,370,651 bytes, SHA-256 `d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4`.
- `PLAYCANVAS_EXPECTED_SHA256` is pinned in `.github/workflows/playcanvas-production-slice.yml` (`checksumPinned: true`).
- The preview builds into `playcanvas-slice-dist`, never `modern-dist` or `www`.
- Prairie Junction uses one authored road intersection with explicit terrain, road, sidewalk, and tornado height contracts.
- Browser QA verifies a real PlayCanvas canvas, renderer identity, scene population, road clearance, tornado clearance, clean console state, and renderer disposal.
- No Android artifact is produced or claimed by this bootstrap workflow.
