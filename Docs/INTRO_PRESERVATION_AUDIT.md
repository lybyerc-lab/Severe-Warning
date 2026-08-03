# Intro Preservation Audit

Date: 2026-08-03  
Inspected V5 commit: `d366cc9a1d6ec97192e5245a41bd193a21a769bc`

## Conclusion

No coded Moo Brew opening cinematic exists in the inspected production source, active V5 patch chain, `qa`, `main`, historical remote branches, archived laboratory HTML files, or repository build artifacts. The current production build does not execute one.

The newest source-backed implementation related to this idea is the Cow Signature System on V5: commit `cffbeb2`, file `scripts/apply-v500-cow-signature-patch.mjs`. It contains Cow 17, Moo Brew world/news dressing, and a brief Cow-Cam, but it is not the opening cinematic.

The exact opening cannot be recovered as code because the repository contains no prior implementation. Its creative direction can be reconstructed faithfully from durable written evidence.

## Search performed

The audit inspected:

- checked-in production and archived MechanicsLab HTML;
- current V5 source and every ordered patch script;
- local `main`, `qa`, and `agent/v500-heartland-campaign` refs after fetch;
- all available historical remote branches;
- Git history by commit message and content addition/removal searches;
- repository documentation and archived combined Markdown;
- tracked build/package sources and generated evidence files.

Search vocabulary included `intro`, `opening`, `cinematic`, `newspaper`, `headline`, `Moo Brew`, `coffee`, `cup`, `cow`, `barn`, `touchdown`, `transition`, `camera`, `farm`, and `title sequence`, plus structural equivalents such as start overlays and camera transitions.

## Answers

1. **Does a coded intro currently exist?** No.
2. **Newest related implementation?** V5 commit `cffbeb2`, `scripts/apply-v500-cow-signature-patch.mjs`; it is gameplay comedy and Cow-Cam, not an intro.
3. **Does production execute the protected intro?** No. Start flow enters the existing selection/gameplay path.
4. **Was it replaced or bypassed?** The evidence supports “documented but not implemented.” No replacement/removal commit was found.
5. **Can it be recovered exactly?** Not as code. The durable beat sheet can be recreated; exact timing, blocking, and shot data never existed in the repository.
6. **Beats to preserve?** Newspaper opening; calm farm reveal; Moo Brew cup; Cow 17 notices the developing funnel; slow double take; logo-readable cup drop; animal reaction; barn-roof peel; touchdown; rising/swinging camera; HUD fade and seamless control handoff.
7. **Dependencies?** Farm scene, procedural or authored Cow 17, Moo Brew cup/sign asset, newspaper/headline presentation, weather/radio audio, barn damage states, layered funnel, deterministic cinematic timeline, skip/persistence state, gameplay camera handoff, and local/offline assets.
8. **What must be recreated?** All camera rails, animation timing, newspaper/cup animation, cow performance, animal staging, barn-roof peel choreography, audio edit, skip state, and gameplay handoff logic.
9. **Remaining evidence?** `Docs/PRODUCT_VISION_AND_ROADMAP.md` contains the authoritative twelve-beat sequence; archived design docs preserve the cinematic-diorama intent; V5 preserves Moo Brew and Cow 17 identity; no screenshots or recordings of a working opening were found.
10. **Safest reproduction path?** Model the sequence as renderer-neutral visual events, prototype it only in the Babylon laboratory, compare against the production camera/control handoff, and later implement it in production only through a separately accepted Three.js or renderer-adapter milestone.

## Protected timing and joke contract

The written target is 10-15 seconds, skippable after first viewing. Calm must last long enough for the cow and cup to read before escalation. The double take and cup drop are the joke, so neither should be compressed into incidental background motion. The camera must end on the accepted tactical composition; control transfer must be continuous and cannot hide a loading hitch.

The laboratory may stage the component systems, but this mission must not claim to restore the intro or alter production start flow.

