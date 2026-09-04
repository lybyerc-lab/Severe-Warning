// [SW:BRAND:APP_ART] The launcher icon and splash, as source rather than as
// binaries somebody once exported and nobody can regenerate.
//
// The shipped icon and splash were the stock Capacitor logo -- a blue X on
// white -- so the drawer icon and the first two seconds of the app belonged to
// the tooling rather than to the game. These are authored here as SVG and
// rasterized by Chromium at every density Android asks for, which means the art
// can be changed by editing a shape instead of by finding whoever has the
// original file.
//
// Palette is the game's own, not a new one:
//   #030712  --bg-dark, and the app's statusBarColor
//   #fbbf24  --gold, the EAS amber the HUD and the warning banner already use
//   #b3261e  the red of the menu's stamped county slip
//   #ece2cb  the newsprint of the wire dispatch card

export const NAVY = '#030712';
export const DEEP = '#0b1220';
export const GOLD = '#fbbf24';
export const AMBER_DEEP = '#b8791a';
export const RED = '#b3261e';
export const PAPER = '#ece2cb';

// The funnel, drawn once in a 0..108 box so the adaptive-icon foreground and the
// legacy square icon can share a single shape at different scales.
//
// Android crops an adaptive icon to a circle of roughly 66% of the 108dp canvas
// and some launchers crop further, so every point of this path is kept inside a
// circle of radius 34 about (54, 54) -- checked at the widest row rather than
// assumed: at y=30 that circle is only 24 wide either side of centre, so the
// deck spans 32..76 and not the 22..86 a square-thinking first draft used.
//
// It is a wedge, not a rope. This game's tornado is a wedge, and a thin rope
// silhouette reads as a comma at 48 pixels.
export function funnelPath() {
  return [
    'M 32 30',
    'C 44 26, 66 26, 76 30',
    'C 72 44, 64 56, 60 68',
    'C 58 74, 57 79, 57 82',
    'L 51 82',
    'C 51 79, 50 74, 48 68',
    'C 44 56, 36 44, 32 30',
    'Z'
  ].join(' ');
}

// Two thin debris arcs across the throat. Three heavy ones made the mark read as
// a striped cone -- a shuttlecock -- instead of something spinning.
function debrisArcs() {
  return `
    <path d="M 35 39 C 46 45, 62 45, 73 39" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linecap="round" opacity="0.92"/>
    <path d="M 42 55 C 49 59, 59 59, 66 55" fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" opacity="0.92"/>
  `;
}

// The adaptive foreground: transparent, mark only, nothing outside the crop
// circle. The red rule is the EAS bar the game's own banner uses, kept short so
// it survives the crop too.
export function iconForegroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">
    <defs>
      <linearGradient id="funnel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${GOLD}"/>
        <stop offset="1" stop-color="${AMBER_DEEP}"/>
      </linearGradient>
    </defs>
    <g transform="translate(54 54) scale(0.9) translate(-54 -54)">
      <path d="${funnelPath()}" fill="url(#funnel)"/>
      ${debrisArcs()}
      <rect x="44" y="85" width="20" height="3.2" rx="1.6" fill="${RED}"/>
    </g>
  </svg>`;
}

// The legacy icon is its own full-bleed composition: no adaptive background sits
// behind it, so it carries the storm sky itself, and nothing crops it -- which
// is why the mark can run larger here than in the foreground above.
export function iconLegacySvg({ round = false } = {}) {
  const clip = round
    ? `<clipPath id="mask"><circle cx="54" cy="54" r="54"/></clipPath>`
    : `<clipPath id="mask"><rect x="0" y="0" width="108" height="108" rx="16"/></clipPath>`;
  const inset = round ? 0.9 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">
    <defs>
      ${clip}
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${DEEP}"/>
        <stop offset="1" stop-color="${NAVY}"/>
      </linearGradient>
      <linearGradient id="funnel2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${GOLD}"/>
        <stop offset="1" stop-color="${AMBER_DEEP}"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#mask)">
      <rect x="0" y="0" width="108" height="108" fill="url(#sky)"/>
      <g transform="translate(54 50) scale(${(1.16 * inset).toFixed(3)}) translate(-54 -50)">
        <path d="${funnelPath()}" fill="url(#funnel2)"/>
        ${debrisArcs()}
      </g>
      <rect x="0" y="95" width="108" height="13" fill="${RED}"/>
      <rect x="0" y="93.5" width="108" height="1.6" fill="${GOLD}"/>
    </g>
  </svg>`;
}

// The splash is a window background: Android stretches and crops it to whatever
// the display is, so everything that matters sits in a centred block and the
// rest is a flat field that survives any crop.
export function splashSvg(width, height) {
  const short = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const mark = short * 0.34;
  const barW = short * 0.62;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <radialGradient id="vig" cx="50%" cy="46%" r="72%">
        <stop offset="0" stop-color="${DEEP}"/>
        <stop offset="1" stop-color="${NAVY}"/>
      </radialGradient>
      <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${GOLD}"/>
        <stop offset="1" stop-color="${AMBER_DEEP}"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#vig)"/>
    <g transform="translate(${cx - mark / 2} ${cy - mark * 0.86}) scale(${mark / 108})">
      <path d="${funnelPath()}" fill="url(#f)"/>
      ${debrisArcs(0.9)}
    </g>
    <rect x="${cx - barW / 2}" y="${cy + mark * 0.36}" width="${barW}" height="${Math.max(2, short * 0.012)}" fill="${RED}"/>
    <text x="${cx}" y="${cy + mark * 0.36 + short * 0.075}"
      font-family="Georgia, 'Times New Roman', serif" font-size="${short * 0.055}"
      font-weight="700" letter-spacing="${short * 0.012}" fill="${PAPER}"
      text-anchor="middle">SEVERE WEATHER</text>
    <text x="${cx}" y="${cy + mark * 0.36 + short * 0.128}"
      font-family="Arial, Helvetica, sans-serif" font-size="${short * 0.028}"
      font-weight="700" letter-spacing="${short * 0.018}" fill="${GOLD}"
      text-anchor="middle" opacity="0.85">KSWX-7 STORM DESK</text>
  </svg>`;
}
