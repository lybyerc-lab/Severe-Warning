import type { QualityTier } from '../contracts/quality-profile';
import type { ArcadeStats, PlayableArcadeManager } from '../gameplay/playable-arcade';
import type { PlayerInputManager } from '../input/player-input';

export interface UiCallbacks {
  onStartPlay: () => void;
  onStartReplay: () => void;
  onPauseToggle: () => void;
  onReset: () => void;
  onQualityChange: (tier: QualityTier) => void;
  onSpeedToggle: () => void;
  onDiagnosticsToggle: () => void;
}

export class LabUiManager {
  private menuOverlay: HTMLElement;
  private resultsOverlay: HTMLElement;
  private playableHud: HTMLElement;
  private joystickArea: HTMLElement;
  private joystickKnob: HTMLElement;
  private scoreText: HTMLElement;
  private comboText: HTMLElement;
  private timerText: HTMLElement;
  private pullBtn: HTMLButtonElement;
  private gustBtn: HTMLButtonElement;
  private zapBtn: HTMLButtonElement;
  private qualitySelect: HTMLSelectElement;

  private cleanupCallbacks: Array<() => void> = [];

  constructor(
    private readonly container: HTMLElement,
    private readonly arcade: PlayableArcadeManager,
    private readonly input: PlayerInputManager,
    private readonly callbacks: UiCallbacks,
    currentQuality: QualityTier
  ) {
    this.injectUiDom(currentQuality);
    this.menuOverlay = this.getElement('menuOverlay');
    this.resultsOverlay = this.getElement('resultsOverlay');
    this.playableHud = this.getElement('playableHud');
    this.joystickArea = this.getElement('joystickArea');
    this.joystickKnob = this.getElement('joystickKnob');
    this.scoreText = this.getElement('scoreText');
    this.comboText = this.getElement('comboText');
    this.timerText = this.getElement('timerText');
    this.pullBtn = this.getElement('btnPull') as HTMLButtonElement;
    this.gustBtn = this.getElement('btnGust') as HTMLButtonElement;
    this.zapBtn = this.getElement('btnZap') as HTMLButtonElement;
    this.qualitySelect = this.getElement('menuQualitySelect') as HTMLSelectElement;

    this.bindEvents();
    this.showMenu();
  }

  showMenu(): void {
    this.menuOverlay.hidden = false;
    this.resultsOverlay.hidden = true;
    this.playableHud.hidden = true;
  }

  showPlayableHud(): void {
    this.menuOverlay.hidden = true;
    this.resultsOverlay.hidden = true;
    this.playableHud.hidden = false;
  }

  showResults(stats: ArcadeStats, avgFps: number, minFps: number): void {
    this.menuOverlay.hidden = true;
    this.playableHud.hidden = true;
    this.resultsOverlay.hidden = false;

    this.getElement('resScore').textContent = stats.score.toLocaleString();
    this.getElement('resCombo').textContent = `${stats.maxCombo.toFixed(1)}x`;
    this.getElement('resDamaged').textContent = `${stats.buildingsDamaged} / ${stats.buildingsCollapsed}`;
    this.getElement('resChains').textContent = String(stats.utilityChains);
    this.getElement('resMedia').textContent = String(stats.mediaMoments);
    this.getElement('resCows').textContent = `${stats.cowsLaunched} Launched (${stats.safeLandings} Safe Landings)`;
    this.getElement('resAirtime').textContent = `${stats.cow17Airtime.toFixed(1)}s`;
    this.getElement('resDebris').textContent = `${stats.peakDebris} / ${stats.peakParticles} particles`;
    this.getElement('resFps').textContent = `${Math.round(avgFps)} FPS (Min: ${Math.round(minFps)})`;
  }

  updateHud(): void {
    if (this.arcade.mode !== 'playing') return;

    this.scoreText.textContent = `SCORE: ${this.arcade.score.toLocaleString()}`;
    this.comboText.textContent = `COMBO: ${this.arcade.combo.toFixed(1)}x`;
    const mins = Math.floor(this.arcade.roundTimer / 60);
    const secs = Math.floor(this.arcade.roundTimer % 60);
    this.timerText.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Update ability cooldown UI
    this.updateButtonCooldown(this.pullBtn, this.arcade.pullCooldown, 3.0, 'PULL (Space)');
    this.updateButtonCooldown(this.gustBtn, this.arcade.gustCooldown, 4.0, 'GUST (Shift)');
    this.updateButtonCooldown(this.zapBtn, this.arcade.zapCooldown, 5.0, 'GRID ZAP (E)');
  }

  dispose(): void {
    for (const cleanup of this.cleanupCallbacks) cleanup();
    this.cleanupCallbacks.length = 0;
    this.menuOverlay.remove();
    this.resultsOverlay.remove();
    this.playableHud.remove();
  }

  private updateButtonCooldown(btn: HTMLButtonElement, cd: number, maxCd: number, label: string): void {
    if (cd > 0) {
      btn.disabled = true;
      btn.textContent = `${label} (${cd.toFixed(1)}s)`;
      btn.style.opacity = '0.5';
    } else {
      btn.disabled = false;
      btn.textContent = label;
      btn.style.opacity = '1.0';
    }
  }

