import test from 'node:test';
import assert from 'node:assert/strict';
import { HudSystem } from './hud-system.ts';
import { RampageFeedbackSystem } from '../feedback/rampage-feedback-system.ts';
import { DistrictTransitionSystem } from '../transitions/district-transition-system.ts';
import { ResultsSystem } from '../results/results-system.ts';
import { UISubsystem } from '../ui-system.ts';

test('HudSystem: formats countdown time correctly', () => {
  const hud = new HudSystem();
  hud.updateTimer(180);
  assert.equal(hud.getSnapshot().timer.formattedTime, '03:00');
  assert.equal(hud.getSnapshot().timer.isWarningPeriod, false);

  hud.updateTimer(25);
  assert.equal(hud.getSnapshot().timer.formattedTime, '00:25');
  assert.equal(hud.getSnapshot().timer.isWarningPeriod, true);

  hud.updateTimer(-5);
  assert.equal(hud.getSnapshot().timer.formattedTime, '00:00');
});

test('HudSystem: updates score, combo multiplier, and EF rating', () => {
  const hud = new HudSystem();
  hud.updateScore(1540, 2.5, 0.4, 'EF-3');
  const snapshot = hud.getSnapshot();
  assert.equal(snapshot.score.score, 1540);
  assert.equal(snapshot.score.comboMultiplier, 2.5);
  assert.equal(snapshot.score.comboDecayProgress, 0.4);
  assert.equal(snapshot.score.efRating, 'EF-3');
  assert.equal(snapshot.score.efColor, '#f97316');
});

test('RampageFeedbackSystem: records score popups and milestones', () => {
  const feedback = new RampageFeedbackSystem();
  feedback.addScorePopup(10, 5, 20, '+150', '#fbbf24');
  assert.equal(feedback.getActivePopups().length, 1);
  assert.equal(feedback.getActivePopups()[0].amount, 150);

  feedback.triggerMilestone(3, 'UNSTOPPABLE!', '3x Multiplier Active');
  assert.equal(feedback.getCurrentTier(), 3);
  assert.equal(feedback.getLatestBanner()?.title, 'UNSTOPPABLE!');
});

test('UISubsystem: master reset synchronizes all modules', () => {
  const ui = new UISubsystem();
  ui.hud.updateScore(5000, 3.5, 0.8, 'EF-4');
  ui.feedback.triggerMilestone(4, 'MONSTER STORM');
  ui.reset();

  assert.equal(ui.hud.getSnapshot().score.score, 0);
  assert.equal(ui.hud.getSnapshot().score.comboMultiplier, 1.0);
  assert.equal(ui.feedback.getCurrentTier(), 0);
  assert.equal(ui.feedback.getLatestBanner(), null);
  assert.equal(ui.transitions.getCurrentTransition(), null);
  assert.equal(ui.results.getReport(), null);
});
