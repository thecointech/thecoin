import { log } from '@thecointech/logging';
import { getSigner } from '@thecointech/signers';
import { DateTime } from 'luxon';
import { COIN_EXP, ContractCore } from '../../src';
import {assignRoles} from './assignRoles';

const theCoin = await getSigner("TheCoin");
const brokerCAD = await getSigner("BrokerCAD");
const Client1 = await getSigner("Client1");
const Client2 = await getSigner("Client2");

const tcCore = await ContractCore.connect("TheCoin");
const mtCore = await ContractCore.connect("Minter");

export async function randomDistribution() {

  const tcAddr = await theCoin.getAddress();
  const tcBal = await tcCore.balanceOf(tcAddr);
  if (tcBal === 0n) {
    await mtCore.mintCoins(100000 * COIN_EXP, tcAddr, Date.now());
  }

  // if (Client1) await seedAccount(tcAddr, await Client1.getAddress());
  // Transfer a constant amount to Client1
  const ts = DateTime.now().minus({ years: 1}).toMillis();
  await tcCore.runCloneTransfer(tcAddr, await Client1.getAddress(), 200e6, 0, Math.floor(ts));
  // Transfer a random amount to client 2
  await seedAccount(tcAddr, await Client2.getAddress());
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
    ts = ts.plus({ days: 65 * Math.random() })
  ) {
    // either purchase or sell up to 100 coins
    const amount = Math.floor(Math.random() * 100 * COIN_EXP);
    const balance = await tcCore.balanceOf(client);
    const timestamp = Math.floor(ts.toMillis());
    if (onlyBuy || balance <= amount || Math.random() < 0.6) {
      await tcCore.runCloneTransfer(tcAddr, client, amount, 0, timestamp);
    }
    else {
      // TODO: Our redemption function is not gass-less.  We need
      // to unify our functionality to enable processing these functions
      await tcCore.runCloneTransfer(client, tcAddr, amount, 0, timestamp);
    }
  }
}

const contract = await ContractCore.get();
log.info(`Initializing core: ${await contract.getAddress()} with random values`);

await assignRoles(contract);
await randomDistribution();
