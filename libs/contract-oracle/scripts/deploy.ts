import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
// import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getSigner } from '@thecointech/signers';

async function main() {

  const owner = await getSigner("OracleUpdater")
  const contractArgs = await getArguments()
  const Oracle = await hre.ethers.getContractFactory("SpxCadOracle", owner);
  const oracle = await hre.upgrades.deployProxy(Oracle, contractArgs);
  const deployedAddress = await oracle.getAddress();
  log.info(`Deployed SpxCadOracle at ${deployedAddress}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), "polygon", deployedAddress);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
