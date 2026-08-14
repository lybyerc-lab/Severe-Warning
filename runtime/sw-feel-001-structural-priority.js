// ============================================================================
// [SW:FEEL:001_STRUCTURAL_PRIORITY]
// Keeps generic fragment bursts subordinate to readable structural anatomy.
// Presentation only: authoritative destruction, damage, score, collision, and
// target eligibility remain untouched.
// ============================================================================
const SW_FEEL_001_STRUCTURAL_PRIORITY_MARKER = 'SW_FEEL_001_STRUCTURAL_PRIORITY_V1';

const swFeel001StructuralPriorityState = {
  marker: SW_FEEL_001_STRUCTURAL_PRIORITY_MARKER,
  structuralEvents: 0,
  genericFragmentsAllowed: 0,
  genericFragmentsSuppressed: 0,
  lastFamily: null,
};

let swFeel001StructuralPriorityActive = false;
let swFeel001StructuralPriorityBudget = 0;
let swFeel001StructuralPriorityUsed = 0;

function swFeel001StructuralPriorityIsAnatomyGeometry(geometry) {
  if (!geometry || !swFeel001Geometries) return false;
  return geometry === swFeel001Geometries.roofPanel
    || geometry === swFeel001Geometries.wallPanel
    || geometry === swFeel001Geometries.facadePanel;
}

function swFeel001StructuralPriorityIsStructuralFamily(family) {
  return family === 'wood'
    || family === 'masonry'
    || family === 'glass'
    || family === 'metal'
    || family === 'silo'
    || family === 'concrete'
    || family === 'other';
}

const swFeel001StructuralPriorityPrevSpawn = swFeel001SpawnDebrisFragment;
swFeel001SpawnDebrisFragment = function swFeel001SpawnDebrisFragmentStructuralPriority(...args) {
  const geometry = args[6];
  if (swFeel001StructuralPriorityActive && !swFeel001StructuralPriorityIsAnatomyGeometry(geometry)) {
    if (swFeel001StructuralPriorityUsed >= swFeel001StructuralPriorityBudget) {
      swFeel001StructuralPriorityState.genericFragmentsSuppressed += 1;
      return null;
    }
    swFeel001StructuralPriorityUsed += 1;
    swFeel001StructuralPriorityState.genericFragmentsAllowed += 1;
  }
  return swFeel001StructuralPriorityPrevSpawn(...args);
};

const swFeel001StructuralPriorityPrevPresentation = swFeel001PresentDestruction;
swFeel001PresentDestruction = function swFeel001PresentDestructionStructuralPriority(target, source = 'storm') {
  const family = swFeel001GetMaterialFamily(target);
  const structural = target && !target.isTree && !target.isCow && swFeel001StructuralPriorityIsStructuralFamily(family);

  if (!structural) {
    return swFeel001StructuralPriorityPrevPresentation(target, source);
  }

  swFeel001StructuralPriorityActive = true;
  swFeel001StructuralPriorityBudget = 2;
  swFeel001StructuralPriorityUsed = 0;
  swFeel001StructuralPriorityState.structuralEvents += 1;
  swFeel001StructuralPriorityState.lastFamily = family;
  try {
    return swFeel001StructuralPriorityPrevPresentation(target, source);
  } finally {
    swFeel001StructuralPriorityActive = false;
    swFeel001StructuralPriorityBudget = 0;
    swFeel001StructuralPriorityUsed = 0;
  }
};

globalThis.getSwFeel001StructuralPriorityState = function getSwFeel001StructuralPriorityState() {
  return Object.freeze({ ...swFeel001StructuralPriorityState });
};
// [SW:FEEL:001_STRUCTURAL_PRIORITY:END]
