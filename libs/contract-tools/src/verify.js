#! node

require('../../../tools/setenv');
const { spawn } = require("child_process");
const path = require("path");

function verify(network) {
  const config = process.env.CONFIG_NAME;
  if (!config) {
    throw new Error("Cannot verify contract in development env");
  }
  const cwd = process.cwd();
  const file = `${cwd}/src/deployed/${config}-${network}.json`;
  const {contract} = require(file);
  return spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'truffle'),
    [
        `run verify TheGreenNFTL2@${contract}`,
        ` --config=${__dirname}/truffle.js`,
        `--network ${network}`
    ],
    { stdio: 'inherit', shell: true, cwd }
  );
}

if (process.env.NODE_ENV === 'production') {
  verify("polygon")
    .then(() => verify("ethereum"));
}
