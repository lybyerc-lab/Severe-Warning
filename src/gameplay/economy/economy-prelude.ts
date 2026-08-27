// [SW:ARCH:ECONOMY_PRELUDE]
// Entry point for the bundle that build-web.mjs inlines into the page ahead of
// the gameplay script.
//
// The gameplay source is one classic <script> in a single lexical scope; it
// cannot `import`. That constraint is why the modernization bridges had to be
// inlined, and it is why extracting logic to TypeScript needs a delivery route
// rather than just a module. This is that route: the pure economy is compiled to
// an IIFE, published on globalThis, and inlined BEFORE the gameplay script, so by
// the time the game runs it can call typed, unit-tested code synchronously.
//
// Nothing here mirrors or observes. The game asks these functions for the answer
// and uses it. That is the difference between this and a passive bridge.
import {
  DEFAULT_SCORE_TARGET,
  EF_LADDER,
  efScoreThreshold,
  resolveEfRating,
  resolveGrade,
  resolveStars,
} from './economy-system.ts';

const economy = Object.freeze({
  version: 'SW_ECONOMY_V1',
  DEFAULT_SCORE_TARGET,
  EF_LADDER,
  efScoreThreshold,
  resolveEfRating,
  resolveGrade,
  resolveStars,
});

declare global {
  // eslint-disable-next-line no-var
  var __SW_ECONOMY__: typeof economy | undefined;
}

globalThis.__SW_ECONOMY__ = economy;

export type SevereWeatherEconomy = typeof economy;
