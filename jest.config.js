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
  ]
  // setupFiles: [
  //   './mocks/localStorage.js'
  // ]
};
