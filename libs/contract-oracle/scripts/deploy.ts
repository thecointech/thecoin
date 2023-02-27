import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getProvider } from '@thecointech/ethers-provider';

async function main() {

  const provider = getProvider();
  const owner = (await getSigner("OracleUpdater"))
    .connect(provider);
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
