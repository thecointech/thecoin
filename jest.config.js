const path = require('path');
const { compilerOptions } = require('./tsconfig.base.json');
const getTool = (name) => path.join(__dirname, 'tools', name);

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  globals: {
    'ts-jest': {
      tsConfig: {
        ...compilerOptions,
        noUnusedLocals: false,
        noUnusedParameters: false,
        typeRoots: [path.join(__dirname, "node_modules", "@types")],
        incremental: true,
        tsBuildInfoFile: '.tsbuildinfo',
      }
    }
  },

  // temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
  resolver: getTool('jestExportResolver.js'),

  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$",
  modulePathIgnorePatterns: ["build"],
  // By default, we add the 'src' folder to jest
  moduleDirectories: ['node_modules', 'src'],
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
