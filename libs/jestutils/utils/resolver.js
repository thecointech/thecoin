const { existsSync } = require('fs');
const path = require('path');

module.exports = function (request, options) {

  const maybeMocked = getMockedIfExists(request, options);

  const isOurModule = request.startsWith("@thecointech");

  try {
    return options.defaultResolver(maybeMocked, {
      ...options,
      conditions: getConditions(options.conditions),
      packageFilter: getPackageFilter(request),
      moduleDirectories: getModuleDirectories(request),
    })
  } catch (e) {
    if (isOurModule) {
      // Jest resolver only resolves the first entry of an
      // `exports` object, so where we have multiple (site-base)
      // it always returns the first one, even when it is the second
      // that is valid
      const bits = request.split("/").slice(1);
      const r = path.join(__dirname, '../../..', 'node_modules/@thecointech', bits[0], 'build', ...bits.slice(1), 'index.js');
      if (existsSync(r)) {
        return r;
      }
    }

    // If no match, re-throw the origianl exception
    throw e
  }

  //   // Jest resolver only resolves the first entry of an
  //   // `exports` object, so where we have multiple (site-base)
  //   // it always returns the first one, even when it is the second
  //   // that is valid
  //   if (isOurModule) {
  //     if (!existsSync(r)) {
  //       // see if there is a folder & index.js here
  //       const parsed = path.parse(r);
  //       const index = path.join(parsed.dir, parsed.name, "index.js");
  //       if (existsSync(index)) {
  //         return index;
  //       }
  //     }
  //   }
  //   return r;

  // } catch (e) {
  //   throw e
  // }
}

/*
|-------------------------------------------------------------------------------
| Utils
| see: https://github.com/facebook/jest/issues/2702
*/

function getModuleDirectories(options, isOurModule) {
  return isOurModule
    ? [...options.moduleDirectories, "src"]
    : options.moduleDirectories;
}

// Manually check for a mocked version of the package
function getMockedIfExists(request, options) {
  if (request.startsWith('.')) return request;
  // First, try for a __mocked__ vresion of the import
  // This is because `exports` breaks the simple path override
  const mockRoot = options.moduleDirectory?.find(d => d.includes('__mocks__'));
  if (mockRoot) {
    const mockFolder = path.join(mockRoot, request);
    // If folder exists
    if (existsSync(mockFolder)) {
      return mockFolder;
    }
    const mockFile = `${mockFolder}.ts`;
    if (existsSync(mockFile)) {
      return mockFile;
    }
  }
  return request;
}

// When preferring "import" some CJS modules
// end up requiring "MJS".
// Ex: Must use import to load ES Module: C:\src\TheCoin\node_modules\pouchdb\node_modules\uuid\wrapper.mjs
const getConditions = (conditions) =>
  conditions
    ? ["development", ...conditions]
    : undefined;

const getPackageFilter = (request) => {
    // Map the module field to exports except
  // when importing a sub-path
  // const couldBeModule = (
  //   options?.conditions?.includes("import") &&
  //   !request.includes('/') &&
  //   !request.includes('\\')
  // );

  // Opt-in to modularization
  const packagesToModularize = [
    "react-dropzone",
    "@prismicio/react",
  ]
  return packagesToModularize.find(p => request.startsWith(p))
    ? mapModuleFieldToExports
    : undefined;
}

function mapModuleFieldToExports (pkg, pkgDir) {
  // manually force prismic/react to be a module
  if (pkgDir.includes(`@prismicio${path.sep}react`))
    pkg.type = "module";

  if (pkg.exports || !pkg.module)
    return pkg;

  const moduleFile = path.resolve(pkgDir, pkg.module);
  if (existsSync(moduleFile)) {
    // Auto-convert into module
    pkg.type = "module";
    pkg.exports = {
      ".": {
        require: pkg.main,
        import: pkg.module,
      },
    }
  }
  return pkg
}
