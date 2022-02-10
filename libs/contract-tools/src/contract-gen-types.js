#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

function gentypes() {
  const typechainCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'typechain');
  spawn(typechainCmd,
    [`--out-dir ./migrations/types --target=truffle-v5 \"src/contracts/*.json\"`],
    { stdio: 'inherit', shell: true, cwd: process.cwd() }
  );
  spawn(typechainCmd,
    [`--out-dir ./src/types --target=ethers-v5 \"src/contracts/*.json\"`],
    { stdio: 'inherit', shell: true, cwd: process.cwd() }
  );
}

gentypes();