import type {
  ResultsSituationReport,
  ResultsSystemContract
} from './results-contracts.ts';

export class ResultsSystem implements ResultsSystemContract {
  private activeReport: ResultsSituationReport | null = null;
  private visible = false;

  public presentResults(report: ResultsSituationReport): void {
    this.activeReport = { ...report };
    this.visible = true;
  }

  public hideResults(): void {
    this.activeReport = null;
    this.visible = false;
  }

  public getReport(): ResultsSituationReport | null {
    return this.activeReport ? { ...this.activeReport } : null;
  }

  public isOpen(): boolean {
    return this.visible;
  }
}
