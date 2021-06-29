const path = require('path');
const { compilerOptions } = require('./tsconfig.base.json');
const { cwd } = require('process');

const getTool = (name) => path.join(__dirname, 'tools', name);
const getRoots = () => {
  // Add mocks directory to enable easy loading
  const roots = [path.join(__dirname, '__mocks__')]
  // If we are not running at root, set the src folder
  if (!cwd().endsWith('TheCoin'))
    roots.push(path.join('<rootDir>', 'src'));
  return roots;
}

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        ...compilerOptions,
        // Relax ts restrictions
        noUnusedLocals: false,
        noUnusedParameters: false,
        // typeRoots needs to be set absolutely because we lose the relative import of tsconfig.base.json
        typeRoots: [path.join(__dirname, "node_modules", "@types")],
        // Point rootDir to root to allow compiling (__mocks__ folder)
        rootDir: __dirname,
        // Add multiple rootDirs
        rootDirs: getRoots(),
        // do not write files during testing
        noEmit: true,
      }
    }
  },
  roots: getRoots(),
  // temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
  resolver: getTool('jestExportResolver.js'),

  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$",
  modulePathIgnorePatterns: ["build"],
  // By default, we add the 'src' folder to jest
  moduleDirectories: ['node_modules', 'src', path.join(__dirname, '__mocks__')],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  // Global setup detects presence of firestore emulator
  globalSetup: getTool('jestGlobalSetup.js'),
  // local setup initializes logging etc
  setupFiles: [
    getTool('jestTestSetup.js'),
    getTool('jestMockLocalStorage.js'),
  ]
};
