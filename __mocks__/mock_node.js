//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//

// Ensure any fn's that rely on jest mocking still work
require("./shim_jest");

var Module = require('module').Module;

if (process.env.CONFIG_NAME === 'development') {
  //
  // If running in dev mode, use all available mocks
  //
  console.warn('--- Injecting All TC mocks ---');
  var nodeModulePaths= Module._nodeModulePaths; //backup the original method
  Module._nodeModulePaths = (from) => {
    // call the original method
    const original = nodeModulePaths.call(this, from);
    // No circular loop - don't re-import from mocks from within mocks
    return from.includes('__mocks__')
      ? original
      : [
        __dirname,
        ...original,
      ]
  };
}
else {
  //
  // If this is a live setting, we only mock the bank API
  // (and gmail?)
  //
  console.warn('--- Injecting Minimal TC mocks ---');
  var resolveFilename = Module._resolveFilename;
  const mockedModules = ["@thecointech/rbcapi"];
  // In dev:live, we do not call off the machine
  if (process.env.CONFIG_NAME === 'devlive')
    mockedModules.push("googleapis", "google-auth-library");

  Module._resolveFilename = (request, parent, isMain) => {
    return (mockedModules.find(m => request.startsWith(m)) && !parent.path.includes('__mocks__'))
      ? `${__dirname}/${request}.ts`
      : resolveFilename(request, parent, isMain)
  }
}
