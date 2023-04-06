import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { getContract } from '@thecointech/contract-plugin-shockabsorber';
import { DateTime } from 'luxon';
// Assume devlive
if (process.env.CONFIG_NAME !== 'devlive') throw new Error('Not Sufficiently Tested');

log.debug('Seeding ShockAbsorber');
async function main() {
  const tester = await getSigner("saTester");
  const brokerCad = await getSigner("BrokerCAD");

  const bcCore = await ConnectContract(brokerCad);
  const shockAbsorber = await getContract();

  // In DevLive, we assign the converter to uberTester
  const ts = DateTime.now().minus({ months: 11});
  const request = await buildAssignPluginRequest(tester, shockAbsorber.address, ALL_PERMISSIONS, ts);
  await assignPlugin(bcCore, request);

  await bcCore.exactTransfer(await tester.getAddress(), 200e6, ts.toMillis());
}

main();
