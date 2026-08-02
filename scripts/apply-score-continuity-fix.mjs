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

const matchingVariants = cappedVariants.filter(block => html.includes(block));
if (matchingVariants.length !== 1) {
  throw new Error(`score continuity source: expected one recognized capped-score block, found ${matchingVariants.length}`);
}

html = html.replace(
  matchingVariants[0],
  `  // SCORE_CONTINUITY_V1: damage always awards points; updateEFRating() owns stage-specific power caps.\n  const previousScore = destructionScore;\n  destructionScore += added;\n  return destructionScore - previousScore;`
);

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
