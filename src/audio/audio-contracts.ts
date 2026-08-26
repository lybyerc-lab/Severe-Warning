/**
 * [SW:ARCH:PHASE7_AUDIO_CONTRACTS]
 * Type definitions for sound events, audio cues, mix levels, and synthesizer fallbacks.
 */

export interface SoundCueDefinition {
  id: string;
  name: string;
  category: 'sfx' | 'ambient' | 'ui' | 'music';
  startSeconds: number;
  durationSeconds: number;
  defaultGain: number;
}

export interface AudioMixSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  uiVolume: number;
  isMuted: boolean;
}

export interface AudioVoiceSnapshot {
  id: string;
  cueId: string;
  isPlaying: boolean;
  gain: number;
  playbackRate: number;
}

export interface AudioSystemSnapshot {
  ready: boolean;
  mix: AudioMixSettings;
  activeVoiceCount: number;
  availableCueCount: number;
  isSynthesizerFallback: boolean;
}

export interface AudioSystemContract {
  initialize(): Promise<boolean>;
  playCue(cueId: string, gainMultiplier?: number, playbackRate?: number): string | null;
  stopCue(voiceId: string): void;
  setMasterVolume(volume: number): void;
  setMuted(muted: boolean): void;
  getSnapshot(): AudioSystemSnapshot;
}
