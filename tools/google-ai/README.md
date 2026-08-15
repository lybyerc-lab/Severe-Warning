# Severe Weather Warning Google AI Art Pipeline

Status: Stage 2B art-source tooling. **Not runtime authority.**

This folder provides a small Node CLI for generating visual-development images and video previsualization through the Google Gemini API. Generated media is source/reference material only until a separate production task explicitly imports and validates an approved asset.

## Security law

- Never commit a Gemini API key.
- Never paste a Gemini API key into ChatGPT, an issue, PR, log, screenshot, or generated manifest.
- The CLI reads `GEMINI_API_KEY` from the process environment only.
- The shipped game/browser runtime must never call the Gemini API.
- Generated output is ignored by Git by default.

## Google Drive archive

Project root:
`https://drive.google.com/drive/folders/12cD0PRhA3uNffQDQHywdblqIpZ-fZ55U`

Google source folders:
- prompts: `https://drive.google.com/drive/folders/1Ay4aSnjnO03zrsloJ2HNfXG5CUL7jP8_`
- generated images: `https://drive.google.com/drive/folders/1Q6ti32Q16KBwVmhMlLphac8Vmi8izJ7m`
- approved references: `https://drive.google.com/drive/folders/1y-mpIVs7STe0-VXGLcumsxWpgxeyXqxK`
- video previsualization: `https://drive.google.com/drive/folders/1p0Yprt5uoNtbkpmTiG11tvHiRJhj-H3F`

The local CLI does not implement Google Drive OAuth. Archive approved outputs into the Drive folders after review. The game repo remains the authority for code and accepted production assets.

## Current default models

Defaults are deliberately overridable because hosted model names and availability change.

- image iteration: `gemini-3.1-flash-image`
- professional/final reference option: `gemini-3-pro-image`
- video previsualization: `gemini-omni-flash-preview`

Use `--model <model-id>` to override a brief/default without editing source.

## First-time API setup

1. Create a Gemini API key in Google AI Studio for the Google/Cloud project you want to bill.
2. Keep the key local. Do not add it to any repository file.
3. In PowerShell for the current terminal session:

```powershell
$env:GEMINI_API_KEY="YOUR_LOCAL_KEY"
```

4. Close the terminal when finished if you do not want the session environment retained.

The Google AI Pro consumer subscription and Gemini API billing are separate. The CLI does not attempt to configure billing.

## Safe dry runs

Dry runs do not require an API key and do not spend generation credits.

```bash
node tools/google-ai/sw-google-art.mjs list
node tools/google-ai/sw-google-art.mjs image --brief cow17 --dry-run
node tools/google-ai/sw-google-art.mjs image --brief tornado-visual-dev --model gemini-3-pro-image --dry-run
node tools/google-ai/sw-google-art.mjs video --brief moo-brew-touchdown-previz --dry-run
```

## Generate an image

```bash
node tools/google-ai/sw-google-art.mjs image --brief cow17
```

Use Nano Banana Pro for a final/high-control pass:

```bash
node tools/google-ai/sw-google-art.mjs image --brief cow17 --model gemini-3-pro-image
```

Default outputs land under:

`art-source/generated/google-ai/<brief-id>/`

Each media file receives an adjacent JSON manifest recording the brief, model, interaction id, reference filenames, and archive target. The manifest never records the API key.

## Generate from one or more reference images

```bash
node tools/google-ai/sw-google-art.mjs image --brief cow17 --reference refs/cow-front.png --reference refs/cow-side.png
```

Supported local reference formats are PNG, JPEG, and WebP.

## Generate video previsualization

```bash
node tools/google-ai/sw-google-art.mjs video --brief moo-brew-touchdown-previz
```

A reference/keyframe may be supplied with `--reference`.

Important: current product law locks the production opening to the same Three.js world as gameplay. Google-generated video is therefore previsualization/reference only unless the owner explicitly reopens that direction in a separate task.

## Initial briefs

- `cow17.json` - Cow 17 character/model sheet
- `heartland-farm.json` - Hart Farm hero barn/farm asset reference
- `heartland-house.json` - repeatable destructible Heartland house reference
- `tornado-visual-dev.json` - Tornado rendering target/reference
- `moo-brew-touchdown-previz.json` - timing/composition previsualization only

## Promotion law

Generated pixels do not become game assets automatically.

The intended production chain is:

`brief -> generated reference -> Director/owner review -> approved reference -> 3D authoring/generation -> GLB/PBR validation -> isolated Three.js preview -> bounded production integration -> browser/device proof`

The existing Three.js asset-pipeline separation remains authoritative: art may replace presentation, but it must not redefine gameplay truth.
