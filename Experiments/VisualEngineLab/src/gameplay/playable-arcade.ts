import { Mesh, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';
import type { CowSystem } from '../animals/cow-system';
import type { VisualEvent, VisualEventPayload, VisualEventType } from '../contracts/visual-events';
import type { BarnDestructionSystem } from '../destruction/barn-destruction';
import type { VisualEventBus } from '../events/event-bus';
import type { PlayerInputManager } from '../input/player-input';
import type { MaterialLibrary } from '../materials/material-library';
import type { TornadoSystem } from '../storm/tornado-system';
import type { BenchmarkWorld } from '../world/benchmark-world';

export type GameMode = 'menu' | 'playing' | 'paused' | 'results' | 'replay';

export interface ArcadeStats {
  score: number;
  maxCombo: number;
  timeRemaining: number;
  buildingsDamaged: number;
  buildingsCollapsed: number;
  utilityChains: number;
  mediaMoments: number;
  cowsLaunched: number;
  safeLandings: number;
  cow17Airtime: number;
  peakDebris: number;
  peakParticles: number;
  fpsHistory: number[];
}

export const MOVEMENT_PARAMETERS = {
  speed: 26.0,          // meters per second
  inertia: 0.12,        // responsive dampening
  mapBoundX: 62.0,      // boundary limits
  mapBoundZ: 62.0,
  pullCooldown: 3.0,    // seconds
  gustCooldown: 4.0,
  zapCooldown: 5.0
};

export class PlayableArcadeManager {
  mode: GameMode = 'menu';
  tornadoPosition = new Vector3(-3, 0, 4);
  velocity = new Vector3(0, 0, 0);

  score = 0;
  combo = 1.0;
  comboTimer = 0;
  maxCombo = 1.0;
  roundTimer = 180.0;

  pullCooldown = 0;
  gustCooldown = 0;
  zapCooldown = 0;

  // Stats for Bovine Situation Report
  buildingsDamaged = 0;
  buildingsCollapsed = 0;
  utilityChains = 0;
  mediaMoments = 0;
  cowsLaunched = 0;
  safeLandings = 0;
  cow17Airtime = 0;

  private cowSequenceTimer = -1;
  private cowSequenceState = 0;
  private gustEffectMesh: Mesh | null = null;
  private pullEffectMesh: Mesh | null = null;
  private zapBeamMesh: Mesh | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly materials: MaterialLibrary,
    private readonly tornado: TornadoSystem,
    private readonly barn: BarnDestructionSystem,
    private readonly cow: CowSystem,
    private readonly world: BenchmarkWorld,
    private readonly events: VisualEventBus,
    private readonly input: PlayerInputManager
  ) {}

  startArcadeMode(): void {
    this.reset();
    this.mode = 'playing';
    this.emitEvent('district.atmosphere.changed', { intensity: 0.6, presentationHints: { wind: 0.45 } });
    this.emitEvent('storm.spawned', { position: { x: this.tornadoPosition.x, y: 0, z: this.tornadoPosition.z }, intensity: 0.4 });
  }

  update(dt: number, currentFps: number): void {
    if (this.mode !== 'playing') return;

    // Countdown
    this.roundTimer = Math.max(0, this.roundTimer - dt);
    if (this.roundTimer <= 0) {
      this.endRound();
      return;
    }

    // Cooldowns
    if (this.pullCooldown > 0) this.pullCooldown = Math.max(0, this.pullCooldown - dt);
    if (this.gustCooldown > 0) this.gustCooldown = Math.max(0, this.gustCooldown - dt);
    if (this.zapCooldown > 0) this.zapCooldown = Math.max(0, this.zapCooldown - dt);

    // Combo Decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = Math.max(1.0, this.combo - 0.5);
        if (this.combo > 1.0) this.comboTimer = 2.0;
      }
    }

    // Steering & Velocity
    const move = this.input.getMoveVector();
    const targetVelX = move.x * MOVEMENT_PARAMETERS.speed;
    const targetVelZ = move.z * MOVEMENT_PARAMETERS.speed;

    this.velocity.x += (targetVelX - this.velocity.x) * (1 - Math.exp(-15 * dt));
    this.velocity.z += (targetVelZ - this.velocity.z) * (1 - Math.exp(-15 * dt));

    this.tornadoPosition.x += this.velocity.x * dt;
    this.tornadoPosition.z += this.velocity.z * dt;

    // Boundaries
    this.tornadoPosition.x = Math.max(-MOVEMENT_PARAMETERS.mapBoundX, Math.min(MOVEMENT_PARAMETERS.mapBoundX, this.tornadoPosition.x));
    this.tornadoPosition.z = Math.max(-MOVEMENT_PARAMETERS.mapBoundZ, Math.min(MOVEMENT_PARAMETERS.mapBoundZ, this.tornadoPosition.z));

    this.tornado.setPosition(this.tornadoPosition);
    this.emitEvent('storm.moved', { position: { x: this.tornadoPosition.x, y: 0, z: this.tornadoPosition.z } });

    // Handle Input Abilities
    if (this.input.consumePull()) this.triggerPull();
    if (this.input.consumeGust()) this.triggerGust();
    if (this.input.consumeZap()) this.triggerZap();

    // World Proximity Interactions
    this.checkBarnProximity(dt);
    this.checkCowProximity(dt);
    this.updateTemporaryVisuals(dt);

    // Track Cow 17 sequence
    this.updateCowSequence(dt);
  }

  triggerPull(): void {
    if (this.pullCooldown > 0) return;
    this.pullCooldown = MOVEMENT_PARAMETERS.pullCooldown;
    this.addScore(150, 'PULL POWER');
    this.emitEvent('gust.fired', { intensity: 0.8 });

    // Create Inward Spiral Ring Visual
    if (this.pullEffectMesh) this.pullEffectMesh.dispose();
    this.pullEffectMesh = MeshBuilder.CreateTorus('pull-ring', { diameter: 18, thickness: 0.6, tessellation: 32 }, this.scene);
    this.pullEffectMesh.position.copyFrom(this.tornadoPosition);
    this.pullEffectMesh.position.y = 0.5;
    this.pullEffectMesh.material = this.materials.get('pull-effect', '#38bdf8', { alpha: 0.7, emissive: 0.5 });

    // Pull Cow 17 if nearby
    const distToCow = Vector3.Distance(this.tornadoPosition, this.cow.root.position);
    if (distToCow < 24 && this.cowSequenceState === 0) {
      this.startCowSequence();
    }
  }

  triggerGust(): void {
    if (this.gustCooldown > 0) return;
    this.gustCooldown = MOVEMENT_PARAMETERS.gustCooldown;
    this.addScore(200, 'GUST FORCE');
    this.emitEvent('gust.fired', { intensity: 1.0 });

    // Create Expanding Shockwave Ring
    if (this.gustEffectMesh) this.gustEffectMesh.dispose();
    this.gustEffectMesh = MeshBuilder.CreateDisc('gust-shockwave', { radius: 2, tessellation: 32 }, this.scene);
    this.gustEffectMesh.rotation.x = Math.PI / 2;
    this.gustEffectMesh.position.copyFrom(this.tornadoPosition);
    this.gustEffectMesh.position.y = 0.3;
    this.gustEffectMesh.material = this.materials.get('gust-effect', '#f59e0b', { alpha: 0.6, emissive: 0.4 });

    // Proximity Damage Boost
    const distToBarn = Vector3.Distance(this.tornadoPosition, this.barn.root.position);
    if (distToBarn < 18) {
      this.advanceBarnStage();
    }
  }

  triggerZap(): void {
    if (this.zapCooldown > 0) return;
    this.zapCooldown = MOVEMENT_PARAMETERS.zapCooldown;
    this.utilityChains += 1;
    this.addScore(350, 'GRID ZAP!');
    this.emitEvent('grid-zap.fired', { intensity: 1.0 });

    // Lightning cylinder beam toward landmark water tower / utility node
    const targetNode = new Vector3(60, 15, 21); // Water tower location
    if (this.zapBeamMesh) this.zapBeamMesh.dispose();

    const path = [this.tornadoPosition.add(new Vector3(0, 18, 0)), targetNode];
    this.zapBeamMesh = MeshBuilder.CreateTube('zap-beam', { path, radius: 0.6, tessellation: 8 }, this.scene);
    this.zapBeamMesh.material = this.materials.get('zap-beam-mat', '#06b6d4', { alpha: 0.85, emissive: 0.8 });
  }

  getStats(): ArcadeStats {
    return {
      score: this.score,
      maxCombo: this.maxCombo,
      timeRemaining: this.roundTimer,
      buildingsDamaged: this.buildingsDamaged,
      buildingsCollapsed: this.buildingsCollapsed,
      utilityChains: this.utilityChains,
      mediaMoments: this.mediaMoments,
      cowsLaunched: this.cowsLaunched,
      safeLandings: this.safeLandings,
      cow17Airtime: this.cow17Airtime,
      peakDebris: this.barn.activeDebris,
      peakParticles: this.tornado.activeParticleCount,
      fpsHistory: []
    };
  }

  reset(): void {
    this.mode = 'menu';
    this.tornadoPosition.set(-3, 0, 4);
    this.velocity.set(0, 0, 0);
    this.score = 0;
    this.combo = 1.0;
    this.comboTimer = 0;
    this.maxCombo = 1.0;
    this.roundTimer = 180.0;
    this.pullCooldown = 0;
    this.gustCooldown = 0;
    this.zapCooldown = 0;
    this.buildingsDamaged = 0;
    this.buildingsCollapsed = 0;
    this.utilityChains = 0;
    this.mediaMoments = 0;
    this.cowsLaunched = 0;
    this.safeLandings = 0;
    this.cow17Airtime = 0;
    this.cowSequenceTimer = -1;
    this.cowSequenceState = 0;

    if (this.pullEffectMesh) { this.pullEffectMesh.dispose(); this.pullEffectMesh = null; }
    if (this.gustEffectMesh) { this.gustEffectMesh.dispose(); this.gustEffectMesh = null; }
    if (this.zapBeamMesh) { this.zapBeamMesh.dispose(); this.zapBeamMesh = null; }
  }

  private addScore(amount: number, reason: string): void {
    this.score += Math.round(amount * this.combo);
    this.combo = Math.min(5.0, Number((this.combo + 0.25).toFixed(2)));
    this.comboTimer = 3.0;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
  }

  private checkBarnProximity(dt: number): void {
    const barnPos = this.barn.root.position;
    const dist = Vector3.Distance(this.tornadoPosition, barnPos);
    if (dist < 14) {
      this.advanceBarnStage();
    }
  }

  private advanceBarnStage(): void {
    const current = this.barn.stage;
    if (current === 'wreckage') return;

    if (current === 'intact') {
      this.barn.setStage('damaged');
      this.buildingsDamaged += 1;
      this.addScore(300, 'BARN DAMAGED');
      this.emitEvent('building.damaged', {}, 'barn-01');
    } else if (current === 'damaged') {
      this.barn.setStage('exposed');
      this.addScore(450, 'BARN EXPOSED');
      this.emitEvent('building.damage-stage.changed', { damageStage: 2 }, 'barn-01');
    } else if (current === 'exposed') {
      this.barn.setStage('partial-collapse');
      this.addScore(600, 'PARTIAL COLLAPSE');
      this.emitEvent('building.damage-stage.changed', { damageStage: 3 }, 'barn-01');
    } else if (current === 'partial-collapse') {
      this.barn.setStage('wreckage');
      this.buildingsCollapsed += 1;
      this.addScore(1200, 'TOTAL BARN DESTRUCTION!');
      this.emitEvent('building.collapsed', {}, 'barn-01');
    }
  }

  private checkCowProximity(dt: number): void {
    const cowPos = this.cow.root.position;
    const dist = Vector3.Distance(this.tornadoPosition, cowPos);
    if (dist < 12 && this.cowSequenceState === 0) {
      this.startCowSequence();
    }
  }

  private startCowSequence(): void {
    this.cowSequenceState = 1;
    this.cowSequenceTimer = 0;
    this.cowsLaunched += 1;
    this.emitEvent('cow.noticed-storm', {}, 'cow-17');
  }

  private updateCowSequence(dt: number): void {
    if (this.cowSequenceState === 0) return;
    this.cowSequenceTimer += dt;
    const t = this.cowSequenceTimer;

    if (this.cowSequenceState === 1 && t >= 0.4) {
      this.cowSequenceState = 2;
      this.emitEvent('cow.double-take', {}, 'cow-17');
    } else if (this.cowSequenceState === 2 && t >= 0.8) {
      this.cowSequenceState = 3;
      this.emitEvent('cow.braced', {}, 'cow-17');
    } else if (this.cowSequenceState === 3 && t >= 1.3) {
      this.cowSequenceState = 4;
      this.emitEvent('cow.slid', {}, 'cow-17');
    } else if (this.cowSequenceState === 4 && t >= 1.8) {
      this.cowSequenceState = 5;
      this.emitEvent('cow.front-lift', {}, 'cow-17');
    } else if (this.cowSequenceState === 5 && t >= 2.4) {
      this.cowSequenceState = 6;
      this.emitEvent('cow.launched', {}, 'cow-17');
      this.emitEvent('cow-cam.triggered', { durationMs: 3500 }, 'cow-17');
      this.mediaMoments += 1;
      this.addScore(800, 'COW-CAM BROADCAST!');
    } else if (this.cowSequenceState === 6 && t >= 4.8) {
      this.cowSequenceState = 7;
      this.cow17Airtime += 3.5;
      this.emitEvent('cow.entered-orbit', {}, 'cow-17');
    } else if (this.cowSequenceState === 7 && t >= 7.0) {
      this.cowSequenceState = 8;
      this.safeLandings += 1;
      this.addScore(1000, 'SAFE BOVINE LANDING!');
      this.emitEvent('cow.landed-safely', {}, 'cow-17');
    } else if (this.cowSequenceState === 8 && t >= 8.5) {
      this.cowSequenceState = 9;
      this.emitEvent('cow.recovered', {}, 'cow-17');
    } else if (this.cowSequenceState === 9 && t >= 9.8) {
      this.cowSequenceState = 10;
      this.emitEvent('cow.offended-stare', {}, 'cow-17');
    }
  }

  private updateTemporaryVisuals(dt: number): void {
    if (this.pullEffectMesh) {
      this.pullEffectMesh.scaling.x -= dt * 0.4;
      this.pullEffectMesh.scaling.z -= dt * 0.4;
      this.pullEffectMesh.rotation.y += dt * 3.0;
      if (this.pullEffectMesh.scaling.x <= 0.1) {
        this.pullEffectMesh.dispose();
        this.pullEffectMesh = null;
      }
    }

    if (this.gustEffectMesh) {
      this.gustEffectMesh.scaling.x += dt * 4.5;
      this.gustEffectMesh.scaling.y += dt * 4.5;
      this.gustEffectMesh.scaling.z += dt * 4.5;
      if (this.gustEffectMesh.scaling.x >= 6.0) {
        this.gustEffectMesh.dispose();
        this.gustEffectMesh = null;
      }
    }

    if (this.zapBeamMesh) {
      this.zapBeamMesh.scaling.x *= 0.9;
      if (this.zapBeamMesh.scaling.x <= 0.05) {
        this.zapBeamMesh.dispose();
        this.zapBeamMesh = null;
      }
    }
  }

  private eventIdCounter = 1;

  private emitEvent(type: VisualEventType, payload: VisualEventPayload = {}, entityId?: string): void {
    const event: VisualEvent = {
      schemaVersion: 'severe-warning.visual.v1',
      id: `arcade-evt-${Date.now()}-${this.eventIdCounter++}`,
      type,
      timestampMs: performance.now(),
      deterministicSeed: 1337,
      entityId,
      payload
    };
    this.events.emit(event);
  }

  private endRound(): void {
    this.mode = 'results';
    this.emitEvent('world.reset');
  }
}
