///////////////////////////////////////////////////////////////
// Jest utility functions

// Replaces the default describe function with a version that can
// be automatically skipped.  This is useful for ignoring tests that
// might otherwise fail for reasons that don't indicate failure in the code
const old_describe = describe;
const db_describe = async (name: number | string | Function, test: boolean|(() => boolean), fn: () => void | Promise<void>) => {

  if (!test || (typeof test === 'function' && !test())) {
    return old_describe.skip(name, fn);
  }
  return old_describe(name, fn)
}

// Simple test to test if the test is currently being explicitly run (eg
// by using the jest plugin for VS Code).  This can be useful if you have
// integration tests that have significant side-effects that are not desired on every run
// (for example, heavy CPU work, billed resources, or sending emails etc)
const IsManualRun = process.argv.find(v => v === "--testNamePattern") !== undefined

export { db_describe as describe, IsManualRun }
