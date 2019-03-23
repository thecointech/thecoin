module.exports = {
  "roots": [
    "<rootDir>/exchange"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testEnvironment": "node",
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.jsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
}