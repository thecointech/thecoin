import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContract as getOracle } from "@thecointech/contract-oracle"

async function main() {

  // Only deploy this in DevLive(?)
  if (process.env.CONFIG_NAME !== "devlive") return;

  const owner = await getSigner("Owner");

  const oracle = await getOracle();
  const RoundNumber = await hre.ethers.getContractFactory("RoundNumber", owner);
  const roundNumber = await RoundNumber.deploy(oracle.address);
  log.info(`Deployed RoundNumber at ${roundNumber.address} with args: ${oracle.address}`);

  // Store this contract for later use(?)
  const contractUrl = new URL('../contracts/RoundNumber.sol', import.meta.url);
  writePlugin(roundNumber.address, contractUrl);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
