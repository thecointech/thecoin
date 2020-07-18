const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  // globals: {
  //   'ts-jest': {
  //     tsConfig: "tsconfig.base.json"
  //   }
  // },
  //testEnvironment: "jest-environment-uint8array",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(j|t)sx?$",
  modulePathIgnorePatterns: ["build"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix:"/src/TheCoin/"}),
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  globalSetup: path.join(__dirname, 'tools', 'jestGlobalSetup.js')
  // setupFiles: [
  //   './mocks/localStorage.js'
  // ]
};
