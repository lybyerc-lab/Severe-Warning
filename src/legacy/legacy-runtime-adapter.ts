// ============================================================================
// [SW:ARCH:LEGACY_ADAPTER]
// The only modern module allowed to know legacy global names.
// ============================================================================

import type { AbilitySystem, AbilitySnapshot } from '../abilities/ability-system.ts';
import type { GameClocks, LegacyClockSample, LegacyClockSampleInput, ClockSnapshot } from '../core/clocks.ts';
import type { InputSystem, MovementVector, InputSnapshot } from '../input/input-system.ts';
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
import type {
  QaScenarioId,
  QaSnapshot,
  SevereWeatherQaBridge,
} from '../qa/bridge/severe-weather-qa-bridge.ts';

interface LegacyRunState {
  readonly runActive: boolean;
  readonly paused: boolean;
  readonly remainingSeconds: number;
  readonly stage: number;
  readonly gameStarted: boolean;
}

interface LegacyClockBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly latestSample: LegacyClockSample;
  readonly authority: ClockSnapshot | null;
  readonly legacy: LegacyRunState;
}

interface LegacyClockBridge {
  readonly version: string;
  attach(authority: GameClocks): boolean;
  sample(input: LegacyClockSampleInput): LegacyClockSample;
  reset(durationSeconds: number, nowMs?: number): void;
  resume(nowMs?: number): void;
  getLegacyRunState(): LegacyRunState;
  getSnapshot(): LegacyClockBridgeSnapshot;
}

export interface LegacyInputAbilityBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly movement: MovementVector;
  readonly input: InputSnapshot | null;
  readonly abilities: AbilitySnapshot | null;
  readonly abilityRequests: number;
  readonly suppressedDuplicates: number;
  readonly legacy: Readonly<{
    joystickActive: boolean;
    joystickX: number;
    joystickZ: number;
  }>;
}

interface LegacyInputAbilityBridge {
  readonly version: string;
  attach(inputAuthority: InputSystem, abilityAuthority: AbilitySystem): boolean;
  getMovement(): MovementVector;
  getSnapshot(): LegacyInputAbilityBridgeSnapshot;
  reset(): void;
}

export interface LegacyScoringCampaignBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly score: unknown;
  readonly district: unknown;
  readonly campaign: unknown;
  readonly persistence: unknown;
}

interface LegacyScoringCampaignBridge {
  readonly version: string;
  attach(
    scoringAuthority: ScoringSystem,
    districtAuthority: DistrictSystem,
    campaignAuthority: CampaignSystem,
    persistenceAuthority: CampaignStore,
  ): boolean;
  syncFromLegacy(): unknown;
  reset(): void;
  runContractProbe(): unknown;
  getSnapshot(): LegacyScoringCampaignBridgeSnapshot;
}

export interface LegacyPresentationWorldBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly renderer: unknown;
  readonly scene: unknown;
  readonly camera: unknown;
  readonly atmosphere: unknown;
  readonly tornado: unknown;
  readonly world: unknown;
  readonly setpieces: unknown;
  readonly live: unknown;
}

interface LegacyPresentationWorldBridge {
  readonly version: string;
  attach(
    renderer: RendererSystem,
    scene: SceneSystem,
    camera: CameraSystem,
    atmosphere: AtmosphereSystem,
    tornado: TornadoPresentationSystem,
    world: WorldSystem,
    hartFarm: DestructibleSetpieceSystem,
    secondStructure: DestructibleSetpieceSystem,
  ): boolean;
  latchPresentationFrame(timestamp?: number): unknown;
  unlatchPresentation(): boolean;
  syncFromLegacy(): unknown;
  reset(): void;
  runContractProbe(): unknown;
  getSnapshot(): LegacyPresentationWorldBridgeSnapshot;
}

export interface LegacyUiBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly hud: unknown;
  readonly feedback: unknown;
  readonly transitions: unknown;
  readonly results: unknown;
}

interface LegacyUiBridge {
  readonly version: string;
  attach(uiAuthority: UISubsystem): boolean;
  syncFromLegacy(): unknown;
  reset(): void;
  runContractProbe(): unknown;
  getSnapshot(): LegacyUiBridgeSnapshot;
}

export interface LegacyAudioTrafficBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly audio: unknown;
  readonly traffic: unknown;
}

interface LegacyAudioTrafficBridge {
  readonly version: string;
  attach(audioAuthority: AudioSystem, trafficAuthority: TrafficSystem): boolean;
  syncFromLegacy(): unknown;
  reset(): void;
  runContractProbe(): unknown;
  getSnapshot(): LegacyAudioTrafficBridgeSnapshot;
}

export interface LegacyEngineBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly physics: unknown;
  readonly vfx: unknown;
  readonly loop: unknown;
}

