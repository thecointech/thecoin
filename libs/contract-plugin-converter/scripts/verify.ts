import hre from 'hardhat';
import { ContractConverter } from '../src';
import { sleep } from '@thecointech/async';
import { log } from '@thecointech/logging';
import { exit } from 'process';
import { getProvider } from '@thecointech/ethers-provider';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';

// Don't run this script if we're not doing a prod-style deployment
if (!process.env.CONFIG_NAME?.startsWith('prod'))
  exit(0);

const network = hre.config.defaultNetwork;
const contract = await ContractConverter.get();
const provider = await getProvider();
const contractAddress = await contract.getAddress();

// Make 5 attempts to verify.  This allows time for
// contract to be picked up by etherscan
for (let i = 0; i < 5; i++) {
  try {
    const address = await getImplementationAddress(provider, contractAddress);
    await hre.run("verify:verify", {
      address,
    });
    log.info(`Verified implementation: ${address} on ${network}`);
    break;
  }
  catch (e: any) {
    log.trace(`Error: ${e.message}: ${contractAddress} on ${network}`)
    if (e.message == 'Contract source code already verified') break;
    else log.trace(` - waiting ${i} of 5 minutes`)
    await sleep(1 * 60 * 1000);
  }
}

