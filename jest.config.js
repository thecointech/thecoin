const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.base.json');

const pathsRelativeTo = `${path.join(__dirname, compilerOptions.baseUrl)}/`;

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },

  // Test environment is required when running jest tests
  // with firestore emulator connection. See
  // https://github.com/firebase/firebase-js-sdk/issues/2701
  testEnvironment: "jest-environment-uint8array",

  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$",
  modulePathIgnorePatterns: ["build"],
  // By default, we add the 'src' folder to jest
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: pathsRelativeTo}),
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
    //   './mocks/localStorage.js'
  ]
};