interface LegacyEngineBridge {
  readonly version: string;
  attach(
    physicsAuthority: TornadoPhysicsSystem,
    vfxAuthority: ParticleSystem,
    loopAuthority: GameLoopController,
  ): boolean;
  syncFromLegacy(): unknown;
  reset(): void;
  runContractProbe(): unknown;
  getSnapshot(): LegacyEngineBridgeSnapshot;
}

interface LegacyRuntimeGlobals {
  __SW_PRODUCTION_SLICE_READY__?: boolean;
  __SW_V510_UPDATE__?: (deltaSeconds: number, nowMs: number, isMoving: boolean) => void;
  __SW_V510_REBUILD__?: () => void;
  __SW_PHASE2_CLOCK_BRIDGE__?: LegacyClockBridge;
  __SW_PHASE3_INPUT_ABILITY_BRIDGE__?: LegacyInputAbilityBridge;
  __SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?: LegacyScoringCampaignBridge;
  __SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?: LegacyPresentationWorldBridge;
  __SW_PHASE6_UI_BRIDGE__?: LegacyUiBridge;
  __SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?: LegacyAudioTrafficBridge;
  __SW_PHASE8_ENGINE_BRIDGE__?: LegacyEngineBridge;
  triggerProductionSliceQa?: (mode?: string) => boolean;
  getProductionSliceQaState?: () => QaSnapshot;
}

export interface LegacyRuntimeStatus {
  readonly ready: boolean;
  readonly hasUpdate: boolean;
  readonly hasRebuild: boolean;
  readonly hasQaTrigger: boolean;
  readonly hasQaSnapshot: boolean;
  readonly hasClockBridge: boolean;
  readonly hasInputAbilityBridge: boolean;
  readonly hasScoringCampaignBridge: boolean;
  readonly hasPresentationWorldBridge: boolean;
  readonly hasUiBridge: boolean;
  readonly hasAudioTrafficBridge: boolean;
  readonly hasEngineBridge: boolean;
}

export class LegacyRuntimeAdapter implements SevereWeatherQaBridge {
  readonly #globals: LegacyRuntimeGlobals;

  constructor(globals: LegacyRuntimeGlobals = globalThis as LegacyRuntimeGlobals) {
    this.#globals = globals;
  }

  getStatus(): LegacyRuntimeStatus {
    return Object.freeze({
      ready: this.#globals.__SW_PRODUCTION_SLICE_READY__ === true,
      hasUpdate: typeof this.#globals.__SW_V510_UPDATE__ === 'function',
      hasRebuild: typeof this.#globals.__SW_V510_REBUILD__ === 'function',
      hasQaTrigger: typeof this.#globals.triggerProductionSliceQa === 'function',
      hasQaSnapshot: typeof this.#globals.getProductionSliceQaState === 'function',
      hasClockBridge: this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.version === 'MODERNIZATION_PHASE2_CLOCKS_V1',
      hasInputAbilityBridge: this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.version === 'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
      hasScoringCampaignBridge: this.#globals.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?.version === 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2',
      hasPresentationWorldBridge: this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.version === 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2',
      hasUiBridge: this.#globals.__SW_PHASE6_UI_BRIDGE__?.version === 'MODERNIZATION_PHASE6_UI_V1',
      hasAudioTrafficBridge: this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.version === 'MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1',
      hasEngineBridge: this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.version === 'MODERNIZATION_PHASE8_ENGINE_V1',
    });
  }

  async waitUntilReady(timeoutMs = 15_000): Promise<void> {
    const startedAt = performance.now();
    while (!this.getStatus().ready) {
      if (performance.now() - startedAt >= timeoutMs) {
        throw new Error(`Legacy Three.js runtime did not become ready within ${timeoutMs}ms.`);
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
    }
    this.assertRequiredContracts();
  }

  attachClocks(clocks: GameClocks): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.attach(clocks);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 2 clock authority.');
  }

