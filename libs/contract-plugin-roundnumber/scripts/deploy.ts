import hre from 'hardhat';
import { writePlugin } from '../internal/writePlugin';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getArguments } from './arguments';

async function main() {

  // Only deploy this in DevLive(?)
  if (process.env.CONFIG_NAME !== "devlive") return;

  const owner = await getSigner("Owner");

  const deployArgs = await getArguments();
  const RoundNumber = await hre.ethers.getContractFactory("RoundNumber", owner);
  const roundNumber = await RoundNumber.deploy(...deployArgs);
  log.info(`Deployed RoundNumber at ${roundNumber.address} with args: ${deployArgs}`);

  // Store this contract for later use(?)
  writePlugin(import.meta.url, roundNumber.address, "RoundNumber.sol");
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
