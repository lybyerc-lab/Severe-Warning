# PlayCanvas Multi-Structure Browser Proof — 2026-08-07

Status: browser-QA passed and publicly deployed for owner hands-on testing. Not Android physically accepted.

## Exact source

- PR: #36 `Expand PlayCanvas destruction across representative structures`
- exact sealed source: `d2ca9fca3f36507d49e2157786e81928c4795897`
- parent owner-approved rotation-stable source: `f5f01678595bf857840759604f362c93f62598e8`
- PlayCanvas: `2.21.3`

## Compatibility alignment

The accepted production-slice runtime historically starts beside its signature production barn near the county edge while Living County destructible targets live in the central county grid.

For the PlayCanvas authority iframe only, the signature barn and storm start are translated together into the central Living County area while preserving their exact relative vector `(-24,+15)`. This keeps the existing PlayCanvas world-transform scale and camera relationship stable while making real accepted-runtime Living County targets reachable inside the bounded `190 x 190` PlayCanvas slice.

This alignment does not change damage laws, score/combo laws, storm speed, ability semantics, or the legacy build outside the PlayCanvas authority iframe.

## Multi-structure authority

Four deterministic real accepted-runtime `targets` are mirrored:

- storefront presentation: district 0 commercial target
- house presentation: district 1 noncommercial target
- industrial/workshop presentation: district 2 commercial target
- barn presentation: district 3 noncommercial target

The accepted legacy runtime owns:

- target identity
- health and max health
- damage stage
- destroyed state
- scoring and combo
- normal storm-contact damage
- Pull/Gust/Zap damage execution

PlayCanvas owns only presentation mirroring and detached presentation chunks after authoritative damage-stage transitions.

No PlayCanvas renderer or QA helper calls `damageTarget`, `destroyTarget`, or scoring helpers directly.

## Structure presentation and debris

- four representative low-poly archetypes
- intact, damaged, and destroyed presentation states mirror authority
- three staged chunks per archetype, 12 structure-debris bodies total
- structure debris is isolated from the frozen tree/light-prop `StormForceField`
- detached chunks use a separate game-owned suction/swirl/lift/mass model
- chunks stay hidden until authoritative stage/destruction activates them
- accepted Pull/Gust may influence only already-detached structure chunks
- reset restores authored structure presentation and clears detached chunks

## Repository-owned workflow

PlayCanvas Production Slice Bootstrap:

- Run number: 72
- Run ID: `31238071067`
- result: success
- exact source identity: passed
- accepted gameplay authority reconstruction: passed
- strict TypeScript: passed
- main static contracts: **79/79 passed**
- multi-structure truth static contracts: **13/13 passed**
- inherited storm-physics browser QA: **61/61 passed**
- camera/Cow 17 rotation stability: **11/11 passed**
- multi-structure destruction browser QA: **17/17 passed**
- evidence contract: passed

Artifact:

- name: `severe-weather-playcanvas-slice-72`
- ID: `9016182208`
- GitHub digest: `sha256:df7dcdc739d5c6ed692eafb8b137619914ca493018bce619712a7bd53be71e6c`
- downloaded ZIP SHA-256 matched GitHub digest exactly
- `SOURCE_SHA.txt` matched the exact sealed source

Required multi-structure screenshots present:

- `playcanvas-multi-structure-intact.png`
- `playcanvas-multi-structure-damage.png`
- `playcanvas-multi-structure-destroyed.png`

## Protected behavior remained intact

Run 53 owner-approved tree response remained numerically identical:

- Pull peak tree tilt: `0.4218329627222749 rad`
- Pull max inward displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust peak tree tilt: `0.3673336055836977 rad`
- Gust max outward displacement: `5.042881747270892`

Other protected browser evidence:

- visible/authority storm scale: `0.7717126730148013`
- sealed target: `0.7717`
- camera max per-frame heading step: about `0.0945 rad`
- camera release drift remained bounded/green
- Cow 17 rotation/landing stability remained green and safe

## Multi-structure browser proof

The dedicated browser scenario used the accepted joystick bridge for deterministic steering and clicked the real visible ability controls.

Observed:

- four authoritative structures bound
- four PlayCanvas presentation bindings present
- structures mapped inside the bounded test world
- storefront took authoritative damage
- storefront reached authoritative destruction
- house took authoritative damage as a second distinct target
- accepted destruction score grew from `0` to `3491`
- presentation damage/destruction state matched authority
- five structure chunks activated
- detached chunks moved through the structure debris field
- reset restored all four authority targets to full health/stage 0/not destroyed
- reset returned presentation to intact
- reset cleared active structure debris and displacement
- Cow 17 remained safe
- console errors: 0
- page errors: 0

## Public QA deployment

QA branch commit:

- `c56c6650697548daae70755e61c7b6ac8d13808c`

Deploy QA Pages:

- Run number: 74
- Run ID: `31238516301`
- build job: success
- existing QA root deterministic QA4: success
- exact Run 72 multi-structure artifact re-verification: success
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
- owner browser multi-structure verdict: pending
- PlayCanvas Android APK built: no
- physically accepted on Galaxy S26 Ultra as an Android APK: no
- PR #36 merged: no

Do not describe this milestone as physically Android accepted until an exact PlayCanvas Android APK is installed and approved on the Galaxy S26 Ultra.
