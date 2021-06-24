import { isEmulatorAvailable } from './types';
import { log } from '@thecointech/logging';
export { describe } from '@thecointech/jestutils';

///////////////////////////////////////////////////////////////
// For Jest tests that connect to the emulator:
// Do not attempt to connect if we do not have an
// active connection.

export function filterByEmulator() {
  if (!isEmulatorAvailable()) {
    log.warn("Cannot connect to firestore, skipping unit tests");
    return false;
  }
  console.log("Connecting to Firebase on port: " + process.env.FIRESTORE_EMULATOR_PORT);
  return true;
}

