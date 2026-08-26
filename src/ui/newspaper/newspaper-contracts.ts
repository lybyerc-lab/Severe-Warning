/**
 * [SW:ARCH:NEWSPAPER_CONTRACTS]
 * Type contracts for the Broadsheet Newspaper presentation system (Morning Launch & Evening Results).
 */

export interface NewspaperResultInput {
  districtName: string;
  destructionScore: number;
  grade: string;
  efRating: string;
  targetsDestroyed: number;
  polesSparked: number;
  maxCombo: number;
  isFairCounty?: boolean;
}

export interface NewspaperHeadlineReport {
  headline: string;
  subheadline: string;
  storyCopy: string;
  edition: string;
}

export interface NewspaperPresentationSnapshot {
  morningEditionActive: boolean;
  eveningEditionActive: boolean;
  latestHeadline: string | null;
  refreshes: number;
}

export interface NewspaperPresentationContract {
  generateHeadline(input: NewspaperResultInput): NewspaperHeadlineReport;
  formatMenuLead(districtName: string, description: string): string;
  getSnapshot(): NewspaperPresentationSnapshot;
  reset(): void;
}
