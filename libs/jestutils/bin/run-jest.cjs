#!/usr/bin/env node --experimental-vm-modules --no-warnings

const jest = require("jest");
const { exit, cwd } = require("process");

const options = {
  projects: [cwd()]
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
