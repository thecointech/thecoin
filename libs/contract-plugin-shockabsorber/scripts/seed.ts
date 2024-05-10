import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { getContract } from '@thecointech/contract-plugin-shockabsorber';
import { DateTime } from 'luxon';
import { getProvider } from '@thecointech/ethers-provider';
import { fetchRate, weSellAt } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import Decimal from 'decimal.js-light';
import { getOverrideFees } from '@thecointech/contract-base/overrides';
// Assume devlive
if (process.env.CONFIG_NAME !== 'devlive') throw new Error('Not Sufficiently Tested');

log.debug('Seeding ShockAbsorber');
async function main() {
  // BrokerCAD directly owns this contract (and associated benefits)
  const brokerCAD = await getSigner("BrokerCAD");
  const shockAbsorber = await getContract();
  const bcCore = await ConnectContract(brokerCAD);

  // Once deployed, the contract is going to need a bit of funding
  // Transfer $10,000 worth from BrokerCAD immediately.
  const now = new Date();
  const fxRate = await fetchRate(now)
  const sellRate = weSellAt([fxRate], now)
  const coin = toCoinDecimal(
    new Decimal(10_000).div(sellRate)
  );

  const overrides = await getOverrideFees(getProvider());
  await bcCore.exactTransfer(shockAbsorber, coin.toNumber(), now.getTime(), overrides);

  // In DevLive, we assign the converter to uberTester
  const tester = await getSigner("saTester");
  const ts = DateTime.now().minus({ months: 11});
  const request = await buildAssignPluginRequest(tester, shockAbsorber, ALL_PERMISSIONS, ts);
  await assignPlugin(bcCore, request);

  await bcCore.exactTransfer(tester, 200e6, ts.toMillis());
}

main();
