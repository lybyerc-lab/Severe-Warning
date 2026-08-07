# PlayCanvas Storm Physics Browser Proof — 2026-08-07

Status: browser-QA passed and publicly deployed for owner hands-on testing. Not Android physically accepted.

## Exact source

- PR: #35 `Restore PlayCanvas storm physics parity slice`
- exact sealed source: `8d070e21cfe7720353ec842a02f1179bc33e9181`
- parent owner-approved camera/map source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`
- PlayCanvas: `2.21.3`, accepted engine checksum unchanged

The delta from the already-green physics source `73f8486b72462274aea687d71e2c5e1a5125a44b` to sealed source `8d070e21cfe7720353ec842a02f1179bc33e9181` only strengthens the workflow evidence contract to require the Pull, Gust, debris, camera-turn, travel, junction, and baseline screenshots. No gameplay or force-law code changed in that final evidence-only step.

## Repository-owned workflow

PlayCanvas Production Slice Bootstrap:

- Run number: 53
- Run ID: `31219969904`
- result: success
- exact source identity: passed
- accepted gameplay authority reconstruction: passed
- strict TypeScript: passed
- static contracts: **69/69 passed**
- browser QA: **61/61 passed**
- failed checks: none

Artifact:

- name: `severe-weather-playcanvas-slice-53`
- ID: `9010066122`
- GitHub digest: `sha256:fd7e084e49d4cd4760351dc355f8f28fcdd185f4fc6765c1f33b245ef2e8c85c`
- downloaded ZIP SHA-256 matched the GitHub digest exactly
- `SOURCE_SHA.txt` matched the exact sealed source

Required screenshot evidence present:

- `playcanvas-slice.png`
- `playcanvas-slice-turn.png`
- `playcanvas-slice-travel.png`
- `playcanvas-slice-junction.png`
- `playcanvas-slice-pull.png`
- `playcanvas-slice-gust.png`
- `playcanvas-slice-debris.png`

## Physics implementation truth

The accepted legacy runtime remains upstream gameplay authority.

Visible Pull/Gust/Zap controls still call the accepted authority bridge. PlayCanvas force reactions begin only after the authority reports an accepted ability. Authoritative barn damage/stage state transfers representative Moo-Brew roof/debris presentation into the PlayCanvas force field.

The bounded PlayCanvas force field owns visible presentation components for:

- radial inward suction
- tangential swirl/orbit
- vertical lift
- mass/resistance response
- Pull amplification
- Gust outward impulse
- damping/ground contact
- deterministic reset/dispose cleanup

Cow 17 is not registered as a destructive PlayCanvas force body.

## Browser measurements

Camera/map baseline remained protected:

- visible/authority storm scale: `0.7717084051967507`
- sealed target: `0.7717`
- owner-approved camera trailing scale remained `0.9`
- rendered camera no-snap step remained within the frozen gate

Visible Pull proof:

- accepted through visible Pull control: yes
- trees reacting: 4
- light props reacting: 3
- peak measured tree tilt: `0.4218329627 rad`
- maximum inward light-prop displacement: `5.3740280045`
- maximum tangential/orbit displacement: `1.3403819410`

Visible Gust proof:

- accepted through visible Gust control: yes
- trees reacting: 4
- light props reacting: 5
- peak measured tree tilt: `0.3673336056 rad`
- maximum outward light-prop displacement: `5.0428817473`

Authoritative destruction/debris proof:

- authoritative Moo-Brew barn health at sampled point: about `109.75 / 760`
- authoritative stage: 3
- authoritative roof detached: yes
- representative airborne bodies at sampled point: 4
- PlayCanvas roof airborne: yes
- maximum measured debris displacement in sealed Run 53: `104.6403163256`

Reset proof:

- active physics bodies after reset: 0
- airborne bodies after reset: 0
- roof airborne after reset: false

Safe-animal proof:

- authoritative Cow 17 `safe: true`
- Cow 17 excluded from destructive PlayCanvas force body registry

## Public QA deployment

QA branch commit:

- `bf75c0fd6ca07b9e54f58c1d1bceeafa6c0d092d`

Deploy QA Pages:

- Run number: 72
- Run ID: `31220379275`
- build job: success
- existing QA root deterministic QA4: success
- exact Run 53 storm-physics artifact re-verification: success
- Pages deployment: success
- public root verification: success
- public PlayCanvas source/metadata verification: success

Live owner-test path:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

## Acceptance boundary

This milestone is:

- committed: yes
- built: yes
- browser-QA passed: yes
- publicly deployed: yes
- owner browser physics verdict: pending
- PlayCanvas Android APK built: no
- physically accepted on Galaxy S26 Ultra: no
- PR #35 merged: no

Do not describe the physics as matched, better, or physically accepted until the exact PlayCanvas Android APK is installed and approved on the Galaxy S26 Ultra.
