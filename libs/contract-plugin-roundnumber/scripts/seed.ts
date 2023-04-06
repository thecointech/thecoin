import { getSigner } from '@thecointech/signers';
import { ConnectContract } from '@thecointech/contract-core';
import { ALL_PERMISSIONS, PERMISSION_BALANCE, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { log } from '@thecointech/logging';
import { getContract } from '../src/contract';
import { DateTime } from 'luxon';

async function main() {
  // Only deploy this in DevLive(?)
  if (process.env.CONFIG_NAME !== "devlive") return;


  const client2 = await getSigner("client2");
  const theCoin = await getSigner("TheCoin");
  const brokerCad = await getSigner("BrokerCAD");
  const tcCore = await ConnectContract(theCoin);
  const bcCore = await ConnectContract(brokerCad);
  const clientAddr = await client2.getAddress();
  const existingPlugins = await tcCore.getUsersPlugins(clientAddr);

  if (existingPlugins.length === 0) {

    log.debug("Seeding RoundNumber");

    const deployed = await getContract();
    const request = await buildAssignPluginRequest(client2, deployed.address, ALL_PERMISSIONS);
    const assigned = await assignPlugin(bcCore, request);
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
