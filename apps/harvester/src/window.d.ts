import { Recorder } from './scraper/record';
import type { ScraperBridgeApi } from './scraper_actions';

declare global {
  interface Window {
    scraper: ScraperBridgeApi
    AllowOverrides: boolean
  }
}
