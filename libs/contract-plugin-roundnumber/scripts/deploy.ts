import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import '@nomicfoundation/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { ContractOracle } from "@thecointech/contract-oracle"

async function main() {

  // Only deploy this in DevLive(?)
  if (process.env.CONFIG_NAME !== "devlive") return;

  const owner = await getSigner("Owner");

  const oracle = await ContractOracle.get();
  const RoundNumber = await hre.ethers.getContractFactory("RoundNumber", owner);
  const roundNumber = await RoundNumber.deploy(oracle);
  const roundNumberAddress = await roundNumber.getAddress();
  log.info(`Deployed RoundNumber at ${roundNumberAddress} with args: ${await oracle.getAddress()}`);

  // Store this contract for later use(?)
  const contractUrl = new URL('../contracts/RoundNumber.sol', import.meta.url);
  writePlugin(roundNumberAddress, contractUrl);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
