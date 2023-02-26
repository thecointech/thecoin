import hre from 'hardhat';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getArguments } from './arguments';

async function main() {

  // Who owns the converter?  Probably Owner?
  const owner = await getSigner("Owner");


  const deployArgs = await getArguments();
  const UberConverter = await hre.ethers.getContractFactory("UberConverter", owner);
  const uberConverter = await UberConverter.deploy(...deployArgs);
  log.info(`Deployed UberConverter at ${uberConverter.address} with args: ${deployArgs}`);

  // Serialize our contract addresses
  const contractUrl = new URL('../contracts/UberConverter.sol', import.meta.url);
  writePlugin(uberConverter.address, contractUrl);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
