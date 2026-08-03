import {
  ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight, Scene, ShadowGenerator, Vector3
} from '@babylonjs/core';
import { CowSystem, type CowState } from '../animals/cow-system';
import type { BenchmarkResult, VisualMetrics } from '../contracts/metrics-contract';
import type { QualityTier } from '../contracts/quality-profile';
import type { VisualEvent } from '../contracts/visual-events';
import { createGameplayCamera } from '../camera/gameplay-camera';
import { BarnDestructionSystem } from '../destruction/barn-destruction';
import type { DestructionStage } from '../destruction/destruction-state';
import { DiagnosticsHud } from '../diagnostics/diagnostics-hud';
import { VisualEventBus } from '../events/event-bus';
import { MaterialLibrary } from '../materials/material-library';
import { QualityGovernor } from '../quality/quality-governor';
import { BenchmarkReplay } from '../replay/benchmark-replay';
import { BENCHMARK_SEED } from '../replay/benchmark-timeline';
import { TornadoSystem } from '../storm/tornado-system';
import { BenchmarkWorld } from '../world/benchmark-world';

// [SW:LAB:ENGINE_LIFECYCLE]
// Own one Babylon engine/scene and dispose every listener and resource explicitly.

export interface VisualLabQaState {
  ready: boolean;
  completed: boolean;
  accelerated: boolean;
  replayTimeMs: number;
  eventCount: number;
  barnState: string;
  cowState: string;
  cow17Safe: boolean;
  activeDebris: number;
  activeParticles: number;
  quality: QualityTier;
  rendererPath: 'webgl2';
  lastResult: BenchmarkResult | null;
  metrics: VisualMetrics | null;
}

export class VisualLabApp {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly events = new VisualEventBus();
  readonly replay: BenchmarkReplay;
  readonly quality: QualityGovernor;
  private readonly materials: MaterialLibrary;
  private readonly world: BenchmarkWorld;
  private readonly tornado: TornadoSystem;
  private readonly barn: BarnDestructionSystem;
  private readonly cow: CowSystem;
  private readonly diagnostics: DiagnosticsHud;
  private readonly camera: ArcRotateCamera;
  private readonly shadowGenerator: ShadowGenerator;
  private readonly cleanupCallbacks: Array<() => void> = [];
  private pausedByVisibility = false;
  private wind = 0.1;
  private lightningTimer = 0;
  private cowCamTimer = 0;
  private lastMetrics: VisualMetrics | null = null;
  private lastResult: BenchmarkResult | null = null;
  private peakDebris = 0;
  private peakParticles = 0;
  private peakActiveMeshes = 0;
  private peakMaterials = 0;
  private stateTransitions: string[] = [];
  private consoleErrors: string[] = [];
  private unhandledRejections: string[] = [];

  constructor(private readonly canvas: HTMLCanvasElement, initialQuality: QualityTier = 'balanced') {
    this.engine = new Engine(canvas, true, {
      antialias: true,
      preserveDrawingBuffer: false,
      stencil: true,
      disableWebGL2Support: false,
      powerPreference: 'high-performance'
    }, false);
    if (this.engine.webGLVersion < 2) {
      this.engine.dispose();
      throw new Error('The Visual Engine Laboratory requires WebGL 2.');
    }
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.025, 0.055, 0.09, 1);
    this.scene.fogMode = Scene.FOGMODE_EXP2;
    this.scene.fogColor = new Color3(0.16, 0.24, 0.3);
    this.scene.fogDensity = 0.0065;
    this.camera = createGameplayCamera(this.scene, canvas);
    this.quality = new QualityGovernor(this.engine, initialQuality);
    this.materials = new MaterialLibrary(this.scene);

