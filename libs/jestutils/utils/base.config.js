const path = require('path');

const getTool = (name) => path.join(__dirname, name);
const mocks = path.join(__dirname, '../../__mocks__');

module.exports = {
  preset: 'ts-jest/presets/default-esm',
  verbose: true,
  testTimeout: 15 * 1000,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.tests.json",
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
      },
    ],
  },

  // By default, we add the 'src' folder to jest
  moduleDirectories: [mocks, '<rootDir>/src', 'node_modules'],
  // Mock styling (easier than parsing them)
  moduleNameMapper: {
    "@thecointech/site-semantic-theme/variables": getTool('mockLessVars.mjs'),
    '\\.(css|less|svg)$': getTool('styleMock'),
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  roots: [
    mocks,
    '<rootDir>/src',
  ],
  // temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
  resolver: getTool('resolver.js'),

  // Global setup detects presence of firestore emulator
  globalSetup: getTool('globalSetup.js'),
  // local setup initializes logging etc
  setupFiles: [
    getTool('testSetup.js'),
    getTool('mockLocalStorage.js'),
    getTool('setupLuxon.mjs'),
  ]
};