  attachInputAbilities(input: InputSystem, abilities: AbilitySystem): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.attach(input, abilities);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 3 input and ability authorities.');
  }

  attachScoringCampaign(
    scoring: ScoringSystem,
    district: DistrictSystem,
    campaign: CampaignSystem,
    persistence: CampaignStore,
  ): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?.attach(
      scoring,
      district,
      campaign,
      persistence,
    );
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 4 scoring and campaign mirrors.');
  }

  attachPresentationWorld(
    renderer: RendererSystem,
    scene: SceneSystem,
    camera: CameraSystem,
    atmosphere: AtmosphereSystem,
    tornado: TornadoPresentationSystem,
    world: WorldSystem,
    hartFarm: DestructibleSetpieceSystem,
    secondStructure: DestructibleSetpieceSystem,
  ): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.attach(
      renderer,
      scene,
      camera,
      atmosphere,
      tornado,
      world,
      hartFarm,
      secondStructure,
    );
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 5 presentation and world mirrors.');
  }

  attachUi(ui: UISubsystem): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE6_UI_BRIDGE__?.attach(ui);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 6 UI authority.');
  }

  attachAudioTraffic(audio: AudioSystem, traffic: TrafficSystem): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.attach(audio, traffic);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 7 Audio & Traffic authorities.');
  }

  attachEngine(
    physics: TornadoPhysicsSystem,
    vfx: ParticleSystem,
    loop: GameLoopController,
  ): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.attach(physics, vfx, loop);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 8 Engine authorities.');
  }

  getRunState(): LegacyRunState {
    this.assertRequiredContracts();
    const state = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.getLegacyRunState();
    if (!state) throw new Error('Legacy runtime returned no run-state snapshot.');
    return Object.freeze({ ...state });
  }

  getClockBridgeSnapshot(): LegacyClockBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no clock-bridge snapshot.');
    return snapshot;
  }

  getInputAbilityBridgeSnapshot(): LegacyInputAbilityBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no input and ability bridge snapshot.');
    return snapshot;
  }

  getScoringCampaignBridgeSnapshot(): LegacyScoringCampaignBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no scoring and campaign bridge snapshot.');
    return snapshot;
  }

  getPresentationWorldBridgeSnapshot(): LegacyPresentationWorldBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no presentation and world bridge snapshot.');
    return snapshot;
  }

  getUiBridgeSnapshot(): LegacyUiBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE6_UI_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no UI bridge snapshot.');
    return snapshot;
  }

  getAudioTrafficBridgeSnapshot(): LegacyAudioTrafficBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no Audio & Traffic bridge snapshot.');
    return snapshot;
  }

  getEngineBridgeSnapshot(): LegacyEngineBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no Engine bridge snapshot.');
    return snapshot;
  }

  runPresentationWorldContractProbe(): unknown {
    this.assertRequiredContracts();
    return this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.runContractProbe();
  }

  runUiContractProbe(): unknown {
    this.assertRequiredContracts();
    return this.#globals.__SW_PHASE6_UI_BRIDGE__?.runContractProbe();
  }

  runAudioTrafficContractProbe(): unknown {
    this.assertRequiredContracts();
    return this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.runContractProbe();
  }

  runEngineContractProbe(): unknown {
    this.assertRequiredContracts();
    return this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.runContractProbe();
  }

  latchPresentationFrame(timestamp = 1000): unknown {
    this.assertRequiredContracts();
    return this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.latchPresentationFrame(timestamp);
  }

  unlatchPresentation(): boolean {
    this.assertRequiredContracts();
    return Boolean(this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.unlatchPresentation());
  }

  renderFrame(): void {
    this.assertRequiredContracts();
    this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.latchPresentationFrame(1000);
  }

  async prepareScenario(id: QaScenarioId): Promise<void> {
    this.assertRequiredContracts();
    if (id !== 'production-hero') throw new Error(`Unsupported QA scenario: ${id}`);
    const prepared = this.#globals.triggerProductionSliceQa?.('hero');
    if (prepared !== true) throw new Error('Legacy production hero scenario did not initialize.');

    this.synchronizeClockFromLegacy();
    this.#globals.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE6_UI_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.syncFromLegacy();
  }

  advance(milliseconds: number): void {
    this.assertRequiredContracts();
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new Error(`QA advance requires a non-negative finite duration, received ${milliseconds}.`);
    }
    const now = performance.now();
    this.#globals.__SW_V510_UPDATE__?.(milliseconds / 1000, now, false);
    this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE6_UI_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.syncFromLegacy();
    this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.syncFromLegacy();
  }

  getSnapshot(): QaSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.getProductionSliceQaState?.();
    if (!snapshot) throw new Error('Legacy runtime returned no QA snapshot.');
    return Object.freeze({ ...snapshot });
  }

  reset(): void {
    this.assertRequiredContracts();
    this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset();
    this.#globals.__SW_V510_REBUILD__?.();
    this.#globals.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__?.reset();
    this.#globals.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.reset();
    this.#globals.__SW_PHASE6_UI_BRIDGE__?.reset();
    this.#globals.__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__?.reset();
    this.#globals.__SW_PHASE8_ENGINE_BRIDGE__?.reset();
    this.synchronizeClockFromLegacy();
  }

  private synchronizeClockFromLegacy(): LegacyClockSample {
    const bridge = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__;
    if (!bridge) throw new Error('Legacy runtime clock bridge is unavailable.');
    const state = bridge.getLegacyRunState();
    return bridge.sample({
      nowMs: performance.now(),
      runActive: state.runActive,
      paused: state.paused,
      remainingSeconds: state.remainingSeconds,
    });
  }

  private assertRequiredContracts(): void {
    const status = this.getStatus();
    const missing = Object.entries(status)
      .filter(([, present]) => present !== true)
      .map(([name]) => name);
    if (missing.length > 0) throw new Error(`Legacy runtime contract is incomplete: ${missing.join(', ')}`);
  }
}
