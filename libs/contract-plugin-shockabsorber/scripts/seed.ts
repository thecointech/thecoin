import { getSigner } from '@thecointech/signers';
import { ContractCore } from '@thecointech/contract-core';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { ContractShockAbsorber } from '@thecointech/contract-plugin-shockabsorber';
import { DateTime } from 'luxon';
import { fetchRate, weSellAt } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import Decimal from 'decimal.js-light';
import { getOverrideFees } from '@thecointech/contract-base/overrides';
import { ContractOracle } from '@thecointech/contract-oracle';

log.debug('Seeding ShockAbsorber');
async function main() {
  // BrokerCAD directly owns this contract (and associated benefits)
  const brokerCAD = await getSigner("BrokerCAD");
  const shockAbsorber = await ContractShockAbsorber.get();
  const bcCore = await ContractCore.connect(brokerCAD);

  // Once deployed, the contract is going to need a bit of funding
  // Transfer $10,000 worth from BrokerCAD immediately.
  const now = new Date();
  const fxRate = await fetchRate(now)
  const sellRate = weSellAt([fxRate], now)
  const coin = toCoinDecimal(
    new Decimal(10_000).div(sellRate)
  );

  await bcCore.exactTransfer(shockAbsorber, coin.toNumber(), now.getTime());

  if (process.env.CONFIG_NAME == 'devlive') {
    // Find the 3-month period where the price has dropped the most since inception
    const ts = await findLargestDrop();
    const tester = await getSigner("SaTester");
    const request = await buildAssignPluginRequest(tester, shockAbsorber, ALL_PERMISSIONS, ts);
    await assignPlugin(bcCore, request);

    await bcCore.exactTransfer(tester, 200e6, ts.toMillis());
  }
}

async function findLargestDrop() {
  const oracle = await ContractOracle.get();
  const rates = await oracle.getRates();
  const interval = await oracle.BLOCK_TIME();
  const initialTimestamp = await oracle.INITIAL_TIMESTAMP();
  const OneWeek = (7 * 24 * 60 * 60 * 1000) / Number(interval);
  const ThreeMonths = (90 * 24 * 60 * 60 * 1000) / Number(interval);
  let maxDrop = 0n;
  let maxDropIndex = 0;
  for (let i = 0; i < rates.length; i += OneWeek) {
    const rate = rates[i];
    if (i + ThreeMonths > rates.length) break;
    const nextRate = rates[i + ThreeMonths];
    if (nextRate < rate) {
      const drop = rate - nextRate;
      if (drop > maxDrop) {
        maxDrop = drop;
        maxDropIndex = i;
      }
    }
  }
  return DateTime.fromMillis(
    Number(initialTimestamp) + (maxDropIndex * Number(interval))
  );
}

main();
