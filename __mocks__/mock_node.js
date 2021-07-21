//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//

// Ensure any fn's that rely on jest mocking still work in regular node environment
require("./shim_jest");

var Module = require('module').Module;

function mockModules(...mockedModules) {
  var resolveFilename = Module._resolveFilename;
  Module._resolveFilename = (request, parent, isMain) => {
    return (mockedModules.find(m => request.startsWith(m)) && !parent.path.includes('__mocks__'))
      ? `${__dirname}/${request}.ts`
      : resolveFilename(request, parent, isMain)
  }
}
function mockAll() {
  var nodeModulePaths = Module._nodeModulePaths; //backup the original method
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

////////////////////////////////////////////////////////////////

switch (process.env.CONFIG_NAME) {
  case 'development':
    //
    // If running in dev mode, use all available mocks
    //
    console.warn('--- Injecting All TC mocks ---');
    mockAll();
    break;
  case 'devlive':
    //
    // Dev live is internally connected, but all external connections are mocked
    //
    console.warn('--- Injecting external TC mocks ---');
    mockModules(
      "googleapis",
      "google-auth-library",
      "@thecointech/rbcapi",
      "@thecointech/store",
      "@thecointech/email",
      "@thecointech/market-status"
    );
    break;
  case 'prodtest':
    //
    // ProdTest is fully live (just no real money)
    //
    console.warn('--- Injecting Bank mocks ---');
    mockModules("@thecointech/rbcapi");
    break;
  default:
    throw new Error('Unknown testing environment');
}


