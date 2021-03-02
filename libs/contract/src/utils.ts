import { TheCoinInstance } from "../types/truffle-contracts";

export const COIN_EXP = 1000000;

/// Convert account array from Ganache etc into named accounts for each role
export const namedAccounts = (accounts: string[]) => {
  const [acOwner, acTheCoin, acTCManager, acMinter, acPolice, BrokerCAD, BrokerTransferAssistant, client1, client2, client3] = accounts;
  return {
    acOwner,
    acTheCoin,
    acTCManager,
    acMinter,
    acPolice,
    BrokerCAD,
    BrokerTransferAssistant,
    client1,
    client2,
    client3,
  }
}

export const setMinter = async (proxy: TheCoinInstance, acMinter: string, acTheCoin: string) => {
  await proxy.setMinter(acMinter, { from: acTheCoin });
  await proxy.acceptMinter({ from: acMinter });
}
