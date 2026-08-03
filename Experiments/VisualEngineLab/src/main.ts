import './styles.css';
import type { QualityTier } from './contracts/quality-profile';
import { VisualLabApp } from './app/visual-lab-app';

declare global {
  interface Window {
    __SEVERE_WARNING_VISUAL_LAB__?: {
      getQaState: () => ReturnType<VisualLabApp['getQaState']>;
      reset: () => void;
      replay: () => void;
      setAccelerated: (enabled: boolean) => void;
      setQuality: (tier: QualityTier) => void;
      setTreatment: (treatment: 'baseline' | 'showcase') => void;
      dispose: () => void;
      capabilities: { webgpuDetected: boolean; productionRenderer: 'three-r128'; laboratoryRenderer: 'babylon-9.19.0' };
    };
  }
}

const canvas = document.getElementById('renderCanvas');
const errorPanel = document.getElementById('bootError');
if (!(canvas instanceof HTMLCanvasElement) || !(errorPanel instanceof HTMLElement)) throw new Error('Laboratory shell is incomplete.');

try {
  const params = new URLSearchParams(location.search);
  const requestedQuality = params.get('quality');
  const quality: QualityTier = ['low', 'balanced', 'high', 'showcase'].includes(requestedQuality ?? '')
    ? requestedQuality as QualityTier
    : 'balanced';
  const treatment: 'baseline' | 'showcase' = params.get('treatment') === 'showcase' ? 'showcase' : 'baseline';

  const app = new VisualLabApp(canvas, quality);
  if (treatment === 'showcase') app.setTreatment('showcase');
  app.replay.setAccelerated(params.get('speed') !== 'normal');
  app.start();

  window.__SEVERE_WARNING_VISUAL_LAB__ = {
    getQaState: () => app.getQaState(),
    reset: () => app.reset(),
    replay: () => app.replayFromStart(),
    setAccelerated: (enabled) => app.replay.setAccelerated(enabled),
    setQuality: (tier) => app.applyQuality(tier),
    setTreatment: (t) => app.setTreatment(t),
    dispose: () => app.dispose(),
    capabilities: {
      webgpuDetected: 'gpu' in navigator,
      productionRenderer: 'three-r128',
      laboratoryRenderer: 'babylon-9.19.0'
    }
  };
} catch (error) {
  errorPanel.hidden = false;
  errorPanel.textContent = error instanceof Error ? error.message : String(error);
  console.error(error);
}
