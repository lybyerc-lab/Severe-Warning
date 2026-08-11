// ============================================================================
// [SW:GAME:RPG_V1]
// Local-first MOO-LAH, bounded tornado-verb upgrades, and the fixed three-slot
// Storm Triangle. This layer reads finalized scorekeeper results; it never
// calculates score, alters campaign progression, or changes movement authority.
// ============================================================================
const SW_RPG_001_MARKER = 'SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1';
const SW_RPG_STORAGE_KEY = 'severe_weather_moolah_v1';
const SW_RPG_SCHEMA_VERSION = 1;
const SW_RPG_STORM_TRIANGLE_VERSION = 'storm-triangle-v1';
const SW_RPG_UPGRADE_LOADOUT_VERSION = 'moolah-upgrades-v1';
const SW_RPG_ACTIVE_SLOTS = Object.freeze(['pull', 'gust', 'gridZap']);
const SW_RPG_UPGRADES = Object.freeze({
  pull: Object.freeze({ label: 'PULL', slot: 'primary', cost: 50, base: 2.5, upgraded: 3.25, unit: 's', description: 'Vortex hold: 2.50s to 3.25s.' }),
  gust: Object.freeze({ label: 'GUST', slot: 'secondary', cost: 75, base: 90, upgraded: 115, unit: ' damage', description: 'Target hit: 90 to 115 damage.' }),
  gridZap: Object.freeze({ label: 'GRID ZAP', slot: 'tertiary', cost: 100, base: 8, upgraded: 10, unit: ' nodes', description: 'Network cap: 8 to 10 nodes. Target damage remains 135.' })
});

let swRpgStore = swRpgLoadStore();
let swRpgLastReward = null;

function swRpgFinite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function swRpgEmptyStore() {
  return {
    schemaVersion: SW_RPG_SCHEMA_VERSION,
    moolah: 0,
    earned: 0,
    spent: 0,
    upgrades: { pull: 0, gust: 0, gridZap: 0 },
    stormTriangle: { version: SW_RPG_STORM_TRIANGLE_VERSION, slots: [...SW_RPG_ACTIVE_SLOTS] },
    lastReward: null
  };
}

function swRpgNormalizeStore(candidate) {
  const empty = swRpgEmptyStore();
  if (!candidate || candidate.schemaVersion !== SW_RPG_SCHEMA_VERSION) return empty;
  const upgrades = candidate.upgrades || {};
  const slots = candidate.stormTriangle?.slots;
  return {
    ...empty,
    moolah: Math.max(0, Math.floor(swRpgFinite(candidate.moolah))),
    earned: Math.max(0, Math.floor(swRpgFinite(candidate.earned))),
    spent: Math.max(0, Math.floor(swRpgFinite(candidate.spent))),
    upgrades: Object.fromEntries(SW_RPG_ACTIVE_SLOTS.map(key => [key, upgrades[key] === 1 ? 1 : 0])),
    // This slice has exactly the established three verbs. Invalid or future
    // layouts are normalized rather than gaining a fourth persistent slot.
    stormTriangle: {
      version: SW_RPG_STORM_TRIANGLE_VERSION,
      slots: Array.isArray(slots) && slots.length === 3 && slots.every((slot, index) => slot === SW_RPG_ACTIVE_SLOTS[index])
        ? [...slots] : [...SW_RPG_ACTIVE_SLOTS]
    },
    lastReward: candidate.lastReward && typeof candidate.lastReward === 'object'
      ? { amount: Math.max(0, Math.floor(swRpgFinite(candidate.lastReward.amount))), score: Math.max(0, Math.floor(swRpgFinite(candidate.lastReward.score))), bucket: String(candidate.lastReward.bucket || '') }
      : null
  };
}

function swRpgLoadStore() {
  try { return swRpgNormalizeStore(JSON.parse(localStorage.getItem(SW_RPG_STORAGE_KEY) || '{}')); }
  catch (_) { return swRpgEmptyStore(); }
}

function swRpgSaveStore() {
  try { localStorage.setItem(SW_RPG_STORAGE_KEY, JSON.stringify(swRpgStore)); return true; }
  catch (_) { return false; }
}

function swRpgUpgradeActive(key) { return swRpgStore.upgrades[key] === 1; }

function swRpgEffectValue(key) {
  const upgrade = SW_RPG_UPGRADES[key];
  return swRpgUpgradeActive(key) ? upgrade.upgraded : upgrade.base;
}

function swRpgAwardForAcceptedResult(result) {
  // No participation stipend: scoreless and sub-100 final results earn no
  // currency. The finalized scorekeeper result is the only earn authority.
  const score = Math.max(0, Math.floor(swRpgFinite(result?.score)));
  const amount = Math.floor(score / 100);
  if (amount <= 0) return null;
  const reward = Object.freeze({ amount, score, bucket: String(result?.bucket?.id || ''), source: 'accepted-scorekeeper-result' });
  swRpgStore.moolah += amount;
  swRpgStore.earned += amount;
  swRpgStore.lastReward = { amount, score, bucket: reward.bucket };
  swRpgLastReward = reward;
  swRpgSaveStore();
  return reward;
}

