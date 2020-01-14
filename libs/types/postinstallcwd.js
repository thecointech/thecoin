#!/usr/bin/env node

const shell = require("shelljs");
const { realpath } = require('fs');

function YarnPostInstall(err, path) {
  console.log(path);
  shell.cd(path);
  if (shell.exec('yarn postinstallcwd').code !== 0) {
    shell.echo('Error: post-install failed');
    shell.exit(1);
  }
}

realpath('.', YarnPostInstall);
