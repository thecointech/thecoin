import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import { writePlugin } from '@thecointech/contract-plugins/writePlugin';
import { getSigner } from '@thecointech/signers';
import { log } from '@thecointech/logging';
import { getProvider } from '@thecointech/ethers-provider';
import { getArguments } from './arguments';
import { fetchRate, weSellAt } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import { ConnectContract } from '@thecointech/contract-core';
import Decimal from 'decimal.js-light';

async function main() {
  // BrokerCAD directly owns this contract (and associated benefits)
  let brokerCAD = await getSigner('BrokerCAD');
  // If not devlive, then add a provider
  if (hre.network.config.chainId !== 31337) {
    const provider = getProvider();
    brokerCAD = brokerCAD.connect(provider);
  }

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
  await bcCore.exactTransfer(shockAbsorber.address, coin.toNumber(), now.getTime());
}

main().catch((error) => {
  log.error(error);
  process.exitCode = 1;
});
