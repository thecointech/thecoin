import hre from 'hardhat';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getProvider } from '@thecointech/ethers-provider';
import { getArguments } from './arguments';

async function main() {
  let owner = await getSigner('TheCoin');
  // If not devlive, then add a provider
  if (hre.network.config.chainId !== 31337) {
    const provider = getProvider();
    owner = owner.connect(provider);
  }

  const deployArgs = await getArguments();
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', owner);
  const shockAbsorber = await hre.upgrades.deployProxy(ShockAbsorber, deployArgs);
  log.info(`Deployed ShockAbsorber at ${shockAbsorber.address} with args: ${deployArgs}`);

  // Serialize our contract addresses
  const contractUrl = new URL('../contracts/ShockAbsorber.sol', import.meta.url);
  writePlugin(shockAbsorber.address, contractUrl);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
