#! node

const { spawn } = require("child_process");
const path = require("path");

function migrate(network) {
  console.log(`Migrating to ${network}`);
  const truffleCmd = path.join(__dirname, '..', 'node_modules', '.bin', 'truffle');
  const child = spawn(truffleCmd,
    [
      `migrate`,
      `--config=${__dirname}/truffle.js`,
      `--network ${network}`,
      '--reset'
    ],
    { stdio: 'inherit', shell: true, cwd: process.cwd() }
  );
  return new Promise(resolve => child.on("close", resolve));
}

(async () => {
  await migrate("polygon");
  if (process.env.CONFIG_NAME != "devlive") {
    await migrate("ethereum");
  }
})()
