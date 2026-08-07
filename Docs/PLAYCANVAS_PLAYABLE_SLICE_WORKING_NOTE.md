# PlayCanvas Playable Slice Working Note

Status: Building
Date: 2026-08-06 America/Chicago

Owner instruction: continue the PlayCanvas migration until there is a playable PlayCanvas build.

Next implementation branch: `agent/playcanvas-playable-moo-brew-slice`.

The accepted legacy gameplay executor remains authoritative for movement, Pull/Gust/Zap, warning-run timing, scoring/combo, campaign state, and destruction. The PlayCanvas page will use a same-origin hidden authority frame and render a visible PlayCanvas presentation from read-only/live bridge telemetry.

This is not Android or physical acceptance. The first target is a browser-playable QA candidate with behavioral input/ability/scoring evidence.