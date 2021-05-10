import { isEmulatorAvailable } from './types';
export { init, release } from './debug';
import { describe } from "@thecointech/jestutils"

///////////////////////////////////////////////////////////////
// Firestore helper functions

const filterByEmulator = () => {
  if (!isEmulatorAvailable()) {
    console.warn("Cannot connect to firestore, abandoning unit tests");
    return false;
  }
  return true;
}

const db_describe = async (name: number | string | Function, tests: () => void | Promise<void>) =>
  describe(name, tests, filterByEmulator);

export { db_describe as describe, isEmulatorAvailable }
