import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getOverrideFees } from '@thecointech/contract-tools/gasTools';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getProvider } from '@thecointech/ethers-provider';
import { BigNumber } from 'ethers';

async function main() {

  let owner = await getSigner("OracleUpdater");
  // If not devlive, then add a provider
  if (hre.network.config.chainId != 31337) {
    const provider = getProvider();
    owner = owner.connect(provider);
    const fees = await getOverrideFees(provider);
    provider.getFeeData = async () => {
      // const fees = await getOverrideFees(this);
      return fees;
    }
  }
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
