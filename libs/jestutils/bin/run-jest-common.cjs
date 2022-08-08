const jest = require("jest");
const { exit, cwd } = require("process");
const { join } = require('path');

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

// hard-code the link to the hardhat config file.
// This sidesteps all the issues with ESM modules that
// popup when we try to reference the TS files in jest
process.env.HARDHAT_CONFIG = join(__dirname, "../../contract-tools/build/hardhat.config.js");

jest
  .runCLI(options, options.projects)
  .then((success) => {
    exit(0);
  })
  .catch((failure) => {
    console.error(failure);
    exit(0);
  });
