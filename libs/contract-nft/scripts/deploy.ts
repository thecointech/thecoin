import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getProvider } from '@thecointech/ethers-provider';
import { getArguments } from './arguments';
import type { Network } from '@thecointech/contract-base';
import '@nomicfoundation/hardhat-ethers';

async function main() {
  const network = hre.config.defaultNetwork;
  const name = getName(network);

  let owner = await getSigner("Owner");
  if (!owner.provider) {
    const provider = getProvider(network.toUpperCase() as Network);
    owner = owner.connect(provider);
  }

  const deployArgs = await getArguments(network)
  const TheGreenNFT = await hre.ethers.getContractFactory(name as "TheGreenNFTL2", owner);
  const theGreenNFT = await TheGreenNFT.deploy(...deployArgs);
  const theGreenNFTAddress = await theGreenNFT.getAddress();
  log.info(`Deployed ${name} at ${theGreenNFTAddress} with args: ${deployArgs}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), network, theGreenNFTAddress);
}

const getName = (network: string) =>
  network === 'ethereum'
  ? "TheGreenNFTL1"
  : "TheGreenNFTL2";

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
