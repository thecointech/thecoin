//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//
const Module = require('module').Module;

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

function enhancedModuleResolve(...modules) {
  // NOTE: __dirname is where I keep some external mocks
  const resolver = require('enhanced-resolve').create.sync({
      conditionNames: [process.env.CONFIG_NAME, 'require', 'node', 'default'],
      extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
      modules: [__dirname, 'node_modules'],
    })

  // NOTE: If we redirect all resolutions, breakpoints stop working
  // Just redirect my own packages (and whichever external API's
  // I want to have mocked) and everything works correctly
  const toResolve = ['@thecointech', ...modules]
  const oldResolve = Module._resolveFilename
  Module._resolveFilename = (request, parent, isMain) => {
    return toResolve.find(m => request.startsWith(m))//paths
      ? resolver(parent.path, request)
      : oldResolve(request, parent, isMain)
  }
}

////////////////////////////////////////////////////////////////


switch (process.env.CONFIG_NAME) {
  case 'development':
    //
    // If running in dev mode, use all available mocks
    //
    console.warn('--- Injecting All TC mocks ---');
    mockAll();
    enhancedModuleResolve();
    break;
  case 'devlive':
    //
    // Dev live is internally connected, but all external connections are mocked
    //
    console.warn('--- Injecting external TC mocks ---');
    enhancedModuleResolve("googleapis", "google-auth-library");
    break;
  default:
    enhancedModuleResolve();
    throw new Error('Unknown testing environment');
}