function purchaseSwRpgUpgrade(key) {
  const upgrade = SW_RPG_UPGRADES[key];
  if (!upgrade) return Object.freeze({ purchased: false, reason: 'unknown-upgrade' });
  if (swRpgUpgradeActive(key)) return Object.freeze({ purchased: false, reason: 'already-owned', key });
  if (swRpgStore.moolah < upgrade.cost) return Object.freeze({ purchased: false, reason: 'insufficient-moolah', key, cost: upgrade.cost, balance: swRpgStore.moolah });
  swRpgStore.moolah -= upgrade.cost;
  swRpgStore.spent += upgrade.cost;
  swRpgStore.upgrades[key] = 1;
  const persisted = swRpgSaveStore();
  refreshNewspaperResults();
  return Object.freeze({ purchased: true, key, cost: upgrade.cost, balance: swRpgStore.moolah, persisted });
}

function swRpgApplyAbilityUpgrade(slot, accepted) {
  if (!accepted || currentStorm !== 'tornado') return;
  if (slot === 'primary' && swRpgUpgradeActive('pull')) {
    pullVortexTimer = Math.max(pullVortexTimer, SW_RPG_UPGRADES.pull.upgraded);
  } else if (slot === 'secondary' && swRpgUpgradeActive('gust')) {
    const extraDamage = SW_RPG_UPGRADES.gust.upgraded - SW_RPG_UPGRADES.gust.base;
    targets.forEach(target => {
      if (target.destroyed || target.isCow || target.cowId === 17) return;
      const distance = Math.hypot(target.x - storm.pos.x, target.z - storm.pos.z);
      if (distance < storm.radius * 2.4) damageTarget(target, extraDamage, 'gust-upgrade');
    });
  }
}

// The first slice increases Grid Zap's already-authoritative network cap only.
// It deliberately leaves GRID_ZAP_TARGET_DAMAGE (135), range, hop distance,
// acquisition, cooldown, and the shared utility-network ownership untouched.
const swRpgBaseSelectGridZapTopology = selectGridZapTopology;
selectGridZapTopology = function swRpgSelectGridZapTopology(poles, options = {}) {
  const adjusted = swRpgUpgradeActive('gridZap')
    ? { ...options, maxNodes: Math.max(Number(options.maxNodes) || 0, SW_RPG_UPGRADES.gridZap.upgraded) }
    : options;
  return swRpgBaseSelectGridZapTopology(poles, adjusted);
};

const swRpgBaseTriggerAbility = triggerAbility;
triggerAbility = function swRpgRoutedAbility(slot, ...args) {
  const cooldown = cooldowns?.[slot];
  const before = cooldown ? Number(cooldown.current) : Infinity;
  const result = swRpgBaseTriggerAbility.call(this, slot, ...args);
  // When the modern Phase 3 bridge is present, it is wrapped below at its
  // actual request seam. This outer wrapper covers the shipped lexical path.
  if (!globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__) {
    swRpgApplyAbilityUpgrade(slot, Boolean(runActive && cooldown && before <= 0 && cooldown.current > before));
  }
  return result;
};

const swRpgPhase3Bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
if (swRpgPhase3Bridge?.requestAbility) {
  const swRpgBaseRequestAbility = swRpgPhase3Bridge.requestAbility.bind(swRpgPhase3Bridge);
  swRpgPhase3Bridge.requestAbility = function swRpgPhase3RequestAbility(slot, source) {
    const result = swRpgBaseRequestAbility(slot, source);
    swRpgApplyAbilityUpgrade(slot, result?.accepted === true);
    return result;
  };
}

function swRpgInstallNewspaperRewards() {
  if (document.getElementById('swRpgRewardsStyles')) return;
  const style = document.createElement('style');
  style.id = 'swRpgRewardsStyles';
  style.textContent = '.newspaper-rpg-rail{margin:6px 0;padding:6px;border-top:2px solid #263849;border-bottom:1px solid rgba(24,34,51,.5);background:rgba(255,255,255,.32);color:#263849;text-align:left}.newspaper-rpg-head{display:flex;justify-content:space-between;gap:8px;color:#af2723;font:1000 11px/1 Georgia,serif}.newspaper-rpg-copy{margin:3px 0 5px;font:800 7px/1.25 Inter,sans-serif;letter-spacing:.04em}.newspaper-rpg-slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px}.newspaper-rpg-slot{padding:4px;border:1px solid rgba(38,56,73,.55);background:rgba(255,255,255,.3);font:900 7px/1.15 Inter,sans-serif}.newspaper-rpg-slot b{display:block;font:1000 8px/1 Georgia,serif}.newspaper-rpg-slot button{width:100%;margin-top:3px;padding:3px;border:1px solid #263849;background:#263849;color:#fff9ec;font:900 6px/1 Inter,sans-serif;cursor:pointer}.newspaper-rpg-slot button:disabled{background:#69757f;border-color:#69757f;cursor:default}@media (max-height:540px),(max-width:850px){.newspaper-rpg-rail{margin:4px 0;padding:4px}.newspaper-rpg-head{font-size:9px}.newspaper-rpg-slot{padding:3px;font-size:6px}.newspaper-rpg-slot b{font-size:7px}}';
  document.head.appendChild(style);
}

