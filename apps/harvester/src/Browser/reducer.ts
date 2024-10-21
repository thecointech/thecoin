import { BaseReducer } from "@thecointech/shared/store/immerReducer";

const BROWSER_KEY = "browser";

export type BrowserDownloadState = {
  percent?: number
  completed?: boolean
  error?: string
}
export interface IActions {
  installBrowser(): void;
  setDownloadState(state: BrowserDownloadState): void;
}

const hasCompatibleBrowser = await window.scraper.hasCompatibleBrowser();
const hasInstalledBrowser = await window.scraper.hasInstalledBrowser();
const initialState = {
  hasCompatibleBrowser: hasCompatibleBrowser.value ?? false,
  hasInstalledBrowser: hasInstalledBrowser.value ?? false,
  isInstalling: false,
  downloadPercent: undefined as number|undefined,
  downloadError: undefined as string|undefined,
}

export class BrowserReducer extends BaseReducer<IActions, typeof initialState>(BROWSER_KEY, initialState)
  implements IActions {
  installBrowser(): void {
    this.draftState.isInstalling = true;
    // Install in background, no need to wait
    window.scraper.installBrowser();
  }
  setDownloadState(progress: BrowserDownloadState): void {
    if (progress.percent) {
      this.draftState.downloadPercent = progress.percent
    }
    if (progress.error) {
      this.draftState.downloadError = progress.error
      this.draftState.isInstalling = false;
    }
    if (progress.completed) {
      this.draftState.hasInstalledBrowser = true;
      this.draftState.isInstalling = false;
    }
  }
}
