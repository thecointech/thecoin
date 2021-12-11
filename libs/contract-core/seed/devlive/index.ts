import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { ConnectContract, TheCoin, COIN_EXP } from '@thecointech/contract-core';
import { getSigner } from '@thecointech/signers';

export async function devliveDistribution() {

  const theCoin = await getSigner("TheCoin");
  const minter = await getSigner("Minter");
  const brokerCAD = await getSigner("BrokerCAD");
  const client1 = await getSigner("client1");
  const client2 = await getSigner("client2");

  const tcCore = ConnectContract(theCoin);
  const mtCore = ConnectContract(minter);

  const tcAddr = await theCoin.getAddress();
  const tcBal = await tcCore.balanceOf(await tcAddr);
  if (tcBal.toNumber() === 0) {
    await mtCore.mintCoins(100000 * COIN_EXP, tcAddr, Date.now());
  }

  if (client1) await seedAccount(tcCore, tcAddr, await client1.getAddress());
  if (client2) await seedAccount(tcCore, tcAddr, await client2.getAddress());
  // Also seed TestAccNoT so we can test tx's with a wallet vs a signer
  await seedAccount(tcCore, tcAddr, "0x445758e37f47b44e05e74ee4799f3469de62a2cb", true);

  // Send a decent amount to BrokerCAD
  await tcCore.runCloneTransfer(tcAddr, await brokerCAD.getAddress(), 50000 * COIN_EXP, 0, 0);
}

async function seedAccount(tcCore: TheCoin, tcAddr: string, client: string, onlyBuy=false) {

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