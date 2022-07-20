#!/usr/bin/env node --experimental-vm-modules --no-warnings

const jest = require("jest");
const { exit, cwd } = require("process");

const last = process.argv[process.argv.length - 1];
const testMatch = (
  process.argv.length > 2 &&
  !last.startsWith("--")
)
  ? [`**/${last}`]
  : undefined;

const options = {
  projects: [cwd()],
  runInBand: process.argv.includes("--runInBand"),
  forceExit: process.argv.includes("--forceExit"),
  testMatch,
};

jest
  .runCLI(options, options.projects)
  .then((success) => {
    exit(0);
  })
  .catch((failure) => {
    console.error(failure);
    exit(0);
  });
