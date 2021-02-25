
/// Convert account array from Ganache etc into named accounts for each role
export const namedAccounts = (accounts) => {
  const [acOwner, acTheCoin, acTCManager, acMinter, acPolice, client1, client2, client3, ...acRest] = accounts;
  return {
    acOwner,
    acTheCoin,
    acTCManager,
    acMinter,
    acPolice,
    client1,
    client2,
    client3,
    ...acRest
  }
}

export const setMinter = async (proxy, acMinter, acTheCoin) => {
  await proxy.methods.setMinter(acMinter).send({ from: acTheCoin });
  await proxy.methods.acceptMinter().send({ from: acMinter });
}
