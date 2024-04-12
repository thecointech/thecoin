import hre from 'hardhat';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getArguments } from './arguments';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';

async function main() {

  // Who owns the converter?  Probably Owner?
  const owner = await getDeploySigner("Owner");
  const deployArgs = await getArguments();
  const UberConverter = await hre.ethers.getContractFactory("UberConverter", owner);
  const uberConverter = await hre.upgrades.deployProxy(UberConverter, deployArgs, {
    timeout: 5 * 60 * 1000
  });
  log.info(`Deployed UberConverter at ${uberConverter.address} with args: ${deployArgs}`);

  // Serialize our contract addresses
  const contractUrl = new URL('../contracts/UberConverter.sol', import.meta.url);
  writePlugin(uberConverter.address, contractUrl);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
