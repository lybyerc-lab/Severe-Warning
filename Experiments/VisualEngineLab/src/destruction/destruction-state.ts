export const DESTRUCTION_STAGES = ['intact', 'damaged', 'exposed', 'partial-collapse', 'wreckage'] as const;
export type DestructionStage = (typeof DESTRUCTION_STAGES)[number];

export function destructionStageIndex(stage: DestructionStage): number {
  return DESTRUCTION_STAGES.indexOf(stage);
}