function swRpgRenderNewspaperRewards() {
  swRpgInstallNewspaperRewards();
  const anchor = document.getElementById('newspaperScorekeeperRail') || document.getElementById('newspaperStoryDeck');
  if (!anchor) return;
  let rail = document.getElementById('swRpgRewardsRail');
  if (!rail) {
    rail = document.createElement('section');
    rail.id = 'swRpgRewardsRail';
    rail.className = 'newspaper-rpg-rail';
    anchor.insertAdjacentElement('afterend', rail);
  }
  const rewardText = swRpgLastReward || swRpgStore.lastReward;
  const reward = rewardText?.amount > 0 ? `FILED REWARD +${rewardText.amount} MOO-LAH` : 'FILE A FINAL SCORE TO EARN MOO-LAH';
  rail.innerHTML = `<div class="newspaper-rpg-head"><span>MOO-LAH DESK</span><span id="swRpgWallet">${swRpgStore.moolah} MOO-LAH</span></div><div class="newspaper-rpg-copy" id="swRpgRewardCopy">${reward}. STORM TRIANGLE: PULL / GUST / GRID ZAP.</div><div class="newspaper-rpg-slots">${SW_RPG_ACTIVE_SLOTS.map(key => {
    const upgrade = SW_RPG_UPGRADES[key]; const owned = swRpgUpgradeActive(key);
    return `<div class="newspaper-rpg-slot"><b>${upgrade.label}</b><span>${upgrade.base}${upgrade.unit} → ${upgrade.upgraded}${upgrade.unit}</span><button id="swRpgPurchase-${key}" type="button" ${owned || swRpgStore.moolah < upgrade.cost ? 'disabled' : ''}>${owned ? 'FILED' : `UPGRADE ${upgrade.cost}`}</button></div>`;
  }).join('')}</div>`;
  SW_RPG_ACTIVE_SLOTS.forEach(key => document.getElementById(`swRpgPurchase-${key}`)?.addEventListener('click', () => purchaseSwRpgUpgrade(key), { once: true }));
}

const swRpgBaseRefreshNewspaperResults = refreshNewspaperResults;
refreshNewspaperResults = function swRpgNewspaperRefresh(...args) {
  const result = swRpgBaseRefreshNewspaperResults.apply(this, args);
  swRpgRenderNewspaperRewards();
  return result;
};

const swRpgBaseFinishRun = finishRun;
finishRun = function swRpgRewardedFinishRun(...args) {
  const acceptedCompletion = runActive === true;
  const result = swRpgBaseFinishRun.apply(this, args);
  if (acceptedCompletion && scorekeeperLastResult) swRpgAwardForAcceptedResult(scorekeeperLastResult);
  refreshNewspaperResults();
  return result;
};

globalThis.getSwRpgBuildMetadata = function getSwRpgBuildMetadata() {
  return Object.freeze({
    stormTriangleVersion: SW_RPG_STORM_TRIANGLE_VERSION,
    upgradeLoadoutVersion: SW_RPG_UPGRADE_LOADOUT_VERSION,
    authority: 'active-local-first',
    activeSlots: [...swRpgStore.stormTriangle.slots],
    upgrades: { ...swRpgStore.upgrades }
  });
};

globalThis.getSwRpgQaState = function getSwRpgQaState() {
  return Object.freeze({
    marker: SW_RPG_001_MARKER,
    storageKey: SW_RPG_STORAGE_KEY,
    schemaVersion: SW_RPG_SCHEMA_VERSION,
    moolah: swRpgStore.moolah,
    earned: swRpgStore.earned,
    spent: swRpgStore.spent,
    upgrades: { ...swRpgStore.upgrades },
    stormTriangle: { version: swRpgStore.stormTriangle.version, slots: [...swRpgStore.stormTriangle.slots] },
    effects: Object.fromEntries(SW_RPG_ACTIVE_SLOTS.map(key => [key, { base: SW_RPG_UPGRADES[key].base, upgraded: SW_RPG_UPGRADES[key].upgraded, active: swRpgEffectValue(key) }])),
    targetDamage: typeof GRID_ZAP_TARGET_DAMAGE === 'undefined' ? null : GRID_ZAP_TARGET_DAMAGE,
    lastReward: swRpgLastReward || swRpgStore.lastReward,
    buildMetadata: globalThis.getSwRpgBuildMetadata()
  });
};

globalThis.__SW_RPG_001_QA__ = {
  reset() {
    try { localStorage.removeItem(SW_RPG_STORAGE_KEY); } catch (_) {}
    swRpgStore = swRpgEmptyStore(); swRpgLastReward = null; refreshNewspaperResults();
  }
};

swRpgRenderNewspaperRewards();
// [SW:GAME:RPG_V1:END]
