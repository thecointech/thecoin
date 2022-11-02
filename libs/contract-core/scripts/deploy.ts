import hre from 'hardhat';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';

async function main() {

  const network = hre.config.defaultNetwork;
  const name = getName(network);
  const owner = await getSigner("Owner");

  const contractArgs = await getArguments(network)
  const TheCoin = await hre.ethers.getContractFactory(name, owner);
  const theCoin = await hre.upgrades.deployProxy(TheCoin, contractArgs, { initializer: 'initialize(address _sender, address depositor)'});
  log.info(`Deployed ${name} at ${theCoin.address}`);

  // Serialize our contract addresses
  storeContractAddress(new URL(import.meta.url), network, theCoin.address);
}

const getName = (network: string) =>
  network === 'polygon' || process.env.NODE_ENV !== 'production'
  ? "TheCoinL2"
  : "TheCoinL1";


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
