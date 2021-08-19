//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//

const Module = require('module').Module;

//
// Allows using CONFIG_NAME-specific implementations returned
// from packages, and can also include mocks from __mocks__ for
// specified modules
//
function enhancedModuleResolve(useAllMocks, ...modules) {
  // NOTE: __dirname is where I keep some external mocks
  const resolver = require('enhanced-resolve').create.sync({
      conditionNames: [process.env.CONFIG_NAME, 'require', 'node', 'default'],
      extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
      modules: useAllMocks
        ? [__dirname, 'node_modules']
        : ['node_modules']
    })

  // NOTE: If we redirect all resolutions, breakpoints stop working
  // Just redirect my own packages (and whichever external API's
  // I want to have mocked) and everything works correctly
  const toResolve = ['@thecointech', ...modules]
  const oldResolve = Module._resolveFilename
  Module._resolveFilename = (request, parent, isMain) => {
    return (toResolve.length == 0 || toResolve.find(m => request.startsWith(m)))//paths
      ? resolver(parent.path, request)
      : oldResolve(request, parent, isMain)
  }
}

const useAllMocks = () => enhancedModuleResolve(true);
const useSomeMocks = (...modules) => enhancedModuleResolve(false, ...modules);

////////////////////////////////////////////////////////////////


switch (process.env.CONFIG_NAME) {
  case 'development':
    //
    // If running in dev mode, use all available mocks
    //
    console.warn('--- Injecting All TC mocks ---');
    useAllMocks(true);
    break;
  case 'devlive':
    //
    // Dev live is internally connected, but all external connections are mocked
    //
    console.warn('--- Injecting external TC mocks ---');
    useSomeMocks("googleapis", "google-auth-library");
    break;
  default:
    //
    // Production environments only use config-specific mocks
    // (namely, signers/rbcapi in prodtest)
    //
    console.warn(`--- Injecting ${process.env.CONFIG_NAME}-specific implementations ---`);
    useSomeMocks();
    break;
}


