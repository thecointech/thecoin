import { isEmulatorAvailable } from './debug';
export { isEmulatorAvailable, init } from './debug';

///////////////////////////////////////////////////////////////
// Firestore helper functions

const old_describe = describe;
const db_describe = async (name: number | string | Function, fn: () => void | Promise<any>) => {

  if (!isEmulatorAvailable) {
    console.warn("Cannot connect to firestore, abandoning unit tests");
    return old_describe.skip(name, fn);
  }
  return old_describe(name, fn)
}

export { db_describe as describe }
