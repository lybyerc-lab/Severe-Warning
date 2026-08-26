import type {
  NewsChopperConfig,
  NewsChopperState,
  AerialScoopEvent
} from './news-chopper-contracts.ts';

export const DEFAULT_CHOPPER_CONFIG: NewsChopperConfig = {
  flightAltitude: 52.0,
  orbitRadius: 48.0,
  orbitSpeed: 0.32,
  mainRotorRpm: 45.0,
  tailRotorRpm: 75.0,
  spotlightAngle: 0.42,
  spotlightIntensity: 2.2,
  liveFeedDuration: 4.5,
  scoopScoreReward: 350
};

export class NewsChopperSystem {
  private config: NewsChopperConfig;
  private state: NewsChopperState;
  private flightAngle: number = 0;
  private scoopHistory: AerialScoopEvent[] = [];

  constructor(config: Partial<NewsChopperConfig> = {}) {
    this.config = { ...DEFAULT_CHOPPER_CONFIG, ...config };
    this.state = {
      active: true,
      x: 0,
      y: this.config.flightAltitude,
      z: 0,
      heading: 0,
      pitch: 0.08, // slight nose-down cruise pitch
      roll: 0.12,  // bank into orbit
      mainRotorAngle: 0,
      tailRotorAngle: 0,
      targetFocusX: 0,
      targetFocusY: 0,
      targetFocusZ: 0,
      isFilming: true,
      liveFeedActive: false,
      liveFeedTimer: 0,
      totalScoopsAwarded: 0,
      callsign: 'ACTION CHOPPER 8'
    };
  }

  public update(stormX: number, stormZ: number, dt: number, focusOverride?: { x: number; y: number; z: number }): void {
    if (!this.state.active) return;

    const clampedDt = Math.max(0, Math.min(0.1, dt));
    this.flightAngle = (this.flightAngle + this.config.orbitSpeed * clampedDt) % (Math.PI * 2);

    // Position in continuous high-altitude orbit
    this.state.x = stormX + Math.cos(this.flightAngle) * this.config.orbitRadius;
    this.state.y = this.config.flightAltitude + Math.sin(this.flightAngle * 2.0) * 2.5; // gentle bobbing
    this.state.z = stormZ + Math.sin(this.flightAngle) * this.config.orbitRadius;

    // Tangent flight heading with bank
    this.state.heading = this.flightAngle + Math.PI / 2;

    // Spin rotors
    this.state.mainRotorAngle = (this.state.mainRotorAngle + this.config.mainRotorRpm * clampedDt) % (Math.PI * 2);
    this.state.tailRotorAngle = (this.state.tailRotorAngle + this.config.tailRotorRpm * clampedDt) % (Math.PI * 2);

    // Aim searchlight / camera gimbal
    if (focusOverride) {
      this.state.targetFocusX = focusOverride.x;
      this.state.targetFocusY = focusOverride.y;
      this.state.targetFocusZ = focusOverride.z;
    } else {
      this.state.targetFocusX = stormX;
      this.state.targetFocusY = 0;
      this.state.targetFocusZ = stormZ;
    }

    // Live Feed Timer countdown
    if (this.state.liveFeedActive) {
      this.state.liveFeedTimer -= clampedDt;
      if (this.state.liveFeedTimer <= 0) {
        this.state.liveFeedActive = false;
        this.state.liveFeedTimer = 0;
      }
    }
  }

  public triggerAerialScoop(subjectName: string, altitude: number): AerialScoopEvent {
    const event: AerialScoopEvent = {
      subjectName,
      altitude,
      points: this.config.scoopScoreReward,
      timestamp: Date.now()
    };

    this.scoopHistory.push(event);
    this.state.totalScoopsAwarded += 1;
    this.state.liveFeedActive = true;
    this.state.liveFeedTimer = this.config.liveFeedDuration;

    return event;
  }

  public getState(): Readonly<NewsChopperState> {
    return { ...this.state };
  }

  public getConfig(): Readonly<NewsChopperConfig> {
    return { ...this.config };
  }

  public reset(): void {
    this.flightAngle = 0;
    this.state.liveFeedActive = false;
    this.state.liveFeedTimer = 0;
    this.state.totalScoopsAwarded = 0;
    this.scoopHistory.length = 0;
  }
}
