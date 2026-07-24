# Production Decision Log

This file is append-only. Each entry records a decision, the evidence behind it, rejected alternatives, and the condition that would justify revisiting it.

## 2026-07-23 - Production foundation

### Decisions

- Freeze the HTML build as the Mechanics Laboratory.
- Select Unity 6.3 LTS with URP as the production engine.
- Keep Android as the first performance target.
- Preserve the direct-control action RPG identity.
- Define the world as a connected urban-rural region rather than isolated arenas.
- Require distinct storm verbs.
- Use County High navigation and Impact camera bands.
- Require real environment-art, region-authoring, technical-art, and audio pipelines.
- Reject the idea that zero-dependency Canvas rendering is a production requirement.

### Evidence

The browser laboratory proved mechanics and tone but repeatedly failed the dense dimensional world, material, destruction, and production-pipeline requirements.

### Revisit condition

Only a hard production blocker with measured evidence can reopen the engine decision.

## 2026-07-23 - Repository as persistent project memory

### Decision

The GitHub repository is the canonical durable project memory. Important decisions, current status, build configuration, cloud-build results, physical-device evidence, active blockers, and approved next steps must be committed with the related code whenever practical.

### Evidence

Chat-only context is difficult to version, diff, audit, or recover. The repository already contains code, validation tooling, production rules, and historical source material.

### Rejected alternative

Treating the original ChatGPT conversation as the sole canonical record.

### Revisit condition

This may be supplemented by an issue tracker or external design database, but the repository must retain a self-contained current-status and decision trail.

## 2026-07-23 - Android startup hotfix

### Decision

Keep the startup hotfix narrow: guarantee a runtime shader, create a visible camera before region generation, and surface startup exceptions on-screen.

### Evidence

Build #1 compiled and installed but displayed only black. Build #2 rendered the generated world and HUD after the focused hotfix.

### Rejected alternatives

- bundling unrelated art or control changes into the startup patch
- assuming a successful cloud build proved runtime startup

### Revisit condition

Replace the temporary unlit runtime shader only after a production material pipeline is ready and Android shader inclusion is verified.

## 2026-07-23 - Build #3 mobile-control alignment

### Decision

Repair the mobile controls as one coherent system:

- shared layout for HUD and touch hit testing
- safe-area-aware placement
- floating screen-scaled joystick with dead zone
- movement-touch ownership
- camera-relative movement for both storms
- latched one-shot inputs across Update and FixedUpdate
- pressed-state and telemetry feedback

### Evidence

Build #2 physical testing proved touch reached the app because storm switching worked, but movement was unclear and the visible ability buttons did not align with the horizontal touch bands used by input detection.

### Rejected alternatives

- adjusting only the joystick graphic
- fixing Tornado movement while leaving the Supercell override on world axes
- adding camera orbit, art, audio, loading, or new gameplay to the same patch

### Revisit condition

Tune sizes, dead zone, acceleration, and layout only from Build #3 physical-device evidence.

## 2026-07-23 - Build #4 feel and render recovery

- Build #3 proved that touch input and storm position updates were registering on the physical Android device.
- Build #3 failed because the camera tracked the storm so tightly that movement was not perceptible.
- The Build #3 opening position was a weak interaction test zone: crops were damageable but lacked colliders, so physics-based storm abilities could not find them.
- The flat emergency shader was retained only as a fallback. Build #4 generates guaranteed Standard and URP material templates, uses the stable lit built-in pipeline for the device gate, and leaves authored URP pipeline assets as a later editor-controlled migration.
- Build #4 uses a soft camera leash, stronger differentiated movement, immediate ability VFX, action status, target counts, speed, distance, build identity, graphics API, and render-pipeline telemetry.
- Crop colliders, a mixed starter test pocket, backdrop terrain, distant hills, road markings, mobility classes, approximate masses, and collider-aware density validation are part of the same recovery because they are required to judge feel and interaction honestly.
- Android build identity is set to version `0.1.4`, version code `4`, IL2CPP, ARM64, Vulkan first, and OpenGLES3 fallback.
- Build #4 remains a stylized procedural lab slice. It does not claim production art quality.

## 2026-07-24 - Make storm movement transform-authoritative

**Decision:** Tornado and Supercell roots use transform-authoritative fixed-step translation. The retained kinematic Rigidbody is no longer used as the movement authority.

**Reason:** Build #4 physical telemetry showed full joystick input, commanded speed `28.0`, and requested distance `123.7`, while the actual root position remained at its spawn coordinates. The controller called `Rigidbody.MovePosition` and then wrote rotation directly through `transform.rotation` in the same fixed step, while distance telemetry counted the requested displacement regardless of the resolved pose.

**Evidence:** Android Build #4 screenshot and device telemetry recorded in `Docs/DEVICE_TEST_LOG.md`.

**Rejected alternative:** Another camera-only adjustment. The root position itself did not change, so camera tuning alone cannot repair the failure.

**Revisit condition:** Replace transform-authoritative motion only when the player storm gains a deliberate collision-driven physics contract and automated movement tests verify resolved translation.

## 2026-07-24 - Keep Build #4.1 on one graphics API and one runtime material family

**Decision:** Build #4.1 generates only Built-in runtime material templates and targets Vulkan only for the current physical-device gate.

**Reason:** Build #4 generated unused URP Lit material assets while running the Built-in pipeline and targeted both Vulkan and OpenGLES3. That forced an extremely expensive shader preparation pass without improving the actual device presentation.

**Revisit condition:** Restore multi-API output and authored URP assets after shader stripping, pipeline configuration, and device-matrix requirements are explicit.

## 2026-07-24 - Enforce camera safety in viewport space

**Decision:** Keep approved storm movement speeds and make the camera responsible for keeping the player storm visible. Build #4.2 combines a smaller world-space leash with viewport-aware soft catch-up and immediate hard-edge recovery.

**Reason:** Build #4.1 proved both storms translate correctly, but the fast Tornado can leave the camera frame. Slowing the Tornado would hide the camera defect and weaken storm differentiation.

**Evidence:** Physical Android testing of Build #4.1 confirmed good Supercell speed, successful Tornado movement, and Tornado camera escape.

**Rejected alternatives:** Reducing Tornado speed, returning to hard follow at all times, or treating the off-screen player as acceptable.

**Revisit condition:** Replace this camera contract only when a tested authored camera system provides equal or better containment, motion readability, and distinct Tornado/Supercell feel.
