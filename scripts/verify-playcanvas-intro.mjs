import { readFile, writeFile } from 'node:fs/promises';

const files = {
  index: await readFile('playcanvas-slice/index.html', 'utf8'),
  entry: await readFile('playcanvas-slice/src/entry.ts', 'utf8'),
  intro: await readFile('playcanvas-slice/src/moo-brew-intro.ts', 'utf8'),
};

const checks = [];
const check = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
const phases = [
  'newspaper',
  'farm-reveal',
  'moo-brew-sip',
  'weather-warning',
  'cow-double-take',
  'chicken-scatter',
  'tornado-touchdown',
  'tactical-handoff',
];

check(
  'entry-gates-gameplay-module',
  files.index.includes('src="/src/entry.ts"') && !files.index.includes('src="/src/main.ts"'),
  'index loads entry.ts instead of main.ts directly',
);

const startIndex = files.entry.indexOf('await intro.start()');
const importIndex = files.entry.indexOf("await import('./main')");
check(
  'intro-awaits-before-gameplay-import',
  files.entry.includes('[SW:PLAYCANVAS:INTRO_BEFORE_AUTHORITY]')
    && startIndex >= 0
    && importIndex > startIndex,
  { startIndex, importIndex },
);

check(
  'canonical-phase-order-is-exact',
  files.intro.includes('[SW:PLAYCANVAS:MOO_BREW_INTRO]')
    && phases.every((phase) => files.intro.includes(`'${phase}'`))
    && phases.every((phase, index) => index === 0 || files.intro.indexOf(`'${phase}'`) > files.intro.indexOf(`'${phases[index - 1]}'`)),
  phases,
);

check(
  'intro-query-and-session-policy-exists',
  files.intro.includes("params.get('qa') === '1'")
    && files.intro.includes("explicitIntro === '1'")
    && files.intro.includes("explicitIntro === '0'")
    && files.intro.includes("severe_weather_moo_brew_intro_seen"),
  'qa default skip, explicit force/bypass, and session memory are required',
);

check(
  'intro-qa-is-presentation-only',
  files.intro.includes('[SW:PLAYCANVAS:INTRO_QA]')
    && !/damageTarget|destroyTarget|addScore|destructionScore\s*=|comboMultiplier\s*=|runTimeRemaining\s*=/.test(files.intro),
  'intro module must not expose gameplay mutation helpers',
);

check(
  'intro-is-skippable-and-accessible',
  files.intro.includes('SKIP BROADCAST')
    && files.intro.includes("setAttribute('role', 'dialog')")
    && files.intro.includes("aria-label', 'Moo Brew tornado warning opening'")
    && files.intro.includes('skip: finish'),
  'dialog label and keyboard/touch button path exist',
);

check(
  'deterministic-forced-qa-mode-exists',
  files.intro.includes('const deterministic = qaMode && forced')
    && files.intro.includes('if (!deterministic)')
    && files.intro.includes('setPhase'),
  'forced QA intro waits for deterministic phase/finish control',
);

check(
  'gameplay-load-telemetry-exists',
  files.entry.includes("swPlaycanvasIntroGameplayLoaded = 'false'")
    && files.entry.includes('intro.markGameplayLoaded()')
    && files.intro.includes('gameplayLoaded'),
  'QA can prove gameplay was not loaded before intro completion',
);

const failedChecks = checks.filter((item) => !item.passed).map((item) => item.name);
const report = {
  version: 'PLAYCANVAS_MOO_BREW_INTRO_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
};
await writeFile('playcanvas-intro-static-report.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
