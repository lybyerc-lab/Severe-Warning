// SW-UI-001: presentation-only local newspaper layer. It reads established UI truth;
// it does not replace selection, score, progression, results, or Moo Level authority.
const SW_UI_001_NEWSPAPER_MARKER = 'SW_UI_001_NEWSPAPER_PRESENTATION_V1';
const newspaperState = { refreshes: 0, resultRefreshes: 0 };

function newspaperEl(id) { return document.getElementById(id); }
function newspaperText(id, fallback = '') { return newspaperEl(id)?.textContent?.trim() || fallback; }
function setNewspaperText(node, value) { if (node && node.textContent !== value) node.textContent = value; }

function installNewspaperStyles() {
  if (newspaperEl('swUi001NewspaperStyles')) return;
  const style = document.createElement('style');
  style.id = 'swUi001NewspaperStyles';
  style.textContent = String.raw`
    :root { --paper-ink:#182233; --paper-stock:#f2ead7; --paper-age:#d7c7a4; --paper-red:#af2723; --paper-blue:#234765; }
    #mainMenu.newspaper-menu { background: radial-gradient(circle at 74% 8%, rgba(242,234,215,.2), transparent 23%), linear-gradient(125deg, #111c2b, #263648 48%, #101722); }
    #mainMenu .menu-card.newspaper-front-page { position:relative; width:min(790px, 95vw); overflow:hidden; color:var(--paper-ink); border:8px solid #d8c79f; border-radius:3px; background: repeating-linear-gradient(0deg, rgba(74,55,24,.045) 0 1px, transparent 1px 4px), radial-gradient(circle at 18% 0%, #fffaf0, var(--paper-stock) 54%, #d9caab); box-shadow:0 22px 75px rgba(0,0,0,.7), inset 0 0 0 2px #2e3945; text-shadow:none; }
    #mainMenu .menu-card.newspaper-front-page::before { content:''; position:absolute; inset:7px; border:1px solid rgba(24,34,51,.4); pointer-events:none; }
    .newspaper-edition-rail { position:relative; z-index:1; display:flex; justify-content:space-between; gap:8px; padding:5px 0; border-top:2px solid var(--paper-ink); border-bottom:1px solid var(--paper-ink); color:#34475b; font:800 9px/1.1 Inter,sans-serif; letter-spacing:.1em; }
    #mainMenu .newspaper-front-page .menu-title { position:relative; z-index:1; margin:8px 0 2px; color:var(--paper-ink); font:1000 clamp(27px,5.4vw,47px)/.88 Georgia,serif; letter-spacing:-.055em; text-shadow:2px 1px 0 rgba(175,39,35,.25); }
    #mainMenu .newspaper-front-page .menu-sub { position:relative; z-index:1; margin:0 0 9px; padding:4px 8px; color:#fbf6e9; background:var(--paper-ink); font:900 9px/1.15 Inter,sans-serif; letter-spacing:.14em; }
    .newspaper-lead { position:relative; z-index:1; margin:0 0 10px; padding:6px 9px; border-left:5px solid var(--paper-red); background:rgba(255,255,255,.4); color:#263849; text-align:left; font:800 11px/1.28 Inter,sans-serif; }
    .newspaper-lead b { color:var(--paper-red); letter-spacing:.07em; }
    #mainMenu .newspaper-front-page .storm-select-grid { position:relative; z-index:1; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; margin:8px 0; }
    #mainMenu .newspaper-front-page .storm-card { position:relative; min-height:104px; padding:10px 9px 8px; overflow:hidden; border:1px solid rgba(24,34,51,.72); border-radius:0; background:rgba(255,255,255,.33); color:var(--paper-ink); text-align:left; box-shadow:none; transform:none; }
    #mainMenu .newspaper-front-page .storm-card::before { content:attr(data-paper-kicker); display:block; margin-bottom:4px; color:#52616d; font:900 8px/1 Inter,sans-serif; letter-spacing:.12em; }
    #mainMenu .newspaper-front-page .storm-card h3 { margin:2px 0 3px; color:var(--paper-ink); font:1000 17px/.94 Georgia,serif; letter-spacing:-.025em; }
    #mainMenu .newspaper-front-page .storm-card p { color:#354555; font:700 9px/1.25 Inter,sans-serif; }
    #mainMenu .newspaper-front-page .storm-card .hi-score { color:var(--paper-red); font-size:9px; letter-spacing:.06em; }
    #mainMenu .newspaper-front-page .storm-card:hover, #mainMenu .newspaper-front-page .storm-card.selected { border:3px solid var(--paper-red); padding:8px 7px 6px; background:linear-gradient(125deg, rgba(175,39,35,.15), rgba(255,255,255,.56)); box-shadow:inset 0 0 0 2px #f7eddb; transform:none; }
    #mainMenu .newspaper-front-page .storm-card.selected::after { content:'LEAD FORECAST'; position:absolute; top:6px; right:-25px; padding:3px 24px; transform:rotate(33deg); background:var(--paper-red); color:#fff9ec; font:1000 7px/1 Inter,sans-serif; letter-spacing:.08em; }
    #mainMenu .newspaper-front-page .storm-card.locked { opacity:.8; }
    #mainMenu .newspaper-front-page .storm-card.locked::after { content:'SEALED FILE'; background:#46515b; }
    #mainMenu .newspaper-front-page .menu-options { position:relative; z-index:1; margin:8px 0; }
    #mainMenu .newspaper-front-page .opt-btn { border-color:rgba(24,34,51,.65); border-radius:0; background:rgba(255,255,255,.35); color:var(--paper-ink); font-size:9px; }
    #mainMenu .newspaper-front-page .start-btn.newspaper-unleash { position:relative; z-index:1; width:min(100%,430px); margin-top:3px; padding:10px 15px 11px; border:3px double #f8eddb; border-radius:0; background:var(--paper-red); color:#fff9ec; box-shadow:4px 4px 0 #263849; font:1000 25px/.92 Georgia,serif; letter-spacing:-.025em; }
    .newspaper-unleash small { display:block; margin-bottom:3px; font:900 8px/1 Inter,sans-serif; letter-spacing:.18em; }
    .newspaper-legal { position:relative; z-index:1; margin:8px 0 0; color:#51606c; font:700 8px/1.25 Inter,sans-serif; }
    #resultsOverlay.newspaper-results-overlay { background:rgba(12,18,28,.84); backdrop-filter:blur(8px) grayscale(.15); }
    #resultsOverlay .results-card.newspaper-results-card { position:relative; width:min(760px,calc(100vw - 18px)); border:7px solid #d8c79f; border-radius:2px; background:repeating-linear-gradient(0deg, rgba(74,55,24,.045) 0 1px, transparent 1px 4px), linear-gradient(120deg,#fffaf0,#e7dbc1); color:var(--paper-ink); box-shadow:0 24px 80px rgba(0,0,0,.72), inset 0 0 0 2px #263849; text-shadow:none; }
    .newspaper-results-masthead { border-top:2px solid var(--paper-ink); border-bottom:4px double var(--paper-ink); padding:4px 0; color:var(--paper-ink); font:1000 16px/1 Georgia,serif; letter-spacing:-.02em; }
    .newspaper-results-kicker { margin-top:4px; color:var(--paper-red); font:900 8px/1.1 Inter,sans-serif; letter-spacing:.15em; }
    #resultsOverlay .newspaper-results-card h2 { margin:6px 0 2px; color:var(--paper-ink); font:1000 clamp(20px,4.4vw,35px)/.95 Georgia,serif; letter-spacing:-.035em; }
    #resultsOverlay .newspaper-results-card .grade-stamp { color:var(--paper-red); text-shadow:none; font-family:Georgia,serif; }
    .newspaper-result-readout { margin:5px 0 8px; padding:6px 8px; border-top:1px solid #596470; border-bottom:1px solid #596470; display:flex; align-items:baseline; justify-content:space-between; gap:8px; color:#24374a; font:900 9px/1 Inter,sans-serif; letter-spacing:.1em; }
    .newspaper-result-readout strong { color:var(--paper-red); font:1000 24px/1 Georgia,serif; letter-spacing:-.03em; }
    .newspaper-story-deck { margin:7px 0; padding:7px 8px; border-left:4px solid var(--paper-red); background:rgba(255,255,255,.43); color:#293b4d; text-align:left; }
    .newspaper-story-deck h3 { margin:0 0 3px; font:1000 15px/1 Georgia,serif; letter-spacing:-.025em; }
    .newspaper-story-deck p { margin:0; font:700 9px/1.3 Inter,sans-serif; }
    .newspaper-stat-columns { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; margin-top:6px; }
    .newspaper-stat-columns div { min-height:28px; padding:4px; border-top:1px solid rgba(24,34,51,.5); color:#334657; font:800 8px/1.18 Inter,sans-serif; }
    .newspaper-stat-columns b { display:block; margin-top:2px; color:var(--paper-ink); font:1000 10px/1.05 Georgia,serif; }
    #resultsOverlay .newspaper-results-card .results-stats, #resultsOverlay .newspaper-results-card .bovine-report, #resultsOverlay .newspaper-results-card .campaign-result { border-radius:0; border:1px solid rgba(24,34,51,.46); background:rgba(255,255,255,.3); color:#2d4051; font-family:Inter,sans-serif; }
    #resultsOverlay .newspaper-results-card .results-actions { border-top:3px double #53606b; padding-top:8px; }
    #resultsOverlay .newspaper-results-card .retry-btn { border:2px solid #263849; border-radius:0; background:#263849; color:#fff9ec; box-shadow:2px 2px 0 #a91f20; font-family:Inter,sans-serif; }
    #resultsOverlay .newspaper-results-card #mooReturnButton { background:var(--paper-red); }
    .newspaper-opening-edition { box-shadow:0 0 0 2px rgba(242,234,215,.75), 7px 7px 0 rgba(24,34,51,.26); }
    @media (max-height:540px),(max-width:850px) { #mainMenu .menu-card.newspaper-front-page { width:min(680px,calc(100vw - 12px)); max-height:calc(100dvh - 10px); padding:9px 11px; } #mainMenu .newspaper-front-page .menu-title { font-size:25px; } .newspaper-edition-rail { font-size:7px; } #mainMenu .newspaper-front-page .storm-card { min-height:75px; padding:6px 7px; } #mainMenu .newspaper-front-page .storm-card h3 { font-size:13px; } #mainMenu .newspaper-front-page .storm-card p { font-size:7.5px; } #mainMenu .newspaper-front-page .start-btn.newspaper-unleash { padding:7px 9px; font-size:19px; } #resultsOverlay .results-card.newspaper-results-card { max-height:calc(100dvh - 10px); padding:7px 9px; } .newspaper-results-masthead { font-size:12px; } #resultsOverlay .newspaper-results-card h2 { font-size:17px; } .newspaper-result-readout strong { font-size:18px; } .newspaper-story-deck { margin:4px 0; padding:5px 6px; } .newspaper-story-deck h3 { font-size:11px; } .newspaper-story-deck p,.newspaper-stat-columns div { font-size:7px; } }
  `;
  document.head.appendChild(style);
}

