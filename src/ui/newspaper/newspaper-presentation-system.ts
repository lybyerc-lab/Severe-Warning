import type {
  NewspaperResultInput,
  NewspaperHeadlineReport,
  NewspaperPresentationSnapshot,
  NewspaperPresentationContract
} from './newspaper-contracts.ts';

export class NewspaperPresentationSystem implements NewspaperPresentationContract {
  private morningActive = true;
  private eveningActive = false;
  private latestHeadline: string | null = null;
  private refreshCount = 0;

  public generateHeadline(input: NewspaperResultInput): NewspaperHeadlineReport {
    this.refreshCount++;
    this.eveningActive = true;

    let headline = 'WEATHER DESK REPORTS A VERY EVENTFUL AFTERNOON';
    let subheadline = 'Official Run Report · Numbers Filed by the Heartland Desk';

    if (input.isFairCounty || /MOO|FAIR/i.test(input.districtName)) {
      headline = input.grade === 'S+' || input.grade === 'UDDER CHAOS'
        ? 'FAIR BOARD DECLARES TOTAL UDDER CHAOS'
        : 'COUNTY FAIR FILES BOVINE EMERGENCY UPDATE';
      subheadline = 'Bovine Atmospheric Situation Fully Documented by Dispatch';
    } else if (input.grade === 'S+') {
      headline = 'LOCAL STORM EARNS FRONT-PAGE DISRUPTION';
      subheadline = 'Record-Breaking Atmospheric Force Overwhelms District';
    } else if (input.destructionScore >= 45000 || input.targetsDestroyed >= 15) {
      headline = 'COUNTY REASSESSING STRUCTURAL EXPECTATIONS';
      subheadline = 'Municipal Engineering Board Holds Emergency Inspection';
    } else if (input.polesSparked >= 5) {
      headline = 'SUBSTATION BLACKOUT: POWER GRID EXPERIENCES SURGES';
      subheadline = 'Utility Crews Scramble to Restore High-Voltage Transmission';
    }

    const storyCopy = `${input.districtName.toUpperCase()} closes at ${input.destructionScore} points with ${input.targetsDestroyed} structures leveled and ${input.polesSparked} power poles sparked. The score desk printed the run record without editorial adjustment.`;

    this.latestHeadline = headline;

    return Object.freeze({
      headline,
      subheadline,
      storyCopy,
      edition: 'SEVERE WEATHER WARNING · EVENING DISPATCH'
    });
  }

  public formatMenuLead(districtName: string, description: string): string {
    this.morningActive = true;
    this.refreshCount++;
    return `LEAD FORECAST: ${districtName.toUpperCase()} — ${description}`;
  }

  public getSnapshot(): NewspaperPresentationSnapshot {
    return Object.freeze({
      morningEditionActive: this.morningActive,
      eveningEditionActive: this.eveningActive,
      latestHeadline: this.latestHeadline,
      refreshes: this.refreshCount
    });
  }

  public reset(): void {
    this.morningActive = true;
    this.eveningActive = false;
    this.latestHeadline = null;
  }
}
