import type {
  SoundCueDefinition,
  AudioMixSettings,
  AudioSystemSnapshot,
  AudioSystemContract
} from './audio-contracts.ts';

export class AudioSystem implements AudioSystemContract {
  private ready = false;
  private isSynthesizerFallback = false;
  private cues = new Map<string, SoundCueDefinition>();
  private activeVoiceCount = 0;
  private mix: AudioMixSettings = {
    masterVolume: 1.0,
    sfxVolume: 0.9,
    ambientVolume: 0.75,
    uiVolume: 1.0,
    isMuted: false
  };

  constructor() {
    this.registerDefaultCues();
  }

  private registerDefaultCues(): void {
    const defaultCues: SoundCueDefinition[] = [
      { id: 'wind_roar', name: 'Ambient Storm Wind', category: 'ambient', startSeconds: 0, durationSeconds: 6.0, defaultGain: 0.8 },
      { id: 'thunder_clap', name: 'Thunder Strike', category: 'sfx', startSeconds: 6.0, durationSeconds: 3.5, defaultGain: 1.0 },
      { id: 'transformer_blowout', name: 'Power Transformer Arc', category: 'sfx', startSeconds: 9.5, durationSeconds: 1.5, defaultGain: 0.95 },
      { id: 'building_collapse', name: 'Structural Impact', category: 'sfx', startSeconds: 11.0, durationSeconds: 2.5, defaultGain: 1.0 },
      { id: 'bovine_signature', name: 'Cow 17 Atmospheric Telemetry', category: 'sfx', startSeconds: 13.5, durationSeconds: 1.8, defaultGain: 0.85 },
      { id: 'zap_arc', name: 'Grid Discharge Zap', category: 'sfx', startSeconds: 15.3, durationSeconds: 0.8, defaultGain: 0.9 },
      { id: 'gust_shockwave', name: 'Shockwave Gust', category: 'sfx', startSeconds: 16.1, durationSeconds: 1.2, defaultGain: 1.0 },
      { id: 'vortex_pull', name: 'Funnel Suction Vacuum', category: 'sfx', startSeconds: 17.3, durationSeconds: 2.0, defaultGain: 0.85 },
      { id: 'combo_milestone', name: 'Combo Banner Fanfare', category: 'ui', startSeconds: 19.3, durationSeconds: 1.5, defaultGain: 0.9 }
    ];
    defaultCues.forEach(c => this.cues.set(c.id, c));
  }

  public async initialize(): Promise<boolean> {
    this.ready = true;
    return true;
  }

  public playCue(cueId: string, gainMultiplier = 1.0, playbackRate = 1.0): string | null {
    if (!this.ready || this.mix.isMuted) return null;
    const cue = this.cues.get(cueId);
    if (!cue) return null;
    this.activeVoiceCount += 1;
    return `voice-${cueId}-${Date.now()}`;
  }

  public stopCue(voiceId: string): void {
    if (this.activeVoiceCount > 0) this.activeVoiceCount -= 1;
  }

  public setMasterVolume(volume: number): void {
    this.mix.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public setMuted(muted: boolean): void {
    this.mix.isMuted = Boolean(muted);
  }

  public getSnapshot(): AudioSystemSnapshot {
    return {
      ready: this.ready,
      mix: { ...this.mix },
      activeVoiceCount: this.activeVoiceCount,
      availableCueCount: this.cues.size,
      isSynthesizerFallback: this.isSynthesizerFallback
    };
  }
}
