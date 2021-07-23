///////////////////////////////////////////////////////////////
// Jest utility functions

// Replaces the default describe function with a version that can
// be automatically skipped.  This is useful for ignoring tests that
// might otherwise fail for reasons that don't indicate failure in the code
// if the callback is false or returns false,
const old_describe = describe;
const skippable_describe = async (name: number | string | Function, fn: () => void | Promise<void>, allowRun?: boolean|(() => boolean)) => {

  if (allowRun === false || (typeof allowRun === 'function' && allowRun() === false)) {
    return old_describe.skip(name, fn);
  }
  return old_describe(name, fn)
}
export { skippable_describe as describe }

// Simple test to test if the test is currently being explicitly run (eg
// by using the jest plugin for VS Code).  This can be useful if you have
// integration tests that have significant side-effects that are not desired on every run
// (for example, heavy CPU work, billed resources, or sending emails etc)
export const IsManualRun = process.argv.find(v => v === "--testNamePattern") !== undefined

///////////////////////////////////////////////////////////////
// For Jest tests that connect to the emulator:
// Do not attempt to connect if we do not have an
// active connection.

// Test if we currently have an emulator running
export const isEmulatorAvailable = () => !!(process.env.FIRESTORE_EMULATOR_PORT && process.env.FIRESTORE_EMULATOR_PORT !== 'false')
export function filterByEmulator() {
  if (!isEmulatorAvailable()) {
    //log.warn("Cannot connect to firestore, skipping unit tests");
    return false;
  }
  //console.log("Connecting to Firebase on port: " + process.env.FIRESTORE_EMULATOR_PORT);
  return true;
}
