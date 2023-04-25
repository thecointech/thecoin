import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

async function main() {

  const owner = await getDeploySigner("OracleUpdater")
  const contractArgs = await getArguments()
  const Oracle = await hre.ethers.getContractFactory("SpxCadOracle", owner);
  const oracle = await hre.upgrades.deployProxy(Oracle, contractArgs);
  log.info(`Deployed SpxCadOracle at ${oracle.address}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), "polygon", oracle.address);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
