import { log } from '@thecointech/logging';
import type { ZXCVBNResult } from 'zxcvbn';

// This is the link to the zxcvbn function that
// does the actual password scoring
let zxcvbn: ((password: string, userInputs?: string[]) => ZXCVBNResult)|null = null;
export async function ensureZxcvbn() {
  if (zxcvbn)
    return;

  try {
    zxcvbn = (await import("zxcvbn")).default;
  }
  catch (e) {
    log.error("Error loading PasswordVerifier: ", e);
  }
}

export function getScore(val: string): ZXCVBNResult|null {
  if (!zxcvbn) {
    return null;
  }
  return zxcvbn(val);
}
