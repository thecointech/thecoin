//
// Inject the __mock__ folder in the top of the search tree in NodeJS
//
// This is a simple hack to allow our NodeJS apps to run in dev mode
// using the same mocks as testing/dev websites.
//

const Module = require('module').Module;
const ehr = require('enhanced-resolve');

//
// Allows using CONFIG_NAME-specific implementations returned
// from packages, and can also include mocks from __mocks__ for
// specified modules
//
function enhancedModuleResolve(...toMock) {
  // NOTE: __dirname is where I keep some external mocks
  const mockResolver = ehr.create.sync({
      extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
      modules: [__dirname, 'node_modules']
    })
  const coinResolver = ehr.create.sync({
    conditionNames: [process.env.CONFIG_NAME, 'require', 'node', 'default'],
    extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
  })

  // NOTE: If we redirect all resolutions, breakpoints stop working
  // Just redirect my own packages (and whichever external API's
  // I want to have mocked) and everything works correctly
  const oldResolve = Module._resolveFilename
  Module._resolveFilename = (request, parent, isMain) => {
    return request.startsWith('@thecointech') // our packages include their own mocks
      ? coinResolver(parent.path, request)
      : (toMock.length == 0 || toMock.find(m => request.startsWith(m))) // any explicitly mocked external packages
        ? mockResolver(parent.path, request)
        : oldResolve(request, parent, isMain) // fallback to default resolver
  }
}

const useAllMocks = () => enhancedModuleResolve();
const useSomeMocks = (...modules) => enhancedModuleResolve(...modules);

////////////////////////////////////////////////////////////////


switch (process.env.CONFIG_NAME) {
  case 'development':
    //
    // If running in dev mode, use all available mocks
    //
    console.warn('--- Injecting All TC mocks ---');
    useAllMocks();
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