function newspaperStormKicker(storm) {
  return ({ tornado: 'BREAKING SKY DESK', supercell: 'SEVERE CONVECTION DESK', derecho: 'WIND BULLETIN DESK', moo: 'AGRICULTURAL EMERGENCY DESK' })[storm] || 'LOCAL FORECAST DESK';
}

function decorateNewspaperMenu() {
  const menu = newspaperEl('mainMenu');
  const card = menu?.querySelector('.menu-card');
  if (!menu || !card) return false;
  menu.classList.add('newspaper-menu'); card.classList.add('newspaper-front-page');
  const title = card.querySelector('.menu-title');
  const sub = card.querySelector('.menu-sub');
  setNewspaperText(title, 'SEVERE WEATHER WARNING');
  setNewspaperText(sub, 'THE HEARTLAND WEATHER DESK · SPECIAL STORM EDITION');
  if (!newspaperEl('newspaperEditionRail')) {
    const rail = document.createElement('div'); rail.id = 'newspaperEditionRail'; rail.className = 'newspaper-edition-rail';
    rail.innerHTML = '<span>VOL. 17 · LINCOLN COUNTY</span><span>PRICE: ONE BRAVE DECISION</span><span>ALL EDITIONS FINAL</span>';
    card.insertBefore(rail, title || card.firstChild);
  }
  if (!newspaperEl('newspaperLead')) {
    const lead = document.createElement('div'); lead.id = 'newspaperLead'; lead.className = 'newspaper-lead';
    lead.innerHTML = '<b>LEAD FORECAST:</b> Select a storm file. The county has prepared a strongly worded weather bulletin.';
    card.querySelector('.storm-select-grid')?.insertAdjacentElement('beforebegin', lead);
  }
  card.querySelectorAll('.storm-card').forEach((node) => {
    const key = node.id === 'menuCardMooLevel' ? 'moo' : node.id.replace('menuCard', '').toLowerCase();
    node.dataset.paperKicker = newspaperStormKicker(key);
    node.setAttribute('role', 'button');
  });
  const start = newspaperEl('btnStartMenu');
  if (start && !start.classList.contains('newspaper-unleash')) {
    start.classList.add('newspaper-unleash');
    start.innerHTML = '<small>EXTRA! EXTRA! ISSUE THE WARNING!</small>UNLEASH STORM';
    start.setAttribute('aria-label', 'Unleash selected storm');
  }
  if (!newspaperEl('newspaperLegal')) {
    const legal = document.createElement('p'); legal.id = 'newspaperLegal'; legal.className = 'newspaper-legal';
    legal.textContent = 'Printed under emergency authority. Moo Brew advertisements are not meteorological advice.';
    card.appendChild(legal);
  }
  return true;
}

