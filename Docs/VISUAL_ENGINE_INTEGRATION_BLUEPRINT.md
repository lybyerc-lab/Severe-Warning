# Visual Engine Integration Blueprint

## Governing law

The current game is the control. No renderer work ships unless it clearly improves the game without weakening accepted behavior.

## Stage A — isolated control and laboratory

Production remains entirely Three.js. `Experiments/VisualEngineLab/` remains entirely Babylon.js. No shared runtime dependency, workflow, APK, or production source modification.

Rollback: delete or abandon the laboratory branch; production is unchanged.

## Stage B — read-only production adapter

Add a separately reviewed adapter that exports versioned world snapshots and visual events from stable production anchors. It cannot mutate gameplay or own inputs, clocks, damage, scoring, audio, UI, campaign, or persistence.

Rollback: disable the adapter flag; Three.js continues normally.

## Stage C — recorded-event replay

Capture deterministic production events and snapshots, then replay them offline inside Babylon. Compare IDs, timestamps, transforms, stage changes, event counts, and cleanup results.

Rollback: keep recordings as QA fixtures; remove the consumer.

## Stage D — renderer comparison

Replay the identical gameplay sequence in Three.js and Babylon at matched camera/viewport/quality targets. Capture normal-distance screenshots and video, not beauty-shot-only evidence.

Rollback: no runtime decision has changed.

## Stage E — engineering comparison

Measure input latency, route and target readability, destruction readability, FPS/frame-time distribution, draw calls, triangles, memory, loading, bundle size, reset growth, WebView lifecycle, heat, and battery. Include Low/Balanced and at least one non-flagship class.

Rollback: reject Babylon or transfer only useful techniques.

## Stage F — controlled integration experiment

Only after clear superiority, test a feature-flagged renderer host using the same contract. Three.js remains the default and rollback path. UI/audio/gameplay continue outside both renderers.

Rollback: one configuration switch returns to Three.js; no save migration is allowed.

## Stage G — physical adoption decision

Only after exact APK testing and Galaxy S26 Ultra acceptance may broader production adoption be considered. Acceptance also requires regression results on the eventual minimum-device class.

Rollback: retain the accepted Three.js artifact, source branch, package identity, and save schema.

## Decision outcomes

The valid outcomes are not merely “migrate” or “fail.” Babylon may prove an asset workflow, destruction staging, layered tornado, diagnostics approach, quality governor, or Cow animation that should be reimplemented in Three.js. Migration cost, bundle/startup cost, maintenance, and Android behavior are first-class evidence.

