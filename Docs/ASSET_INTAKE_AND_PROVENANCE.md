# Asset Intake and Provenance

Date: 2026-08-08
Status: required production gate
Active visual branch: `agent/threejs-visual-production-foundation`

## Purpose

External sprites, textures, models, sounds, fonts, shaders, and reference assets may accelerate the graphics pipeline, but they may not become an untraceable asset-pack collage.

Every shipped external asset must have a known source, exact revision, clear license, intended role, local destination, and recorded transformation history.

## License policy

### Preferred

- **CC0-1.0** for visual/audio assets.
- Original project-owned assets.

CC0 is preferred because it keeps distribution and attribution simple while still allowing us to preserve voluntary credits internally.

### Conditional

- **CC-BY** may be considered only after an explicit attribution path is designed and the exact asset/license is reviewed.
- **MIT / Apache-2.0** are appropriate for code when the license obligations are preserved. Do not assume a repository's code license automatically covers its art assets.

### Reject by default for shipped production content

- no license / unknown provenance;
- scraped or reposted content whose upstream rights cannot be verified;
- GPL/AGPL code embedded into the product without an explicit architecture/legal decision;
- copyleft/share-alike art where obligations are not deliberately accepted;
- assets with unclear model/texture sub-licenses;
- content copied from games, films, brands, or marketplaces without explicit reusable rights.

When in doubt, do not import it.

## Required intake record

Before a third-party asset enters `assets/production/`, record:

- internal asset ID;
- upstream repository/source;
- exact upstream commit/release;
- exact upstream file path(s);
- upstream blob/checksum where practical;
- author/pack name;
- license identifier;
- license evidence path and exact license blob/revision;
- intended in-game use;
- local destination;
- modifications/restyling performed;
- final local checksum;
- whether attribution is legally required;
- whether voluntary credit will be retained;
- review status: `candidate`, `sandbox-approved`, `production-approved`, `rejected`, or `retired`.

## Runtime rule

Production assets must be local and offline-capable inside the browser build and Capacitor package. No shipped visual asset may depend on a GitHub/raw/CDN URL at runtime.

## Pack rule

Never import an entire external pack merely because one useful asset exists.

Prefer:

1. inspect the pack;
2. identify the smallest useful source files;
3. verify license/provenance;
4. normalize scale/orientation/pivot/color/material treatment;
5. restyle where needed;
6. copy only approved files into the local production tree;
7. record checksums and transformation notes.

## Current external candidates

### Kenney Particle Pack

- Upstream: `Calinou/kenney-particle-pack`
- Exact reviewed upstream commit: `ab7086639ee73be31abd87feb21bf1402d4e8144`
- Pack: Kenney Particle Pack 1.1
- License: CC0
- License evidence: `LICENSE.txt`
- Reviewed license blob: `e198510d3c6ac7e3dc4370f1f0861d8c617362e8`
- README evidence: 80 sprites for particles, light cookies, and shaders
- Status: **sandbox-approved, not imported**
- Candidate use: dust puffs/sheets, rain or impact accents, debris wisps/grit, light cookies/glows, selected storm VFX cards.
- Rule: ingest only selected texture sources. Do not import Godot-specific runtime/plugin code into the Three.js game.

### KayKit City Builder Bits 1.0

- Upstream: `KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0`
- Exact reviewed upstream commit: `63976910ca04d16f0fc531b9c614244be8128713`
- Author: Kay Lousberg / KayKit
- License: CC0
- License evidence: `LICENSE.txt`
- Reviewed license blob: `a311fe646973aa7da11458c3cbfefbb4c671f857`
- README evidence: 32+ mobile-oriented low-poly 3D models; single gradient atlas; OBJ/FBX/GLTF supplied
- Status: **sandbox-approved as an ingredient/reference pool, not imported**
- Candidate use: small-town props, street furniture, signs, utility dressing, silhouette/reference experiments.
- Rule: hero structures must still match the Severe Weather Warning style bible and destruction-anatomy requirements. Do not let the pack define the game's overall look.

### Kenney Starter Kit City Builder

- Upstream: `KenneyNL/Starter-Kit-City-Builder`
- Exact reviewed upstream commit: `4535092b740b378b700efd9df9e27a631815b84a`
- Code license: MIT
- Asset license evidence: repository README explicitly states included 2D sprites, 3D models, and sound effects are CC0 licensed
- Reviewed README blob: `2e705527b19fc6484dcf17eb9661cbcbc4772e72`
- Status: **research-approved, not imported**
- Candidate use: inspect individual CC0 city props/models for possible silhouette or dressing value.
- Rule: before importing any specific asset, record its exact upstream path and verify it belongs to the CC0 asset set rather than assuming the MIT code license covers everything.

## Initial visual-asset strategy

Use outside assets primarily where they buy visual richness without diluting identity:

- VFX sprites/cards;
- secondary props;
- background/dressing elements;
- generic utility objects;
- development references.

Prefer project-authored or deliberately restyled assets for:

- hero barns/houses/storefronts;
- destruction anatomy;
- Cow 17 and Moo Brew identity;
- tornado presentation;
- major landmarks;
- cinematic close-up assets.

## Credits law

Even when attribution is not legally required, keep internal provenance and author fields. A future credits screen can voluntarily acknowledge contributors and source packs without turning legal compliance into archaeology.

## Next intake step

For each candidate selected for the hero visual slice, create a concrete manifest entry before copying binary assets into production. The first likely sandbox target is a very small subset of Kenney particle textures for dust/debris/weather tests, because that lane can add visual richness without changing gameplay collision or destruction authority.
