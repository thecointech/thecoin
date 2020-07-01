const path = require('path');

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
