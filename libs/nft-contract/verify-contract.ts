import '../../tools/setenv';
import { spawn } from "child_process";

const network = process.argv[2];
const config = process.env.CONFIG_NAME;

if (!config) {
  console.log("Cannot verify contract in development env");
}

import(`./src/deployed/${config}-${network}.json`)
  .then(({contract}) => {
    console.log(`Verifying: ${contract}`);
    spawn(`yarn`,
      [`truffle run verify TheGreenNFTL2@${contract} --network ${network}`],
      { stdio: 'inherit', shell: true });
  })
