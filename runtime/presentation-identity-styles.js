function identitySyncIntroPresentation() {
  const overlay = document.getElementById('mooBrewIntro');
  if (!overlay) return false;
  const active = overlay.classList.contains('active');
  const phase = overlay.dataset.phase || '';
  const touchdownVisible = phase === 'tornado-touchdown' || phase === 'tactical-handoff';
  document.body.classList.toggle('moo-brew-intro-active', active);
  const tornado = overlay.querySelector('.identity-intro-tornado');
  if (tornado) {
    tornado.style.opacity = touchdownVisible ? '1' : '0';
    tornado.style.transform = touchdownVisible
      ? 'translateY(0) scale(1) rotate(0)'
      : 'translateY(-45px) scale(0.72) rotate(-4deg)';
  }
  return active;
}

function identityInstallIntroPresentationSync() {
  const overlay = document.getElementById('mooBrewIntro');
  if (!overlay || overlay.dataset.presentationSyncInstalled === '1') return false;
  overlay.dataset.presentationSyncInstalled = '1';

  // [SW:PRESENTATION:INTRO_PHASE_SYNC]
  // MutationObserver callbacks run after the phase-changing task. Wrap the
  // accepted phase setter so deterministic QA and assistive snapshots see the
  // visual state in the same turn that owns the phase transition.
  if (!identityState.introPhaseSyncInstalled) {
    const originalSetIntroPhase = identitySetIntroPhase;
    identitySetIntroPhase = function identitySynchronizedSetIntroPhase(phase) {
      const changed = originalSetIntroPhase(phase);
      if (changed) identitySyncIntroPresentation();
      return changed;
    };
    identityState.introPhaseSyncInstalled = true;
  }

  const observer = new MutationObserver(() => identitySyncIntroPresentation());
  observer.observe(overlay, { attributes: true, attributeFilter: ['class', 'data-phase'] });
  identitySyncIntroPresentation();
  return true;
}

function identityInstallStyle() {
  if (!document.getElementById('presentationIdentityMooBrewStyles')) {
    const style = document.createElement('style');
    style.id = 'presentationIdentityMooBrewStyles';
    style.textContent = [
      PRESENTATION_IDENTITY_STYLE_PART_1,
      PRESENTATION_IDENTITY_STYLE_PART_2,
      PRESENTATION_IDENTITY_STYLE_PART_3,
      `
        #mooBrewIntro { z-index: 2147483000 !important; }
        body.moo-brew-intro-active #mainMenu {
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `,
    ].join('');
    document.head.appendChild(style);
  }
  queueMicrotask(() => identityInstallIntroPresentationSync());
}
