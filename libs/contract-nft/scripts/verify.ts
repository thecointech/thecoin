import hre from 'hardhat';
import { ContractNFT } from '../src/contract';
import { getArguments } from './arguments';
import { sleep } from '@thecointech/async';
import type { Network } from '@thecointech/contract-base';
import { log } from '@thecointech/logging';
import { exit } from 'process';

// Don't run this script if we're not doing a prod-style deployment
if (!process.env.CONFIG_NAME?.startsWith('prod'))
  exit(0);

const network = hre.config.defaultNetwork;
const contract = await ContractNFT.get(network.toUpperCase() as Network);
const contractAddress = await contract.getAddress();
// Make 5 attempts to verify.  This allows time for
// contract to be picked up by etherscan
for (let i = 0; i < 5; i++) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: await getArguments(hre.config.defaultNetwork),
    });
    log.info(`Verified contract: ${contractAddress} on ${network}`);
    break;
  }
  catch (e: any) {
    log.trace(`Error: ${e.message}: ${contractAddress} on ${network}`)
    if (e.message == 'Contract source code already verified') break;
    else log.trace(` - waiting ${i} of 5 minutes`)
    await sleep(1 * 60 * 1000);
  }
}