function refreshNewspaperMenu() {
  decorateNewspaperMenu();
  const cards = [...document.querySelectorAll('#mainMenu .storm-card')];
  const selected = cards.find((node) => node.classList.contains('selected')) || cards[0];
  cards.forEach((node) => node.setAttribute('aria-pressed', String(node === selected)));
  const lead = newspaperEl('newspaperLead');
  if (lead && selected) {
    const label = selected.querySelector('h3')?.textContent?.trim() || 'STORM';
    const traits = selected.querySelector('p')?.textContent?.trim() || 'Read the official bulletin.';
    const leadHtml = `<b>LEAD FORECAST: ${label}</b> — ${traits}`;
    if (lead.innerHTML !== leadHtml) lead.innerHTML = leadHtml;
  }
  newspaperState.refreshes++;
}

function newspaperHeadline(title, grade, score) {
  if (/MOO COUNTY/i.test(title)) return grade === 'UDDER CHAOS' ? 'FAIR BOARD DECLARES TOTAL UDDER CHAOS' : 'COUNTY FAIR FILES BOVINE EMERGENCY UPDATE';
  if (grade === 'S+') return 'LOCAL STORM EARNS FRONT-PAGE DISRUPTION';
  if (Number(String(score).replace(/[^0-9.-]/g, '')) >= 4500) return 'COUNTY REASSESSING STRUCTURAL EXPECTATIONS';
  return 'WEATHER DESK REPORTS A VERY EVENTFUL AFTERNOON';
}

