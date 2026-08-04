// ============================================================================
// [SW:ARCH:GAME_CONTEXT]
// Shared Phase 5 ownership for presentation, world, and legacy boundary.
// ============================================================================

import type { AbilitySystem } from '../abilities/ability-system';
import type { GameClocks } from '../core/clocks';
import type { InputSystem } from '../input/input-system';
import type { ScoringSystem } from '../gameplay/scoring/scoring-system';
import type { DistrictSystem } from '../gameplay/districts/district-system';
import type { CampaignSystem } from '../gameplay/campaign/campaign-system';
import type { CampaignStore } from '../platform/persistence/campaign-store';
import type { RendererSystem } from '../presentation/renderer/renderer-system';
import type { SceneSystem } from '../presentation/scene/scene-system';
import type { CameraSystem } from '../presentation/camera/camera-system';
import type { AtmosphereSystem } from '../presentation/atmosphere/atmosphere-system';
import type { TornadoPresentationSystem } from '../presentation/tornado/tornado-presentation-system';
import type { WorldSystem } from '../world/world-system';
import type { DestructibleSetpieceSystem } from '../world/setpieces/destructible-setpiece-system';
import type { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

export interface BuildIdentity {
  readonly productName: 'Severe Weather Warning';
  readonly version: string;
  readonly label: string;
  readonly renderer: 'Three.js r128';
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-5-rendering-world';
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
    legacy,
    document,
    window,
  });
}
