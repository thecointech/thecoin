import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { getContract } from '@thecointech/contract-plugin-shockabsorber';
import { DateTime } from 'luxon';
// Assume devlive
if (process.env.CONFIG_NAME !== 'devlive') throw new Error('Not Sufficiently Tested');

log.debug('Seeding ShockAbsorber');
async function main() {
  const tester = await getSigner("saTester");
  const theCoin = await getSigner("TheCoin");
  const brokerCad = await getSigner("BrokerCAD");
  const testAddress = await tester.getAddress();

  const tcCore = await ConnectContract(theCoin);
  const bcCore = await ConnectContract(brokerCad);
  const shockAbsorber = await getContract();

  // In DevLive, we assign the converter to uberTester
  const ts = Math.floor(DateTime.now().minus({ months: 11}).toMillis());
  await tcCore.pl_assignPlugin(testAddress, ts, shockAbsorber.address, ALL_PERMISSIONS, "0x1234");
  await bcCore.exactTransfer(await tester.getAddress(), 200e6, ts);
}

main();
