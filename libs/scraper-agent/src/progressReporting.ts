import { SectionProgressCallback, sections } from "./processors/types";

export type ProgressInfo = {
  section: number;
  totalSections: number;
  sectionPercent: number;
}
export type ProgressCallback = (progress: ProgressInfo) => void;
export interface IProgressReporter {
  currentSection: number;
  sectionReporter: SectionProgressCallback;
}

export class ProgressReporter implements IProgressReporter {
  currentSection = 0;
  totalSections = sections.length; // CookieBanner, Landing, Login, TwoFA (if needed)
  sectionReporter: SectionProgressCallback;

  constructor(onProgress?: ProgressCallback) {
    this.sectionReporter = (sectionPercent: number) => {
      onProgress?.({
        section: this.currentSection,
        totalSections: this.totalSections,
        sectionPercent
      });
    }
  }
}
