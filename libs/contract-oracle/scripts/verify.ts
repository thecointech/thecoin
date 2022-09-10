import hre from 'hardhat';
import { getContract } from '../src';
import { getArguments } from './arguments';
import { sleep } from '@thecointech/async';
import { log } from '@thecointech/logging';
import { exit } from 'process';

// Don't run this script if we're not doing a prod-style deployment
if (!process.env.CONFIG_NAME?.startsWith('prod'))
  exit(0);

const network = hre.config.defaultNetwork;
const contract = await getContract();

// Make 5 attempts to verify.  This allows time for
// contract to be picked up by etherscan
for (let i = 0; i < 5; i++) {
  try {
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: await getArguments(),
    });
    log.info(`Verified contract: ${contract.address} on ${network}`);
    break;
  }
  catch (e: any) {
    log.trace(`Error: ${e.message}: ${contract.address} on ${network}`)
    if (e.message == 'Contract source code already verified') break;
    else log.trace(` - waiting ${i} of 5 minutes`)
    await sleep(1 * 60 * 1000);
  }
}
