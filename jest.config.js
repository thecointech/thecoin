const path = require('path');
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.base.json');

const pathsRelativeTo = `${path.join(__dirname, compilerOptions.baseUrl)}/`;

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
  globalSetup: path.join(__dirname, 'tools', 'jestGlobalSetup.js'),
  setupFiles: [ 
    path.join(__dirname, 'tools', 'jestTestSetup.js'),
  ]
  // setupFiles: [
  //   './mocks/localStorage.js'
  // ]
};
