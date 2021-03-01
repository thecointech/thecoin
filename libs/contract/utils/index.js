
/// Convert account array from Ganache etc into named accounts for each role
module.exports = {
  namedAccounts: (accounts) => {
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
  },

  setMinter: async (proxy, acMinter, acTheCoin) => {
    await proxy.setMinter(acMinter, { from: acTheCoin });
    await proxy.acceptMinter({ from: acMinter });
  }
}
