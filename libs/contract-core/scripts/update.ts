import hre from 'hardhat';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContractAddress } from '../src';

async function main() {

  const network = hre.config.defaultNetwork;
  const name = getName(network);
  const owner = await getSigner("Owner");
  const address = await getContractAddress();

  const TheCoin = await hre.ethers.getContractFactory(name, owner);
  const theCoin = await hre.upgrades.upgradeProxy(address, TheCoin);
  log.info(`Updated ${name} at ${theCoin.address}`);
}

const getName = (network: string) =>
  network === 'polygon' || process.env.NODE_ENV !== 'production'
  ? "TheCoinL2"
  : "TheCoinL1";


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