  private injectUiDom(currentQuality: QualityTier): void {
    const menuHtml = `
      <div id="menuOverlay" class="lab-modal-overlay">
        <div class="lab-modal-box">
          <div class="lab-modal-header">
            <span class="badge">SEVERE WARNING</span>
            <h1>VISUAL ENGINE LABORATORY</h1>
            <p>Farm-to-Town Playable Arcade Benchmark · Cow 17 Safe</p>
          </div>
          <div class="lab-modal-body">
            <div class="action-row">
              <button id="btnPlayBenchmark" type="button" class="btn-primary">⚡ PLAY BENCHMARK</button>
              <button id="btnRunReplay" type="button" class="btn-secondary">▶ RUN AUTOMATED REPLAY</button>
            </div>
            <div class="options-grid">
              <label>QUALITY TIER
                <select id="menuQualitySelect">
                  <option value="low" ${currentQuality === 'low' ? 'selected' : ''}>LOW</option>
                  <option value="balanced" ${currentQuality === 'balanced' ? 'selected' : ''}>BALANCED (Primary)</option>
                  <option value="high" ${currentQuality === 'high' ? 'selected' : ''}>HIGH</option>
                  <option value="showcase" ${currentQuality === 'showcase' ? 'selected' : ''}>SHOWCASE</option>
                </select>
              </label>
              <button id="btnMenuDiagnostics" type="button" class="btn-outline">METRICS HUD</button>
              <button id="btnMenuReset" type="button" class="btn-outline">RESET LAB DATA</button>
            </div>
            <div class="controls-guide">
              <h3>CONTROLS</h3>
              <div class="guide-row">
                <span>Touch:</span> <b>Left Virtual Joystick</b> + <b>Right Action Buttons</b>
              </div>
              <div class="guide-row">
                <span>Desktop:</span> <b>WASD / Arrows</b> to steer, <b>Space / J</b> = Pull, <b>Shift / K</b> = Gust, <b>E / L</b> = Zap
              </div>
            </div>
            <div class="build-meta">
              <span>Commit: <code>ef256752831</code></span>
              <span>Engine: Babylon.js 9.19.0</span>
              <span>Path: WebGL 2 Baseline</span>
            </div>
          </div>
        </div>
      </div>

      <div id="playableHud" class="lab-hud-layer" hidden>
        <div class="hud-top-bar">
          <div class="hud-timer" id="timerText">3:00</div>
          <div class="hud-score-box">
            <div id="scoreText">SCORE: 0</div>
            <div id="comboText">COMBO: 1.0x</div>
          </div>
        </div>

        <div id="joystickArea" class="joystick-container">
          <div class="joystick-base">
            <div id="joystickKnob" class="joystick-knob"></div>
          </div>
        </div>

        <div class="abilities-container">
          <button id="btnPull" type="button" class="btn-ability pull-btn">PULL (Space)</button>
          <button id="btnGust" type="button" class="btn-ability gust-btn">GUST (Shift)</button>
          <button id="btnZap" type="button" class="btn-ability zap-btn">GRID ZAP (E)</button>
        </div>
      </div>

      <div id="resultsOverlay" class="lab-modal-overlay" hidden>
        <div class="lab-modal-box results-box">
          <div class="lab-modal-header">
            <span class="badge">BOVINE SITUATION REPORT</span>
            <h1>ROUND COMPLETE</h1>
          </div>
          <div class="lab-modal-body">
            <div class="results-main-score">
              <div class="big-score" id="resScore">0</div>
              <div class="score-sub">PEAK COMBO: <strong id="resCombo">1.0x</strong></div>
            </div>

            <div class="stats-table">
              <div class="stat-cell"><span>Damaged / Collapsed:</span> <strong id="resDamaged">0 / 0</strong></div>
              <div class="stat-cell"><span>Utility Grid Chains:</span> <strong id="resChains">0</strong></div>
              <div class="stat-cell"><span>Media Moments:</span> <strong id="resMedia">0</strong></div>
              <div class="stat-cell"><span>Cow 17 Status:</span> <strong id="resCows">0</strong></div>
              <div class="stat-cell"><span>Cow 17 Airtime:</span> <strong id="resAirtime">0s</strong></div>
              <div class="stat-cell"><span>Debris / Particles:</span> <strong id="resDebris">0</strong></div>
              <div class="stat-cell"><span>Frame Pacing:</span> <strong id="resFps">60 FPS</strong></div>
            </div>

            <div class="action-row">
              <button id="btnRestartRound" type="button" class="btn-primary">⚡ RESTART ROUND</button>
              <button id="btnReturnMenu" type="button" class="btn-secondary">MAIN MENU</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', menuHtml);
  }

  private bindEvents(): void {
    const listen = <K extends keyof HTMLElementEventMap>(id: string, type: K, handler: (event: HTMLElementEventMap[K]) => void) => {
      const el = this.getElement(id);
      el.addEventListener(type, handler as EventListener);
      this.cleanupCallbacks.push(() => el.removeEventListener(type, handler as EventListener));
    };

    listen('btnPlayBenchmark', 'click', () => {
      this.showPlayableHud();
      this.callbacks.onStartPlay();
    });

    listen('btnRunReplay', 'click', () => {
      this.showMenu();
      this.callbacks.onStartReplay();
    });

    listen('btnPull', 'click', () => this.input.pullRequested = true);
    listen('btnGust', 'click', () => this.input.gustRequested = true);
    listen('btnZap', 'click', () => this.input.zapRequested = true);

    listen('menuQualitySelect', 'change', () => {
      this.callbacks.onQualityChange(this.qualitySelect.value as QualityTier);
    });

    listen('btnMenuDiagnostics', 'click', () => this.callbacks.onDiagnosticsToggle());
    listen('btnMenuReset', 'click', () => this.callbacks.onReset());

    listen('btnRestartRound', 'click', () => {
      this.showPlayableHud();
      this.callbacks.onStartPlay();
    });

    listen('btnReturnMenu', 'click', () => {
      this.callbacks.onReset();
      this.showMenu();
    });
  }

  private getElement(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing UI element #${id}`);
    return el;
  }
}
