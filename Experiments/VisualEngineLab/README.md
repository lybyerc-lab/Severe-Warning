# Severe Warning Visual Engine Laboratory

An isolated Babylon.js benchmark for testing visual improvement without changing the Three.js production game.

## What it contains

- pinned Babylon.js TypeScript/Vite application with no CDN runtime;
- WebGL 2 baseline and WebGPU capability detection;
- city-builder-readable ArcRotate camera;
- Low, Balanced, High, and Showcase runtime quality tiers;
- compact farm-to-town scene with road, intersection, farm, town edge, utilities, news van, landmark, horizon, tornado, barn, hay, and Cow 17;
- layered funnel, condensation, dust, contact, and debris-orbit systems;
- five-stage authored barn destruction and bounded debris pool;
- recognizable procedural Cow 17 with safe twelve-state performance;
- versioned renderer-neutral event/snapshot contracts;
- normal 180-second and accelerated 30-second deterministic replay;
- diagnostics, reset, explicit disposal, and QA state API.

The laboratory makes no gameplay decisions and contains no production renderer integration.

## Commands

```powershell
npm ci
npm run dev
npm run typecheck
npm run test
npm run test:contracts
npm run test:replay
npm run build
npm run audit:baseline
```

Use `npm run dev -- --host 0.0.0.0` only on a trusted development network. The built runtime requires no CDN or external asset fetch.

## Query parameters

- `?quality=low|balanced|high|showcase`
- `?speed=normal` for 180 seconds; default is accelerated approximately 30 seconds.

## Browser QA API

`window.__SEVERE_WARNING_VISUAL_LAB__` exposes read-only state plus reset, replay, acceleration, quality, and disposal controls. `visual-lab-complete` fires with deterministic result evidence after the automated reset.

## Camera contract

The laboratory uses an ArcRotate camera with a 55-degree pitch contract, 38-degree FOV, 112-meter nominal radius, target offset `(4, 3, 2)`, and 76-140 zoom limits. The perspective is narrow enough for SimCity-like route readability, pulled back enough for mobile tactical context, and close enough for Cow 17’s torso/head/leg silhouette and ear tag to remain visible. Orbit is an inspection affordance for the lab, not a proposed production control.

Required responsive viewports: `1365×630`, `932×430`, `915×412`, and `740×360`.

## Status boundary

Successful local tests or browser benchmarks do not physically accept Babylon, replace Three.js, or authorize an APK. Android WebView, frame pacing, heat, battery, memory, lifecycle, and input feel remain future physical gates.
