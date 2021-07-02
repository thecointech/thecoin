//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//

console.warn('--- Injecting TC mocks ---');

// Ensure any fn's that rely on jest mocking still work
require("./shim_jest");

var Module = require('module').Module;
var nodeModulePaths= Module._nodeModulePaths; //backup the original method
Module._nodeModulePaths = function(from) {
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