    const sky = new HemisphericLight('storm-sky-light', new Vector3(-0.2, 1, 0.3), this.scene);
    sky.intensity = 0.82;
    sky.diffuse = new Color3(0.64, 0.76, 0.88);
    sky.groundColor = new Color3(0.3, 0.22, 0.16);
    const sun = new DirectionalLight('late-day-directional', new Vector3(-0.65, -1, 0.42), this.scene);
    sun.position.set(45, 75, -55);
    sun.intensity = 1.55;
    sun.diffuse = new Color3(1, 0.82, 0.57);
    this.shadowGenerator = new ShadowGenerator(this.quality.current.shadowResolution, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 18;

    this.world = new BenchmarkWorld(this.scene, this.materials, this.quality.current);
    this.tornado = new TornadoSystem(this.scene, this.materials, this.quality.current);
    this.barn = new BarnDestructionSystem(this.scene, this.materials, this.quality.current);
    this.cow = new CowSystem(this.scene, this.materials, this.quality.current);
    this.cow.setLandingTarget(this.world.hayLanding);
    this.replay = new BenchmarkReplay(this.events);
    this.diagnostics = new DiagnosticsHud(
      this.requiredElement('diagnostics'), this.engine, this.scene, this.quality, this.events, this.replay,
      () => ({ activeDebris: this.barn.activeDebris, activeAnimals: 1, activeParticles: this.tornado.activeParticleCount })
    );
    this.bindEvents();
    this.bindControls();
    this.bindLifecycle();
    this.applyQuality(this.quality.current.tier);
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      const dt = Math.min(0.05, this.engine.getDeltaTime() / 1000);
      this.replay.update(dt);
      const time = this.replay.timeMs / 1000;
      this.world.update(time, this.wind);
      this.tornado.update(time, dt);
      this.barn.update(dt);
      this.cow.update(dt);
      this.updatePresentation(dt);
      this.lastMetrics = this.diagnostics.update(performance.now());
      this.capturePeaks(this.lastMetrics);
      this.scene.render();
    });
    this.replay.start();
  }

  reset(): void {
    this.replay.reset();
    this.events.resetCount();
    this.tornado.reset();
    this.barn.reset();
    this.cow.reset();
    this.wind = 0.1;
    this.lightningTimer = 0;
    this.cowCamTimer = 0;
    this.camera.setTarget(new Vector3(4, 3, 2));
    this.camera.radius = 112;
    this.stateTransitions = [];
    this.peakDebris = 0;
    this.peakParticles = 0;
    this.peakActiveMeshes = 0;
    this.peakMaterials = 0;
    this.setStatus('CALM TOWN · REPLAY READY');
  }

  replayFromStart(): void {
    this.reset();
    this.replay.start();
  }

  applyQuality(tier: QualityTier): void {
    this.quality.setTier(tier);
    const profile = this.quality.current;
    this.world.applyQuality(profile);
    this.tornado.applyQuality(profile);
    this.barn.applyQuality(profile);
    this.cow.applyQuality(profile);
    this.shadowGenerator.getShadowMap()?.renderList?.splice(0);
    if (profile.shadows) {
      for (const mesh of this.scene.meshes.filter((candidate) => candidate.isVisible).slice(0, profile.shadowCasters)) {
        this.shadowGenerator.addShadowCaster(mesh);
      }
    }
  }

  getQaState(): VisualLabQaState {
    return {
      ready: this.scene.isReady(),
      completed: this.replay.completed,
      accelerated: this.replay.accelerated,
      replayTimeMs: this.replay.timeMs,
      eventCount: this.events.eventCount,
      barnState: this.barn.stage,
      cowState: this.cow.state,
      cow17Safe: this.cow.safeAnimal && !this.cow.targetable && !this.cow.damageScoring,
      activeDebris: this.barn.activeDebris,
      activeParticles: this.tornado.activeParticleCount,
      quality: this.quality.current.tier,
      rendererPath: 'webgl2',
      lastResult: this.lastResult,
      metrics: this.lastMetrics
    };
  }

  dispose(): void {
    this.engine.stopRenderLoop();
    for (const callback of this.cleanupCallbacks.splice(0)) callback();
    this.events.dispose();
    this.quality.dispose();
    this.cow.dispose();
    this.barn.dispose();
    this.tornado.dispose();
    this.world.dispose();
    this.shadowGenerator.dispose();
    this.materials.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }

  private bindEvents(): void {
    this.cleanupCallbacks.push(this.events.on('*', (event) => this.consumeEvent(event)));
  }

  private consumeEvent(event: VisualEvent): void {
    this.stateTransitions.push(event.type);
    const position = event.payload.position;
    if (event.type === 'storm.spawned' || event.type === 'storm.moved') {
      if (position) this.tornado.setPosition(new Vector3(position.x, position.y, position.z));
    }
    if (event.type === 'storm.intensity.changed') this.tornado.setIntensity(event.payload.intensity ?? 0.5);
    if (event.type === 'district.atmosphere.changed') this.wind = Number(event.payload.presentationHints?.wind ?? 0.25);
    if (event.type === 'gust.fired') this.wind = Math.max(this.wind, event.payload.intensity ?? 0.7);
    if (event.type === 'grid-zap.fired') {
      this.lightningTimer = 0.3;
      this.tornado.setLightningIllumination(true);
    }
    if (event.type === 'building.damaged') this.barn.setStage('damaged');
    if (event.type === 'building.damage-stage.changed') {
      const stages: DestructionStage[] = ['intact', 'damaged', 'exposed', 'partial-collapse', 'wreckage'];
      this.barn.setStage(stages[event.payload.damageStage ?? 0] ?? 'damaged');
    }
    if (event.type === 'building.collapsed') this.barn.setStage('wreckage');
    const cowStateByEvent: Partial<Record<VisualEvent['type'], CowState>> = {
      'cow.noticed-storm': 'notice', 'cow.double-take': 'double-take',
      'cow.braced': 'brace', 'cow.slid': 'slide', 'cow.front-lift': 'front-lift',
      'cow.launched': 'launch', 'cow.entered-orbit': 'orbit',
      'cow.landed-safely': 'safe-landing', 'cow.recovered': 'recovery',
      'cow.offended-stare': 'offended-stare'
    };
    const cowState = cowStateByEvent[event.type];
    if (cowState) this.cow.setState(cowState);
    if (event.type === 'cow-cam.triggered') {
      this.cowCamTimer = (event.payload.durationMs ?? 3000) / 1000;
      this.setStatus('COW-CAM · COW 17 AIRBORNE · INJURIES 0');
    }
    if (event.payload.headline) this.setBroadcast(event.payload.headline);
    if (event.type === 'media.moment.captured') this.setStatus('MOO BREW LIVE · COW-CAM FOOTAGE CAPTURED');
    if (event.type === 'world.reset') this.completeAndReset();
  }

  private completeAndReset(): void {
    const finalBarn = this.barn.stage;
    const finalCow = this.cow.state;
    const eventCount = this.events.eventCount;
    this.barn.reset();
    this.cow.reset();
    this.tornado.reset();
    const resetPassed = this.barn.stage === 'intact' && this.barn.activeDebris === 0 && this.cow.state === 'idle';
    this.lastResult = {
      schemaVersion: 'visual-benchmark-result.v1',
      completed: true,
      accelerated: this.replay.accelerated,
      eventCount,
      stateTransitions: [...this.stateTransitions],
      peakDebris: this.peakDebris,
      peakParticles: this.peakParticles,
      peakActiveMeshes: this.peakActiveMeshes,
      peakMaterialCount: this.peakMaterials,
      consoleErrors: [...this.consoleErrors],
      unhandledRejections: [...this.unhandledRejections],
      barnState: finalBarn,
      cowState: finalCow,
      resetPassed
    };
    this.setStatus(resetPassed ? 'REPLAY COMPLETE · CLEAN RESET PASSED' : 'REPLAY COMPLETE · RESET FAILED');
    window.dispatchEvent(new CustomEvent('visual-lab-complete', { detail: this.lastResult }));
  }

  private updatePresentation(dt: number): void {
    this.wind = Math.max(0.1, this.wind - dt * 0.045);
    if (this.lightningTimer > 0) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) this.tornado.setLightningIllumination(false);
    }
    if (this.cowCamTimer > 0) {
      this.cowCamTimer -= dt;
      const cowPosition = this.cow.root.position;
      this.camera.setTarget(Vector3.Lerp(this.camera.target, cowPosition.add(new Vector3(0, 2.5, 0)), 0.08));
      this.camera.radius += (70 - this.camera.radius) * 0.08;
    } else {
      this.camera.setTarget(Vector3.Lerp(this.camera.target, new Vector3(4, 3, 2), 0.045));
      this.camera.radius += (112 - this.camera.radius) * 0.045;
    }
  }

  private capturePeaks(metrics: VisualMetrics): void {
    this.peakDebris = Math.max(this.peakDebris, metrics.activeDebris);
    this.peakParticles = Math.max(this.peakParticles, metrics.activeParticleSystems);
    this.peakActiveMeshes = Math.max(this.peakActiveMeshes, metrics.activeMeshes);
    this.peakMaterials = Math.max(this.peakMaterials, metrics.activeMaterials);
  }

  private bindControls(): void {
    const pause = this.requiredElement('pauseButton') as HTMLButtonElement;
    const reset = this.requiredElement('resetButton') as HTMLButtonElement;
    const replay = this.requiredElement('replayButton') as HTMLButtonElement;
    const speed = this.requiredElement('speedButton') as HTMLButtonElement;
    const diagnostics = this.requiredElement('diagnosticsButton') as HTMLButtonElement;
    const quality = this.requiredElement('qualitySelect') as HTMLSelectElement;
    for (const tier of ['low', 'balanced', 'high', 'showcase'] as const) quality.add(new Option(tier.toUpperCase(), tier, tier === this.quality.current.tier, tier === this.quality.current.tier));
    const listen = <K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, handler: (event: HTMLElementEventMap[K]) => void) => {
      element.addEventListener(type, handler as EventListener);
      this.cleanupCallbacks.push(() => element.removeEventListener(type, handler as EventListener));
    };
    listen(pause, 'click', () => {
      const running = this.replay.togglePause();
      pause.textContent = running ? 'PAUSE' : 'RESUME';
    });
    listen(reset, 'click', () => this.reset());
    listen(replay, 'click', () => this.replayFromStart());
    listen(speed, 'click', () => {
      this.replay.setAccelerated(!this.replay.accelerated);
      speed.textContent = this.replay.accelerated ? 'QA 30s' : 'NORMAL 180s';
    });
    listen(diagnostics, 'click', () => this.diagnostics.toggle());
    listen(quality, 'change', () => this.applyQuality(quality.value as QualityTier));
  }

  private bindLifecycle(): void {
    const resize = () => this.engine.resize();
    const visibility = () => {
      if (document.hidden && this.replay.running) {
        this.pausedByVisibility = true;
        this.replay.pause();
      } else if (!document.hidden && this.pausedByVisibility) {
        this.pausedByVisibility = false;
        this.replay.start();
      }
    };
    const captureError = (event: ErrorEvent) => this.consoleErrors.push(event.message);
    const captureRejection = (event: PromiseRejectionEvent) => this.unhandledRejections.push(String(event.reason));
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('error', captureError);
    window.addEventListener('unhandledrejection', captureRejection);
    this.cleanupCallbacks.push(
      () => window.removeEventListener('resize', resize),
      () => document.removeEventListener('visibilitychange', visibility),
      () => window.removeEventListener('error', captureError),
      () => window.removeEventListener('unhandledrejection', captureRejection)
    );
  }

  private requiredElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing laboratory UI element #${id}`);
    return element;
  }

  private setBroadcast(message: string): void {
    this.requiredElement('broadcast').textContent = message;
  }

  private setStatus(message: string): void {
    this.requiredElement('status').textContent = message;
  }
}

export { BENCHMARK_SEED };
