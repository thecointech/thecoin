const jest = require('jest');
const { exit, cwd } = require('process');
const { join } = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { argv } = yargs(hideBin(process.argv));

const options = {
  projects: [cwd()],
  ...argv,
};

// hard-code the link to the hardhat config file.
// This sidesteps all the issues with ESM modules that
// popup when we try to reference the TS files in jest
process.env.HARDHAT_CONFIG = join(__dirname, '../../contract-tools/build/hardhat.config.js');

jest
  .runCLI(options, options.projects)
  .then((success) => {
    exit(0);
  })
  .catch((failure) => {
    console.error(failure);
    exit(0);
  });
