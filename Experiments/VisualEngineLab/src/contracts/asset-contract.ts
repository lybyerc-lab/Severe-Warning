export type AssetCategory =
  | 'cow' | 'barn' | 'house' | 'commercial' | 'silo' | 'utility-pole'
  | 'news-van' | 'landmark' | 'tree' | 'tractor' | 'hay-bale' | 'road-module';

export interface VisualAssetContract {
  readonly id: string;
  readonly category: AssetCategory;
  readonly source: 'procedural' | 'glb';
  readonly uri?: string;
  readonly scaleMeters: number;
  readonly materialFamily: MaterialFamily;
  readonly lods: readonly string[];
  readonly collisionNode?: string;
  readonly licenseRecord?: string;
}

export type MaterialFamily =
  | 'wood' | 'roofing' | 'sheet-metal' | 'masonry' | 'concrete'
  | 'glass' | 'utility' | 'vehicle' | 'foliage' | 'hay';
