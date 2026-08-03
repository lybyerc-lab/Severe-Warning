import type { Engine } from '@babylonjs/core';
import type { QualityProfile, QualityTier } from '../contracts/quality-profile';
import { QUALITY_PROFILES } from './profiles';

type QualityListener = (profile: QualityProfile) => void;

export class QualityGovernor {
  private profile: QualityProfile;
  private readonly listeners = new Set<QualityListener>();

  constructor(private readonly engine: Engine, initialTier: QualityTier) {
    this.profile = QUALITY_PROFILES[initialTier];
    this.applyEngineScale();
  }

  get current(): QualityProfile {
    return this.profile;
  }

  setTier(tier: QualityTier): void {
    this.profile = QUALITY_PROFILES[tier];
    this.applyEngineScale();
    for (const listener of this.listeners) listener(this.profile);
  }

  onChange(listener: QualityListener): () => void {
    this.listeners.add(listener);
    listener(this.profile);
    return () => this.listeners.delete(listener);
  }

  dispose(): void {
    this.listeners.clear();
  }

  private applyEngineScale(): void {
    this.engine.setHardwareScalingLevel(1 / this.profile.renderScale);
    this.engine.resize();
  }
}
