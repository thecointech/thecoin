import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { getContract } from '@thecointech/contract-plugin-shockabsorber';
// Assume devlive
if (process.env.CONFIG_NAME !== 'devlive') throw new Error('Not Sufficiently Tested');

log.debug('Seeding ShockAbsorber');
async function main() {
  const tester = await getSigner("uberTester");
  const theCoin = await getSigner("TheCoin");
  const testAddress = await tester.getAddress();

  const tcCore = await ConnectContract(theCoin);
  const shockAbsorber = await getContract();

  // In DevLive, we assign the converter to uberTester
  await tcCore.pl_assignPlugin(testAddress, shockAbsorber.address, ALL_PERMISSIONS, "0x1234");
}

main();