function decorateNewspaperResults() {
  const overlay = newspaperEl('resultsOverlay');
  const card = overlay?.querySelector('.results-card');
  if (!overlay || !card) return false;
  overlay.classList.add('newspaper-results-overlay'); card.classList.add('newspaper-results-card');
  const title = card.querySelector('h2'); const grade = card.querySelector('.grade-stamp');
  if (!newspaperEl('newspaperResultsMasthead')) {
    const masthead = document.createElement('div'); masthead.id = 'newspaperResultsMasthead'; masthead.className = 'newspaper-results-masthead'; masthead.textContent = 'SEVERE WEATHER WARNING · EVENING EDITION';
    const kicker = document.createElement('div'); kicker.className = 'newspaper-results-kicker'; kicker.textContent = 'OFFICIAL RUN REPORT · NUMBERS FILED BY THE HEARTLAND DESK';
    card.insertBefore(masthead, title || card.firstChild); card.insertBefore(kicker, title || card.firstChild);
  }
  if (!newspaperEl('newspaperResultReadout')) {
    const readout = document.createElement('div'); readout.id = 'newspaperResultReadout'; readout.className = 'newspaper-result-readout';
    readout.innerHTML = '<span id="newspaperResultRank">RANK PENDING</span><strong id="newspaperResultScore">0</strong>';
    if (grade?.nextSibling) card.insertBefore(readout, grade.nextSibling); else card.appendChild(readout);
  }
  if (!newspaperEl('newspaperStoryDeck')) {
    const deck = document.createElement('section'); deck.id = 'newspaperStoryDeck'; deck.className = 'newspaper-story-deck';
    deck.innerHTML = '<h3 id="newspaperStoryHeadline">WEATHER DESK STANDING BY</h3><p id="newspaperStoryCopy">The final numbers will be printed here.</p><div class="newspaper-stat-columns"><div>DESTRUCTION DESK<b id="newspaperDestructionStat">—</b></div><div>GRID DESK<b id="newspaperGridStat">—</b></div><div>FIELD NOTES<b id="newspaperFieldStat">—</b></div><div>SECRET FILE<b id="newspaperSecretStat">—</b></div></div>';
    const stats = card.querySelector('.results-stats');
    if (stats) stats.insertAdjacentElement('beforebegin', deck); else card.appendChild(deck);
  }
  return true;
}

