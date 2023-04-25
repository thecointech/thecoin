import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { log } from '@thecointech/logging';
import { getArguments } from './arguments';
import { fetchRate, weSellAt } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import { ConnectContract } from '@thecointech/contract-core';
import Decimal from 'decimal.js-light';
import { getDeploySigner, getOverrideFees } from '@thecointech/contract-tools/deploySigner';
import { getProvider } from '@thecointech/ethers-provider';
import { getContract } from '../src';

async function main() {
  // BrokerCAD directly owns this contract (and associated benefits)
  const brokerCAD = await getDeploySigner("BrokerCAD");
  const deployArgs = await getArguments();
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber', brokerCAD);
  const shockAbsorber = await hre.upgrades.deployProxy(ShockAbsorber, deployArgs);
  log.info(`Deployed ShockAbsorber at ${shockAbsorber.address} with args: ${deployArgs}`);

  // Serialize our contract addresses
  const contractUrl = new URL('../contracts/ShockAbsorber.sol', import.meta.url);
  writePlugin(shockAbsorber.address, contractUrl);

  // Once deployed, the contract is going to need a bit of funding
  // Transfer $10,000 worth from BrokerCAD immediately.
  const now = new Date();
  const fxRate = await fetchRate(now)
  const sellRate = weSellAt([fxRate], now)
  const coin = toCoinDecimal(
    new Decimal(10_000).div(sellRate)
  );

  const bcCore = await ConnectContract(brokerCAD);
  const overrides = await getOverrideFees(getProvider());
  await bcCore.exactTransfer(shockAbsorber.address, coin.toNumber(), now.getTime(), overrides);
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
