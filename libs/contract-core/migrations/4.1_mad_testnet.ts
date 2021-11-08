import { COIN_EXP } from "../src";
import { NamedAccounts } from "./accounts";
import { TheCoin } from './deploy';

// Because we don't know where the system is deploying to
export async function initializeTestNet(proxy: TheCoin, accounts: NamedAccounts) {

  // For testnet: we immediately mint 10K coins
  console.log("Minting coins");
  const balance = 10000 * COIN_EXP;
  await proxy.mintCoins(balance, 0, {from: accounts.Minter });

  // The coins are all in TheCoin's account.  Lets move them to BrokerCAD
  console.log("Transfer to BrokerCAD");
  const timestamp = Math.floor(Date.now() / 1000);
  proxy.exactTransfer(accounts.TheCoin, accounts.BrokerCAD, balance, timestamp, { from: accounts.TheCoin });

  // TODO: Replicate live account statuses
}
