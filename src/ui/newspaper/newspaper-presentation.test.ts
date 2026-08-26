import test from 'node:test';
import assert from 'node:assert/strict';
import { NewspaperPresentationSystem } from './newspaper-presentation-system.ts';

test('NewspaperPresentationSystem: formats headlines based on score and conditions', () => {
  const paper = new NewspaperPresentationSystem();

  // Test S+ grade headline
  const sPlusReport = paper.generateHeadline({
    districtName: 'Pine Ridge',
    destructionScore: 60000,
    grade: 'S+',
    efRating: 'EF-5',
    targetsDestroyed: 22,
    polesSparked: 8,
    maxCombo: 3.5
  });
  assert.equal(sPlusReport.headline, 'LOCAL STORM EARNS FRONT-PAGE DISRUPTION');
  assert.equal(sPlusReport.edition, 'SEVERE WEATHER WARNING · EVENING DISPATCH');

  // Test Fair County headline
  const fairReport = paper.generateHeadline({
    districtName: 'Moo County Fair',
    destructionScore: 25000,
    grade: 'UDDER CHAOS',
    efRating: 'EF-3',
    targetsDestroyed: 10,
    polesSparked: 2,
    maxCombo: 2.0,
    isFairCounty: true
  });
  assert.equal(fairReport.headline, 'FAIR BOARD DECLARES TOTAL UDDER CHAOS');

  // Test menu lead format
  const lead = paper.formatMenuLead('Pine Ridge', 'Suburban neighborhood with dense structures.');
  assert.equal(lead.startsWith('LEAD FORECAST: PINE RIDGE'), true);

  paper.reset();
  assert.equal(paper.getSnapshot().latestHeadline, null);
});
