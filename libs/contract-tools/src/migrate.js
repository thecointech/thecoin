#! node

const { spawn } = require("child_process");
const path = require("path");

function migrate(network) {
  console.log(`Migrating to ${network}`);
  const truffleCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'truffle');
  return spawn(truffleCmd,
    [
      `migrate`,
      `--config=${__dirname}/truffle.js`,
      `--network ${network}`
    ],
    { stdio: 'inherit', shell: true, cwd: process.cwd() }
  );
}

migrate("polygon")
  .then(() => {
    if (process.env.CONFIG_NAME != "devlive") {
      migrate("ethereum");
    }
  })

