const path = require('path');
const { compilerOptions } = require('../../../tsconfig.base.json');
const { cwd } = require('process');

const getTool = (name) => path.join(__dirname, name);
const mocks = path.join(__dirname, '../../__mocks__');
const rootFolder = path.join(__dirname, "../../../");

const getRoots = () => [
  mocks,
  cwd().endsWith('TheCoin')
    ? './'
    : '<rootDir>/src'
]

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  verbose: true,
  // transform: {
  //   "^.+\\.tsx?$": "ts-jest",
  //   // transform our built files to be CJS
  //   // ".*build.*\\.m?jsx?$": "jest-esm-transformer",
  //   // Our components are compiled to modules, which are not yet compatible with jest.
  //   // until we update to support ESM, re-process the builds of these two projects.
  //   "libs.shared.build.+\\.jsx?$": "ts-jest",
  //   "libs.site-base.build.+\\.jsx?$": "ts-jest",
  // },
  // extensionsToTreatAsEsm: ['.ts', ".tsx"],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        ...compilerOptions,
        // compile as module
        // module: "CommonJS",
        // Relax ts restrictions
        allowJs: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitAny: false,
        // typeRoots needs to be set absolutely because we lose the relative import of tsconfig.base.json
        typeRoots: [path.join(rootFolder, "node_modules/@types")],
        // Disable incremental (as our tests aren't built anyway)
        incremental: false,
        // Point rootDir to root to allow compiling (__mocks__ folder)
        rootDir: rootFolder,
        // do not write files during testing
        noEmit: true,
      },
      astTransformers: {
        before: [
          {
            path: '@formatjs/ts-transformer/ts-jest-integration',
            options: {
              // options
              overrideIdFn: '[sha512:contenthash:base64:6]',
              ast: true,
            },
          },
        ],
      },
    }
  },
  roots: getRoots(),
  // temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
  resolver: getTool('resolver.js'),

  // testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$",
  // modulePathIgnorePatterns: ["build"],
  // By default, we add the 'src' folder to jest
  moduleDirectories: ['node_modules', 'src', mocks],
  // moduleFileExtensions: [
  //   "ts",
  //   "tsx",
  //   "js",
  //   "jsx",
  //   "json",
  //   "node"
  // ],
  // Global setup detects presence of firestore emulator
  globalSetup: getTool('globalSetup.js'),
  // local setup initializes logging etc
  setupFiles: [
    getTool('testSetup.js'),
    getTool('mockLocalStorage.js'),
  ]
};
