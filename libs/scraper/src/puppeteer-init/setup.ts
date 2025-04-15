import { installChrome } from './browser';
import { maybeCopyProfile } from './userProfile';

export function setupScraper(progress?: (bytes: number, total: number) => void) {
  const installation = installChrome(progress);
  const copy = maybeCopyProfile();
  return Promise.all([installation, copy]);
}
