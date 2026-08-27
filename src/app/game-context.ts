// ============================================================================
// [SW:ARCH:GAME_CONTEXT]
// Shared Phase 8 ownership for presentation, world, UI, audio, traffic, and physics engine.
// ============================================================================

import type { AbilitySystem } from '../abilities/ability-system.ts';
import type { GameClocks } from '../core/clocks.ts';
import type { InputSystem } from '../input/input-system.ts';
import type { ScoringSystem } from '../gameplay/scoring/scoring-system.ts';
import type { DistrictSystem } from '../gameplay/districts/district-system.ts';
import type { CampaignSystem } from '../gameplay/campaign/campaign-system.ts';
import type { CampaignStore } from '../platform/persistence/campaign-store.ts';
import type { RendererSystem } from '../presentation/renderer/renderer-system.ts';
import type { SceneSystem } from '../presentation/scene/scene-system.ts';
import type { CameraSystem } from '../presentation/camera/camera-system.ts';
import type { AtmosphereSystem } from '../presentation/atmosphere/atmosphere-system.ts';
import type { TornadoPresentationSystem } from '../presentation/tornado/tornado-presentation-system.ts';
import type { WorldSystem } from '../world/world-system.ts';
import type { DestructibleSetpieceSystem } from '../world/setpieces/destructible-setpiece-system.ts';
import type { UISubsystem } from '../ui/ui-system.ts';
import type { AudioSystem } from '../audio/audio-system.ts';
import type { TrafficSystem } from '../gameplay/traffic/traffic-system.ts';
import type { TornadoPhysicsSystem } from '../gameplay/physics/tornado-physics-system.ts';
import type { ParticleSystem } from '../presentation/vfx/particle-system.ts';
import type { GameLoopController } from '../gameplay/loop/game-loop-controller.ts';
import type { MoolahSystem } from '../gameplay/economy/moolah-system.ts';
import type { MooBrewOpeningCinematic } from '../presentation/cinematics/moo-brew-opening-cinematic.ts';
import type { NewspaperPresentationSystem } from '../ui/newspaper/newspaper-presentation-system.ts';
import type { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter.ts';

export interface BuildIdentity {
  readonly productName: 'Severe Weather Warning';
  readonly version: string;
  readonly label: string;
  readonly renderer: 'Three.js r128';
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-5-rendering-world' | 'phase-6-hud-ui' | 'phase-7-audio-traffic' | 'phase-8-engine';
}

export interface GameContext {
  readonly build: BuildIdentity;
  readonly clocks: GameClocks;
  readonly input: InputSystem;
  readonly abilities: AbilitySystem;
  readonly scoring: ScoringSystem;
  readonly district: DistrictSystem;
  readonly campaign: CampaignSystem;
  readonly persistence: CampaignStore;
  readonly renderer: RendererSystem;
  readonly scene: SceneSystem;
  readonly camera: CameraSystem;
  readonly atmosphere: AtmosphereSystem;
  readonly tornado: TornadoPresentationSystem;
  readonly world: WorldSystem;
  readonly hartFarm: DestructibleSetpieceSystem;
  readonly silo: DestructibleSetpieceSystem;
  readonly ui: UISubsystem;
  readonly audio: AudioSystem;
  readonly traffic: TrafficSystem;
  readonly physics: TornadoPhysicsSystem;
  readonly vfx: ParticleSystem;
  readonly loop: GameLoopController;
  readonly moolah: MoolahSystem;
  readonly cinematic: MooBrewOpeningCinematic;
  readonly newspaper: NewspaperPresentationSystem;
  readonly legacy: LegacyRuntimeAdapter;
  readonly document: Document;
  readonly window: Window;
}

export function createGameContext(
  legacy: LegacyRuntimeAdapter,
  clocks: GameClocks,
  input: InputSystem,
  abilities: AbilitySystem,
  scoring: ScoringSystem,
  district: DistrictSystem,
  campaign: CampaignSystem,
  persistence: CampaignStore,
  renderer: RendererSystem,
  scene: SceneSystem,
  camera: CameraSystem,
  atmosphere: AtmosphereSystem,
  tornado: TornadoPresentationSystem,
  world: WorldSystem,
  hartFarm: DestructibleSetpieceSystem,
  silo: DestructibleSetpieceSystem,
  ui: UISubsystem,
  audio: AudioSystem,
  traffic: TrafficSystem,
  physics: TornadoPhysicsSystem,
  vfx: ParticleSystem,
  loop: GameLoopController,
  moolah: MoolahSystem,
  cinematic: MooBrewOpeningCinematic,
  newspaper: NewspaperPresentationSystem,
  version: string,
  label: string,
): GameContext {
  return Object.freeze({
    build: Object.freeze({
      productName: 'Severe Weather Warning',
      version,
      label,
      renderer: 'Three.js r128',
      architecture: 'modern-shell-v1',
      modernizationPhase: 'phase-5-rendering-world',
    }),
    clocks,
    input,
    abilities,
    scoring,
    district,
    campaign,
    persistence,
    renderer,
    scene,
    camera,
    atmosphere,
    tornado,
    world,
    hartFarm,
    silo,
    ui,
    audio,
    traffic,
    physics,
    vfx,
    loop,
    moolah,
    cinematic,
    newspaper,
    legacy,
    document,
    window,
  });
}
