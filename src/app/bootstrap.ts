// ============================================================================
// [SW:ARCH:BOOTSTRAP]
// Creates the modern shell and attaches Phase 2 clocks, Phase 3 controls,
// Phase 4 scoring/campaign, Phase 5 rendering/world, Phase 6 UI, and Phase 7 audio/traffic.
// ============================================================================

import { AbilitySystem } from '../abilities/ability-system';
import { GameClocks } from '../core/clocks';
import { InputSystem } from '../input/input-system';
import { ScoringSystem } from '../gameplay/scoring/scoring-system';
import { DistrictSystem } from '../gameplay/districts/district-system';
import { CampaignSystem } from '../gameplay/campaign/campaign-system';
import { CampaignStore } from '../platform/persistence/campaign-store';
import { RendererSystem } from '../presentation/renderer/renderer-system';
import { SceneSystem } from '../presentation/scene/scene-system';
import { CameraSystem } from '../presentation/camera/camera-system';
import { AtmosphereSystem } from '../presentation/atmosphere/atmosphere-system';
import { TornadoPresentationSystem } from '../presentation/tornado/tornado-presentation-system';
import { WorldSystem } from '../world/world-system';
import { DestructibleSetpieceSystem } from '../world/setpieces/destructible-setpiece-system';
import { HART_FARM_SETPIECE_DEFINITION } from '../world/setpieces/hart-farm-definition';
import { GRAIN_SILO_SETPIECE_DEFINITION } from '../world/setpieces/second-structure-definition';
import { UISubsystem } from '../ui/ui-system';
import { AudioSystem } from '../audio/audio-system';
import { TrafficSystem } from '../gameplay/traffic/traffic-system';
import { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';
import { GameApp } from './game-app';
import { createGameContext } from './game-context';

declare const __SW_BUILD_VERSION__: string;
declare const __SW_BUILD_LABEL__: string;

export interface SevereWeatherModernShell {
  readonly app: GameApp;
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
  readonly qa: LegacyRuntimeAdapter;
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-5-rendering-world';
}

export async function bootstrapSevereWeather(): Promise<SevereWeatherModernShell> {
  const legacy = new LegacyRuntimeAdapter();
  const clocks = new GameClocks();
  const input = new InputSystem();
  const abilities = new AbilitySystem();
  const scoring = new ScoringSystem();
  const district = new DistrictSystem();
  const persistence = new CampaignStore();
  const campaign = new CampaignSystem(persistence);
  const renderer = new RendererSystem();
  const scene = new SceneSystem();
  const camera = new CameraSystem();
  const atmosphere = new AtmosphereSystem();
  const tornado = new TornadoPresentationSystem();
  const world = new WorldSystem();
  const hartFarm = new DestructibleSetpieceSystem(HART_FARM_SETPIECE_DEFINITION);
  const silo = new DestructibleSetpieceSystem(GRAIN_SILO_SETPIECE_DEFINITION);
  const ui = new UISubsystem();
  const audio = new AudioSystem();
  const traffic = new TrafficSystem();

  const context = createGameContext(
    legacy,
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
    __SW_BUILD_VERSION__,
    __SW_BUILD_LABEL__,
  );
  const app = new GameApp(context);

  await app.initialize();

  return Object.freeze({
    app,
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
    qa: legacy,
    architecture: 'modern-shell-v1',
    modernizationPhase: 'phase-5-rendering-world',
  });
}
