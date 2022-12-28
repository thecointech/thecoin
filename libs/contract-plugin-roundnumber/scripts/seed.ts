import { getSigner } from '@thecointech/signers';
import { ConnectContract, PERMISSION_BALANCE } from '@thecointech/contract-core';
import { log } from '@thecointech/logging';
import { getContract } from '../src/contract';
import { DateTime } from 'luxon';

async function main() {
  // Only deploy this in DevLive(?)
  if (process.env.CONFIG_NAME !== "devlive") return;


  const client2 = await getSigner("client2");
  const theCoin = await getSigner("TheCoin");
  const tcCore = await ConnectContract(theCoin);
  const clientAddr = await client2.getAddress();
  const existingPlugins = await tcCore.getUsersPlugins(clientAddr);

  if (existingPlugins.length === 0) {

    log.debug("Seeding RoundNumber");

    const deployed = await getContract();
    const assigned = await tcCore.pl_assignPlugin(clientAddr, deployed.address, PERMISSION_BALANCE, "0x1234");
    await assigned.wait();

    // Set the rounding amount for several times in the past, this
    // exercises the updating state due to logged changes
    const amounts = [
      100,
      150,
      75,
      25,
      125,
    ];
    const weeksAgoSecs = (weeks: number) => Math.round(DateTime.now().minus({weeks}).toSeconds());
    const rnUser = deployed.connect(client2);
    for (let i = 0; i < amounts.length; i++) {
      await rnUser.setRoundPoint(amounts[i], weeksAgoSecs(amounts.length - i));
    }
  }
}

main()
