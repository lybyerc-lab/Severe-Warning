# Visual Engine Performance Budget

Status: provisional laboratory budget; no Android measurements yet

| Budget | Low | Balanced | High | Showcase |
|---|---:|---:|---:|---:|
| Target frame rate | 30 fps floor | 45 fps target | 60 fps target | 60 fps desktop target |
| JavaScript frame time | ≤ 8 ms | ≤ 6 ms | ≤ 5 ms | ≤ 5 ms |
| GPU frame time | ≤ 25 ms | ≤ 18 ms | ≤ 14 ms | ≤ 14 ms |
| Draw calls | 90 | 140 | 210 | 300 |
| Visible triangles | 120k | 220k | 380k | 650k |
| Active meshes | 180 | 280 | 420 | 650 |
| Skinned meshes | 0-2 | 0-4 | 0-8 | 0-12 |
| Shadow casters | 0 | 10 | 20 | 32 |
| Shadow map | off / 512 hook | 1024 | 2048 | 2048 |
| Texture memory | 32 MB | 64 MB | 112 MB | 192 MB |
| Active particles | 32 | 72 | 120 | 180 |
| Active debris | 8 | 14 | 22 | 30 |
| Visible animals | 4 | 8 | 14 | 22 |
| Dynamic lights | 1 | 2 | 3 | 5 |
| Post-processing | off | off | one restrained pass | two restrained passes |
| Initial JS bundle gzip | 550 KB | 650 KB | 800 KB | 1.1 MB |
| Interactive load, warm desktop | 2.0 s | 2.0 s | 2.5 s | 3.0 s |
| Runtime memory | 180 MB | 260 MB | 380 MB | 550 MB |

Render scale is `0.72`, `0.88`, `1.0`, and `1.15` respectively. Texture and animal-LOD hooks exist even though the initial procedural scene does not load texture assets or skeletons.

## Measurement classes

- **Desktop laboratory measurement:** interactive browser on a known desktop GPU with real viewport and devtools closed.
- **Headless measurement:** automated correctness, mesh/triangle/material/debris peaks, and error capture. It is not evidence of GPU speed or mobile thermals.
- **Estimated mobile budget:** the Low/Balanced/High figures above until measured.
- **Physically verified Android measurement:** only values captured from an exact APK on identified hardware.

Nothing in this document is physically verified yet. The Galaxy S26 Ultra remains the acceptance authority for the first Android experiment, but the future production minimum must also be evaluated on a materially less capable Android/WebView class.

## Cleanup budget

After reset: barn state `intact`, active pooled debris `0`, Cow 17 state `idle`, replay time `0` when manually reset, and no additional listeners. After full disposal: no render loop, scene, engine, registered listener, timer, or owned material/mesh remains. Ten reset/replay cycles should show no monotonic growth in active meshes, materials, textures, or listeners.

## Gate interpretation

Visual superiority is irrelevant if Balanced cannot preserve input latency and frame pacing. A tier may dynamically lower render scale, shadows, particles, debris, vegetation, animal detail, animation distance, highlight coverage, atmosphere, texture tier, or post effects. It may not change gameplay simulation, clocks, damage, scoring, or controls.

