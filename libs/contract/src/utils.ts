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
