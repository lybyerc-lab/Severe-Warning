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
    x: 12.4,
    y: 8.1,
    z: 17.6,
    targetX: 0.2,
    targetY: 3.3,
    targetZ: 0.2,
    fov: 37
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
    if (time < 5.9) {
      // Beat 1 & 2: Relaxed wide shot of fence conversation
      this.currentCamera = {
        x: 12.4,
        y: 8.1,
        z: 17.6,
        targetX: 0.2,
        targetY: 3.3,
        targetZ: 0.2,
        fov: 37
      };
    } else if (time < 8.15) {
      // Beat 3: Over-the-shoulder double-take
      const t = (time - 5.9) / (8.15 - 5.9);
      this.currentCamera = {
        x: 12.4 + (10.8 - 12.4) * t,
        y: 8.1 + (7.3 - 8.1) * t,
        z: 17.6 + (15.2 - 17.6) * t,
        targetX: 0.2 + (0.15 - 0.2) * t,
        targetY: 3.3 + (4.1 - 3.3) * t,
        targetZ: 0.2 + (0.45 - 0.2) * t,
        fov: 37 + (33 - 37) * t
      };
    } else if (time < 10.15) {
      // Beat 4: Close up on Moo Brew cup & final sip
      const t = (time - 8.15) / (10.15 - 8.15);
      this.currentCamera = {
        x: 10.8 + (7.1 - 10.8) * t,
        y: 7.3 + (6.0 - 7.3) * t,
        z: 15.2 + (11.5 - 15.2) * t,
        targetX: 0.15 + (0.85 - 0.15) * t,
        targetY: 4.1 + (4.45 - 4.1) * t,
        targetZ: 0.45 + (0.92 - 0.45) * t,
        fov: 33 + (30 - 33) * t
      };
    } else {
      // Beat 5: Touchdown & 1.5s seamless blend into Player Follow Camera
      const t = (time - 10.15) / (12.4 - 10.15);
      const easeT = t * t * (3 - 2 * t);
      this.currentCamera = {
        x: 7.1 + (0 - 7.1) * easeT,
        y: 6.0 + (35 - 6.0) * easeT,
        z: 11.5 + (45 - 11.5) * easeT,
        targetX: 0.85 + (0 - 0.85) * easeT,
        targetY: 4.45 + (0 - 4.45) * easeT,
        targetZ: 0.92 + (0 - 0.92) * easeT,
        fov: 30 + (48 - 30) * easeT
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
