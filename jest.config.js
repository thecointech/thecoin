const path = require('path');
const { compilerOptions } = require('./tsconfig.base.json');

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
      }
    }
  },

  // temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
  resolver: path.join(__dirname, './tools/jestExportResolver.js'),

  // Test environment is required when running jest tests
  // with firestore emulator connection. See
  // https://github.com/firebase/firebase-js-sdk/issues/2701
  testEnvironment: "jest-environment-uint8array",

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
  globalSetup: path.join(__dirname, 'tools', 'jestGlobalSetup.js'),
  // local setup initializes logging etc
  setupFiles: [
    path.join(__dirname, 'tools', 'jestTestSetup.js'),
  ]
};
