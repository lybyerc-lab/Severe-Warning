import type {
  TimeOfDayMode,
  DistrictGridState,
  NightLightingConfig,
  BlackoutTriggerEvent
} from './night-blackout-contracts.ts';

export const DEFAULT_NIGHT_LIGHTING_CONFIG: NightLightingConfig = {
  mode: 'DAY',
  nightFogColor: '#0a0f1d',
  nightSkyColor: '#070b16',
  ambientNightIntensity: 0.28,
  moonlightIntensity: 0.45,
  windowEmissiveColor: '#fef08a',
  streetlampEmissiveColor: '#fde047'
};

export class NightBlackoutSystem {
  private config: NightLightingConfig;
  private districts: DistrictGridState[] = [];
  private blackoutEvents: BlackoutTriggerEvent[] = [];

  constructor(config: Partial<NightLightingConfig> = {}) {
    this.config = { ...DEFAULT_NIGHT_LIGHTING_CONFIG, ...config };
    this.initDistricts();
  }

  private initDistricts(): void {
    const names = ['PINE RIDGE', 'FOUNDRY ROW', 'COUNTY FAIR', 'HARVEST VALLEY'];
    this.districts = names.map((name, index) => ({
      districtIndex: index,
      districtName: name,
      substationIntact: true,
      polesIntactCount: 28,
      isBlackedOut: false,
      lightsEmissiveIntensity: 1.0
    }));
  }

  public setTimeOfDay(mode: TimeOfDayMode): void {
    this.config.mode = mode;
  }

  public getTimeOfDay(): TimeOfDayMode {
    return this.config.mode;
  }

  public isNight(): boolean {
    return this.config.mode === 'NIGHT';
  }

  public triggerSubstationCollapse(districtIndex: number): BlackoutTriggerEvent | null {
    const d = this.districts[districtIndex];
    if (!d || d.isBlackedOut) return null;

    d.substationIntact = false;
    d.isBlackedOut = true;
    d.lightsEmissiveIntensity = 0.0;

    const event: BlackoutTriggerEvent = {
      districtIndex,
      districtName: d.districtName,
      cause: 'SUBSTATION_DESTRUCTION',
      timestamp: Date.now(),
      sparkCount: 36
    };

    this.blackoutEvents.push(event);
    return event;
  }

  public recordPoleDamage(districtIndex: number, polesLost: number = 1): BlackoutTriggerEvent | null {
    const d = this.districts[districtIndex];
    if (!d || d.isBlackedOut) return null;

    d.polesIntactCount = Math.max(0, d.polesIntactCount - polesLost);

    // Cascading blackout when grid integrity fails (< 10 poles)
    if (d.polesIntactCount < 10 && !d.isBlackedOut) {
      d.isBlackedOut = true;
      d.lightsEmissiveIntensity = 0.0;

      const event: BlackoutTriggerEvent = {
        districtIndex,
        districtName: d.districtName,
        cause: 'GRID_CASCADE_FAILURE',
        timestamp: Date.now(),
        sparkCount: 24
      };

      this.blackoutEvents.push(event);
      return event;
    }

    return null;
  }

  public getDistrictState(districtIndex: number): Readonly<DistrictGridState> | null {
    const d = this.districts[districtIndex];
    return d ? { ...d } : null;
  }

  public getAllDistricts(): ReadonlyArray<DistrictGridState> {
    return [...this.districts];
  }

  public getConfig(): Readonly<NightLightingConfig> {
    return { ...this.config };
  }

  public reset(): void {
    this.initDistricts();
    this.blackoutEvents.length = 0;
  }
}
