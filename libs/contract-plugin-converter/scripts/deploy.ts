import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
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
  storeContractAddress(new URL(import.meta.url), "polygon", uberConverter.address);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
