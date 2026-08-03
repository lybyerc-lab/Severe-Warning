# Decision: Isolated Babylon Visual Renderer Laboratory

Date: 2026-08-03  
Status: laboratory approved; production migration not approved

## Decision

- Three.js remains the production renderer.
- Babylon.js is approved only inside `Experiments/VisualEngineLab/`.
- WebGL 2 is the required baseline renderer path.
- WebGPU is an optional laboratory path and cannot become a runtime requirement.
- Babylon must demonstrate a substantial visual, tooling, performance, and cleanup advantage before integration is considered.
- A successful laboratory technique may be reimplemented in Three.js if migration cost or risk is too high.

## Severe Warning comparison

| Concern | Current Three.js r128 production | Babylon laboratory assessment |
|---|---|---|
| Android WebView / Capacitor | Physically proven through existing app | WebGL 2 should fit the same web container; must be physically proven |
| WebGL 2 | Current accepted baseline | First-class baseline via `Engine` |
| WebGPU | Not present | Available through asynchronous `WebGPUEngine`; optional only |
| glTF / GLB | Would require loader/pipeline work | Strong loader, animation-group, skeleton, morph, LOD, and asset-container tooling |
| Instancing | Existing selective `InstancedMesh` use | Hardware instances and thin instances are mature options |
| Materials | Hand-authored standard/basic/canvas materials | PBR, node materials, standard materials, and editor tooling are broader but can cost bundle/GPU budget |
| Particles | Custom bounded systems | CPU/GPU particle options and observability are stronger; still require hard budgets |
| Shadows/post | Proven restrained configuration | More integrated features; easier to overspend on mobile |
| Inspector/profiling | Custom QA and renderer info would be needed | Strong inspector and engine instrumentation, but inspector is not a shipping dependency |
| Serialization/assets | Monolithic procedural source | Scene/asset containers and GLB workflow can reduce bespoke loading code |
| Physics | Hand-authored arcade reactions | Multiple integration choices; unrestricted physics remains rejected for building destruction |
| Offline packaging | Proven embedded/local runtime | ESM bundle can be fully local; no CDN is required |
| Bundle/startup | Existing embedded source is large but known | Babylon core adds meaningful bundle weight; selective imports and measurement are mandatory |
| Cleanup | Current lifetime is mostly page-scoped | Scene/engine disposal APIs are explicit, but application registries/listeners still require discipline |
| TypeScript | Production is monolithic JavaScript | Babylon types and modular TS improve contracts and refactoring confidence |
| Determinism/testing | Strong patch/harness history; renderer coupled | Event replay can be renderer-neutral and deterministic if time/seed ownership stays outside systems |
| Maintenance | Known behavior, high coupling | Better modular tooling, but a second renderer and migration adapter add real maintenance cost |

Babylon having more built-in features does not make it the winner. Severe Warning’s hardest requirements are preserved fun, readable destruction, input latency, mobile thermals, offline packaging, deterministic cleanup, and a safe migration path.

## Adoption gates

Production consideration requires all of the following:

1. The same recorded gameplay event stream replays in Three.js and Babylon.
2. Babylon shows a clear visual improvement at normal mobile camera distance.
3. Input-to-photon latency is no worse in a physical Android WebView.
4. Low and Balanced tiers meet minimum-device budgets; High meets Galaxy S26 Ultra budgets.
5. Startup, bundle size, memory, heat, battery, and frame pacing are measured rather than inferred.
6. Retry and repeated scene reset show no meaningful resource growth.
7. Offline Capacitor packaging works with no CDN or hidden fetches.
8. The intro/control handoff, UI, audio, scoring, campaign, Cow 17, media, and protected gameplay remain owned outside the renderer.
9. A rollback to the Three.js control build remains immediate.
10. The exact Android candidate is physically accepted on the Galaxy S26 Ultra and evaluated on a less capable target class.

Until those gates pass, Babylon is a research tool, not the production engine.
