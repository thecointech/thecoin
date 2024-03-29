import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';

async function main() {
  // BrokerCAD directly owns this contract (and associated benefits)
  const brokerCAD = await getDeploySigner("BrokerCAD");
  const deployArgs = await getArguments();
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', brokerCAD);
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