function refreshNewspaperResults() {
  decorateNewspaperResults();
  const title = newspaperText('resStormTitle', 'WEATHER WARNING RUN');
  const grade = newspaperText('resGrade', 'PENDING');
  const score = newspaperText('resScore', '0');
  const set = (id, value) => setNewspaperText(newspaperEl(id), value);
  set('newspaperResultRank', `RANK ${grade}`); set('newspaperResultScore', score);
  set('newspaperStoryHeadline', newspaperHeadline(title, grade, score));
  set('newspaperStoryCopy', `${title} closes at ${score} points. The score desk printed the existing run record without editorial adjustment.`);
  set('newspaperDestructionStat', newspaperText('resBlocks', '0'));
  set('newspaperGridStat', newspaperText('resSubstations', '0'));
  set('newspaperFieldStat', newspaperText('resMediaMoments', newspaperText('resLandmarks', '0')));
  set('newspaperSecretStat', newspaperText('resCosmetic', 'PENDING'));
  newspaperState.resultRefreshes++;
}

function decorateOpeningNewspaperWhenPresent() {
  const paper = document.querySelector('.identity-intro-newspaper');
  if (!paper) return false;
  paper.classList.add('newspaper-opening-edition');
  const kicker = paper.querySelector('.identity-intro-newspaper-kicker');
  setNewspaperText(kicker, 'SEVERE WEATHER WARNING GAZETTE · SPECIAL WEATHER EDITION');
  return true;
}

function installNewspaperPresentation() {
  installNewspaperStyles(); refreshNewspaperMenu(); refreshNewspaperResults(); decorateOpeningNewspaperWhenPresent();
  const menu = newspaperEl('mainMenu'); const results = newspaperEl('resultsOverlay');
  // Presentation follows existing user actions and result visibility; it never watches
  // the game UI's full mutation stream or becomes a second UI-state authority.
  menu?.addEventListener('click', () => setTimeout(refreshNewspaperMenu, 0));
  let lastResultSignature = '';
  setInterval(() => {
    if (!results?.classList.contains('active')) return;
    const signature = ['resStormTitle','resGrade','resScore','resBlocks','resSubstations','resMediaMoments','resCosmetic'].map(id => newspaperText(id)).join('|');
    if (signature !== lastResultSignature) { lastResultSignature = signature; refreshNewspaperResults(); }
  }, 180);
}

installNewspaperPresentation();
globalThis.getNewspaperPresentationQaState = function getNewspaperPresentationQaState() {
  const selected = document.querySelector('#mainMenu .storm-card.selected');
  const result = newspaperEl('resultsOverlay');
  return Object.freeze({ marker: SW_UI_001_NEWSPAPER_MARKER, title: newspaperEl('mainMenu')?.querySelector('.menu-title')?.textContent?.trim() || '', selectedStorm: selected?.querySelector('h3')?.textContent?.trim() || '', selectedMarked: selected?.getAttribute('aria-pressed') === 'true', launchLabel: newspaperEl('btnStartMenu')?.textContent?.replace(/\s+/g, ' ').trim() || '', resultsActive: result?.classList.contains('active') === true, resultRank: newspaperText('newspaperResultRank'), resultScore: newspaperText('newspaperResultScore'), headline: newspaperText('newspaperStoryHeadline'), mooCard: { exists: Boolean(newspaperEl('menuCardMooLevel')), label: newspaperText('mooLevelCardLabel'), locked: newspaperEl('menuCardMooLevel')?.classList.contains('locked') === true }, openingCompatible: Boolean(document.querySelector('.identity-intro-newspaper')?.classList.contains('newspaper-opening-edition')), refreshes: { ...newspaperState } });
};
