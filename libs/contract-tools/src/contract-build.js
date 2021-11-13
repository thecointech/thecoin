#! node

const { spawn } = require("child_process");
const path = require("path");

const truffleCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'truffle');
return spawn(truffleCmd,
  [
    `compile`,
    `--config=${__dirname}/truffle.js`
  ],
  { stdio: 'inherit', shell: true, cwd: process.cwd() }
);
