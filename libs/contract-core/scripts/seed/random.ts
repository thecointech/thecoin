import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { DateTime } from 'luxon';
import { COIN_EXP, ConnectContract, GetContract, PERMISSION_BALANCE } from '../../src';
import {assignRoles} from './assignRoles';

import { RoundNumber__factory } from "../../src/types/factories/contracts/plugins";
import { getContract } from '@thecointech/contract-oracle';

const theCoin = await getSigner("TheCoin");
const minter = await getSigner("Minter");
const brokerCAD = await getSigner("BrokerCAD");
const client1 = await getSigner("client1");
const client2 = await getSigner("client2");

const tcCore = await ConnectContract(theCoin);
const mtCore = await ConnectContract(minter);

export async function randomDistribution() {

  const tcAddr = await theCoin.getAddress();
  const tcBal = await tcCore.balanceOf(tcAddr);
  if (tcBal.toNumber() === 0) {
    await mtCore.mintCoins(100000 * COIN_EXP, tcAddr, Date.now());
  }

  if (client1) await seedAccount(tcAddr, await client1.getAddress());
  if (client2) await seedAccount(tcAddr, await client2.getAddress());
  // Also seed TestAccNoT so we can test tx's with a wallet vs a signer
  await seedAccount(tcAddr, "0x445758e37f47b44e05e74ee4799f3469de62a2cb", true);

  // Send a decent amount to BrokerCAD
  await tcCore.runCloneTransfer(tcAddr, await brokerCAD.getAddress(), 50000 * COIN_EXP, 0, 0);
}

async function seedAccount(tcAddr: string, client: string, onlyBuy=false) {

  // Assign ~15 transactions to client randomly in the past
  log.info("Seeding account: " + client);
  const now = DateTime.local();

  for (
    let ts = now.minus({ years: 1 });
    ts < now;
    ts = ts.plus({ days: 45 * Math.random() })
  ) {
    // either purchase or sell up to 100 coins
    const amount = Math.floor(Math.random() * 100 * COIN_EXP);
    const balance = await tcCore.balanceOf(client);
    const timestamp = Math.floor(ts.toMillis());
    if (onlyBuy || balance.toNumber() <= amount || Math.random() < 0.6) {
      await tcCore.runCloneTransfer(tcAddr, client, amount, 0, timestamp);
    }
    else {
      // TODO: Our redemption function is not gass-less.  We need
      // to unify our functionality to enable processing these functions
      await tcCore.runCloneTransfer(client, tcAddr, amount, 0, timestamp);
    }
  }
}

async function setRoundPlugin() {
  const clientAddr = await client2.getAddress();
  const existingPlugins = await tcCore.getUsersPlugins(clientAddr);
  if (existingPlugins.length === 0) {
    // Finally, assign a plugin to one of the signers (just for testing purposes)
    const factory = new RoundNumber__factory(tcCore.signer);
    const oracle = await getContract();
    const deployed = await factory.deploy(oracle.address);

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
    for (let i = 0; i < amounts.length; i++) {
      await deployed.setRoundPoint(amounts[i], weeksAgoSecs(amounts.length - i));
    }
  }
}

const contract = await GetContract();
log.info(`Initializing core: ${contract.address} with random values`);

await assignRoles(contract);
await randomDistribution();
await setRoundPlugin();
