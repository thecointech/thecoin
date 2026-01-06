const { existsSync } = require('fs');
const path = require('path');

// This file largely mirrors the custom resolver in ncr-ts

module.exports = function (request, options) {

  let maybeMocked = getMockedIfExists(request, options);

  // Strip suffix from setenv files.  This package is our entry point for all our
  // scripts, but cannot itself alter file resolution.  This means it compiles with
  // nodeResolution: NodeNext, and it's includes include suffices.  One day, the rest
  // of the project will migrate to include suffixes (*.js) and we can drop this.
  const hasSuffix = request.startsWith("./") && request.endsWith(".js");
  const stripSuffix = hasSuffix && options.basedir.endsWith(path.join('setenv', 'src'))
  if (stripSuffix) {
    maybeMocked = maybeMocked.slice(0, -3);
  }

  if (options.conditions?.includes("browser")) {
    maybeMocked = applyBrowserRemapping(maybeMocked, options.basedir);
  }

  if (request.startsWith("@/")) {
    maybeMocked = applySrcRemapping(maybeMocked, options.basedir)
  }

  try {
    const r = options.defaultResolver(maybeMocked, {
      ...options,
      conditions: getConditions(options.conditions),
      mainFields: getMainFields(request),
      moduleDirectories: getModuleDirectories(request),
    })
    return r;
  } catch (e) {
    const isOurModule = request.startsWith("@thecointech");
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
    ? ["test", "development", ...conditions]
    : ["test", "development"];


const getMainFields = (request) => {
  // We want to use named imports from this
  // package, which requires ESM.  However,
  // by default jest-resolver does not read
  // the "module" field in package.json
  const packagesToModularize = [
    "react-helmet-async",
  ]
  return packagesToModularize.find(p => request.startsWith(p))
    ? ["module", "main"]
    : undefined;
}

// Apply browser field remapping from package.json
// e.g., when code inside ethers imports "./lib.esm/providers/ws.js"
// it should be remapped to "./lib.esm/providers/ws-browser.js" based on ethers' browser field
function applyBrowserRemapping(request, basedir) {
  // Only process relative imports
  if (!request.startsWith('./')) {
    return request;
  }

  // Walk up directory tree to find package.json with browser field
  let currentDir = basedir;
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath);

        // Stop at thecoin monorepo root or workspace boundaries
        if (packageJson.workspaces || packageJson.name === '@thecointech/thecoin') {
          break;
        }

        if (packageJson.browser && typeof packageJson.browser === 'object') {
          // Get the package root directory
          const packageRoot = path.dirname(packageJsonPath);

          // Calculate the path from package root to the current basedir
          const relativeDir = path.relative(packageRoot, basedir);

          // Combine with the request to get the full path from package root
          const fullPath = path.join(relativeDir, request);

          // Normalize to use forward slashes and ensure it starts with ./
          const normalizedPath = './' + fullPath.split(path.sep).join('/');

          // Check if this path is in the browser remapping
          if (packageJson.browser[normalizedPath]) {
            const browserPath = packageJson.browser[normalizedPath];
            // If mapped to false, return original (means "exclude from browser")
            if (browserPath === false) {
              return request;
            }

            // Calculate the relative path from basedir to the browser alternative
            const browserFullPath = path.join(packageRoot, browserPath.startsWith('./') ? browserPath.slice(2) : browserPath);
            const browserRelative = path.relative(basedir, browserFullPath);
            return './' + browserRelative.split(path.sep).join('/');
          }
        }
      } catch (e) {
        // Failed to read/parse package.json, continue
      }
    }

    currentDir = path.dirname(currentDir);
  }

  return request;
}


const getSrcDir = (folder) => {
  let baseDir = path.join(folder, '..');
  while (
    // The first package we come to is package root
    !existsSync(path.join(baseDir, 'package.json')) ||
    // Unless it is in a 'src' directory (ie, harvester)
    path.basename(baseDir) === "src"
  ) {
    baseDir = path.join(baseDir, '..');
    if (baseDir.length < 7) {
      throw new Error(`Could not find root package.json in ${folder}`);
    }
  }
  return path.join(baseDir, 'src');
}

// Remap "@/dir/filename" to "<root>/src/dir/filename"
function applySrcRemapping(request, basedir) {
  const srcDir = getSrcDir(basedir);
  return path.join(srcDir, request.slice(2));
}
