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
