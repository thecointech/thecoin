import hre from 'hardhat';
import { log } from '@thecointech/logging';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { getContractAddress } from '../src';
import { getDeploySigner } from '@thecointech/contract-tools/deploySigner';

async function main() {
  const owner = await getDeploySigner("Owner")

  const network = hre.config.defaultNetwork;
  const name = getName(network);
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
