import type {
  CinematicCameraPosition,
  CinematicTimelineBeat,
  OpeningCinematicSnapshot,
  OpeningCinematicContract
} from './opening-cinematic-contracts.ts';

export const OPENING_CINEMATIC_DURATION = 12.4;

export const OPENING_TIMELINE_BEATS: readonly CinematicTimelineBeat[] = Object.freeze([
  { id: 'morning-gazette-reveal', start: 0.0, end: 1.35, description: 'Morning newspaper title drops away to reveal the farm.' },
  { id: 'fence-conversation', start: 1.35, end: 5.9, description: 'Cow 17 leans on fence with Moo Brew coffee cup chatting with chickens.' },
  { id: 'double-take', start: 5.9, end: 8.15, description: 'Distant siren sounds; Cow 17 turns with delayed double-take.' },
  { id: 'last-sip', start: 8.15, end: 10.15, description: 'Cow 17 calmly takes one final sip from the cup.' },
  { id: 'touchdown-handoff', start: 10.15, end: 12.4, description: 'Cup drops, chickens scatter, Cow 17 trots away, camera blends to player follow camera.' }
]);

export class MooBrewOpeningCinematic implements OpeningCinematicContract {
  private active = false;
  private elapsedSeconds = 0;
  private durationSeconds = OPENING_CINEMATIC_DURATION;
  private isCompleted = false;

  private currentCamera: CinematicCameraPosition = {
    x: -238.5,
    y: 7.5,
    z: -175.5,
    targetX: -249.8,
    targetY: 4.8,
    targetZ: -189.8,
    fov: 38
  };

  public start(): void {
    this.active = true;
    this.elapsedSeconds = 0;
    this.isCompleted = false;
  }

  public update(deltaSeconds: number): void {
    if (!this.active || this.isCompleted) return;

    this.elapsedSeconds = Math.min(this.durationSeconds, this.elapsedSeconds + deltaSeconds);

    // Compute camera interpolation along cinematic timeline
    this.updateCameraForTime(this.elapsedSeconds);

    if (this.elapsedSeconds >= this.durationSeconds) {
      this.active = false;
      this.isCompleted = true;
    }
  }

  public skip(): void {
    if (!this.active && this.isCompleted) return;
    this.elapsedSeconds = this.durationSeconds;
    this.active = false;
    this.isCompleted = true;
    this.updateCameraForTime(this.durationSeconds);
  }

  private updateCameraForTime(time: number): void {
    const farmX = -280;
    const farmZ = -210;

    if (time < 5.9) {
      // Beat 1 & 2: Wide establishing shot of open pasture, red barn, silo, and fence conversation
      this.currentCamera = {
        x: farmX + 2.5,
        y: 7.2,
        z: farmZ + 11.5,
        targetX: farmX - 0.5,
        targetY: 4.8,
        targetZ: farmZ - 2.5,
        fov: 40
      };
    } else if (time < 8.15) {
      // Beat 3: Over-the-shoulder double-take
      const t = (time - 5.9) / (8.15 - 5.9);
      this.currentCamera = {
        x: farmX + 2.5 + (1.6 - 2.5) * t,
        y: 7.2 + (6.2 - 7.2) * t,
        z: farmZ + 11.5 + (6.8 - 11.5) * t,
        targetX: farmX - 0.5 + ((-0.2) - (-0.5)) * t,
        targetY: 4.8 + (5.2 - 4.8) * t,
        targetZ: farmZ - 2.5 + ((-0.5) - (-2.5)) * t,
        fov: 40 + (35 - 40) * t
      };
    } else if (time < 10.15) {
      // Beat 4: Close up on Moo Brew cup & final sip
      const t = (time - 8.15) / (10.15 - 8.15);
      this.currentCamera = {
        x: farmX + 1.6 + (0.95 - 1.6) * t,
        y: 6.2 + (5.4 - 6.2) * t,
        z: farmZ + 6.8 + (3.8 - 6.8) * t,
        targetX: farmX - 0.2 + (0.15 - (-0.2)) * t,
        targetY: 5.2 + (4.9 - 5.2) * t,
        targetZ: farmZ - 0.5 + (0.5 - (-0.5)) * t,
        fov: 35 + (32 - 35) * t
      };
    } else {
      // Beat 5: Touchdown & 1.5s seamless blend into Player Follow Camera
      const t = (time - 10.15) / (12.4 - 10.15);
      const easeT = t * t * (3 - 2 * t);
      this.currentCamera = {
        x: (farmX + 0.95) + (0 - (farmX + 0.95)) * easeT,
        y: 5.4 + (35 - 5.4) * easeT,
        z: (farmZ + 3.8) + (45 - (farmZ + 3.8)) * easeT,
        targetX: (farmX + 0.15) + (0 - (farmX + 0.15)) * easeT,
        targetY: 4.9 + (0 - 4.9) * easeT,
        targetZ: (farmZ + 0.5) + (0 - (farmZ + 0.5)) * easeT,
        fov: 32 + (48 - 32) * easeT
      };
    }
  }

  public getSnapshot(): OpeningCinematicSnapshot {
    const currentBeat = OPENING_TIMELINE_BEATS.find(
      b => this.elapsedSeconds >= b.start && this.elapsedSeconds < b.end
    )?.id || (this.isCompleted ? 'completed' : 'morning-gazette-reveal');

    return Object.freeze({
      active: this.active,
      elapsedSeconds: Number(this.elapsedSeconds.toFixed(2)),
      durationSeconds: this.durationSeconds,
      currentBeat,
      camera: { ...this.currentCamera },
      canSkip: this.active && this.elapsedSeconds > 0.5,
      isCompleted: this.isCompleted
    });
  }

  public dispose(): void {
    this.active = false;
    this.isCompleted = true;
  }
}
