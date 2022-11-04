import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { GetContract as getCore } from "@thecointech/contract-core"
import { getContract as getOracle } from "@thecointech/contract-oracle"
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

async function main() {

  const owner = await getSigner("Owner");

  // this contract depends on the core contract & oracle
  const tcCore = await getCore();
  const oracle = await getOracle();

  const UberConverter = await hre.ethers.getContractFactory("UberConverter", owner);
  const uberConverter = await UberConverter.deploy(tcCore.address, oracle.address);
  log.info(`Deployed UberConverter at ${uberConverter.address}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), "polygon", uberConverter.address);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
