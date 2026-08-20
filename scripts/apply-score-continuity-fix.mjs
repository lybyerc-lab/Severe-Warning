import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  '// STRICT STAGE SCORE HARD CAPS + SCORE DOUBLER PICKUP SUPPORT',
  '// CONTINUOUS SCORE + STAGE-CAPPED EF PROGRESSION + SCORE DOUBLER SUPPORT',
  'score system heading'
);

const cappedVariants = [
  `  const previousScore = destructionScore;\n  let targetScore = destructionScore + added;\n  if (currentStage === 1) targetScore = Math.min(2999, targetScore);\n  else if (currentStage === 2) targetScore = Math.min(7999, targetScore);\n\n  destructionScore = targetScore;\n  return destructionScore - previousScore;`,
  `  const previousScore = destructionScore;\n  let targetScore = destructionScore + added;\n  if (currentStage === 1) targetScore = Math.min(3999, targetScore);\n  else if (currentStage === 2) targetScore = Math.min(7999, targetScore);\n\n  destructionScore = targetScore;\n  return destructionScore - previousScore;`
];

const continuousTail = `  // SCORE_CONTINUITY_V1: damage always awards points; updateEFRating() owns stage-specific power caps.\n  const previousScore = destructionScore;\n  destructionScore += added;\n  return destructionScore - previousScore;`;

// The combo-gated addScore keeps its "only advance the combo when points land"
// behaviour; only the caps are removed.
const comboGatedCapped = `  const stageCap = currentStage === 1 ? 2999 : (currentStage === 2 ? 7999 : Infinity);\n  if (destructionScore >= stageCap) return 0;\n\n  // The combo is only advanced once points actually land, so a run sitting on a\n  // stage hard cap cannot farm a free 3.5x best-combo result stat.\n  const nextCombo = Math.min(3.5, comboMultiplier + 0.05);\n  let multiplied = Math.round(pts * nextCombo);\n  if (scoreDoublerTimer > 0) multiplied *= 2;\n\n  const previousScore = destructionScore;\n  destructionScore = Math.min(stageCap, destructionScore + multiplied);\n  const awarded = destructionScore - previousScore;\n  if (awarded <= 0) return 0;`;
const comboGatedContinuous = `  // SCORE_CONTINUITY_V1: damage always awards points; updateEFRating() owns stage-specific power caps.\n  // The combo still only advances once points actually land, so a zero-point award\n  // cannot inflate the reported best combo.\n  const nextCombo = Math.min(3.5, comboMultiplier + 0.05);\n  let multiplied = Math.round(pts * nextCombo);\n  if (scoreDoublerTimer > 0) multiplied *= 2;\n\n  const previousScore = destructionScore;\n  destructionScore += multiplied;\n  const awarded = destructionScore - previousScore;\n  if (awarded <= 0) return 0;`;

const variantPairs = [
  ...cappedVariants.map(block => [block, continuousTail]),
  [comboGatedCapped, comboGatedContinuous]
];
const matchingPairs = variantPairs.filter(([block]) => html.includes(block));
if (matchingPairs.length !== 1) {
  throw new Error(`score continuity source: expected one recognized capped-score block, found ${matchingPairs.length}`);
}

html = html.replace(matchingPairs[0][0], matchingPairs[0][1]);

for (const forbidden of [
  'Math.min(2999, targetScore)',
  'Math.min(3999, targetScore)',
  'Math.min(7999, targetScore)',
  'STRICT STAGE SCORE HARD CAPS'
]) {
  if (html.includes(forbidden)) {
    throw new Error(`score continuity verification failed: legacy cap remains: ${forbidden}`);
  }
}

if (!html.includes('SCORE_CONTINUITY_V1')) {
  throw new Error('score continuity verification failed: marker missing');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied score continuity fix to ${sourcePath}`);
