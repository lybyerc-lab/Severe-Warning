// [SW:QA:INLINED_REGIONS]
// Reads the logic that was authored as separate modules but lives inline in the
// gameplay source.
//
// The gameplay source is one flattened HTML file holding a single classic
// <script>. Code that began life as `runtime/*.js` had to be folded into it: the
// modernization bridges close over `let` bindings in that script
// (`runTimeRemaining`, `cooldowns`, `triggerAbility`, ...), so they cannot work
// as separate `<script src>` files at all.
//
// For a long time the repo kept BOTH - the inline copy the game runs, and a
// `runtime/` copy the verifications read - and asserted they matched
// byte-for-byte. That made every edit to the gameplay source a two-file edit,
// and the copy was hand-synced (twice) when someone forgot. A check that only
// passes while a human remembers to duplicate their work is a check that will
// eventually be wrong about the file that actually ships.
//
// So the markers are the source of truth now. Each region runs from its
// `// [SW:SOURCE:<name>]` line to the start of the next one, or to the end of
// the enclosing <script> for the last region. The gameplay source is the only
// copy, and these verifications read the bytes the game really runs.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const GAMEPLAY_SOURCE = path.join('MechanicsLab', 'SevereWeather_3D_Lab.html');

/** The Three.js production slice, in the order it appears in the source. */
export const PRODUCTION_SLICE_REGIONS = Object.freeze([
  'v510-foundation.js',
  'v510-tornado.js',
  'v510-world.js',
  'v510-runtime.js',
]);

/** The lexical bridges and game subsystems the modern TypeScript shell attaches to. */
export const MODERNIZATION_BRIDGE_REGIONS = Object.freeze([
  'modernization-phase2-clocks.js',
  'modernization-phase3-input-abilities.js',
  'modernization-phase4-scoring-campaign.js',
  'modernization-phase5-presentation-world.js',
  'modernization-phase6-ui.js',
  'modernization-phase7-audio-traffic.js',
  'modernization-phase8-engine.js',
  'sw-rpg-001-moolah-storm-triangle.js',
]);

const MARKER = name => `// [SW:SOURCE:${name}]`;

/**
 * Every inlined region in `html`, keyed by region name, in source order.
 *
 * Region text INCLUDES its own marker line, so a check for the marker and a
 * check on the body read the same string.
 */
export function extractInlinedRegions(html) {
  const found = [];
  const pattern = /^\/\/ \[SW:SOURCE:([^\]]+)\]$/gm;
  for (const match of html.matchAll(pattern)) {
    found.push({ name: match[1], start: match.index });
  }
  const regions = new Map();
  for (let index = 0; index < found.length; index++) {
    const { name, start } = found[index];
    // The last region ends with the script that contains it. Anchoring on the
    // closing tag rather than on a named END marker means adding a region does
    // not require teaching this function a new terminator.
    const end = index + 1 < found.length
      ? found[index + 1].start
      : (html.indexOf('</script>', start) === -1 ? html.length : html.indexOf('</script>', start));
    regions.set(name, html.slice(start, end).trimEnd());
  }
  return regions;
}

/** `extractInlinedRegions` against a gameplay source file on disk. */
export async function readInlinedRegions(sourcePath) {
  return extractInlinedRegions(await readFile(sourcePath, 'utf8'));
}

/**
 * The named regions joined into one string, for checks that ask "does the
 * production slice contain X" without caring which file X came from.
 *
 * Throws when a region is missing: a verification that silently checks an empty
 * string would pass for the wrong reason, which is the failure mode this whole
 * module exists to prevent.
 */
export function joinRegions(regions, names) {
  const missing = names.filter(name => !regions.has(name));
  if (missing.length > 0) {
    throw new Error(`Gameplay source is missing inlined region(s): ${missing.join(', ')}`);
  }
  return names.map(name => regions.get(name)).join('\n');
}
