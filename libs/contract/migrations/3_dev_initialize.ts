import { NamedAccounts, toNamedAccounts } from "./accounts";
import { TheCoinInstance } from "./types/TheCoin";
import { MigrationStep } from './types';

const deploy: MigrationStep = (artifacts) =>
  async (_, _network, accounts) => {
    const contract = artifacts.require("TheCoin");
    const proxy = await contract.deployed();
    const namedAccounts = toNamedAccounts(accounts);
    await assignRoles(proxy, namedAccounts);
  };

async function assignRoles(proxy: TheCoinInstance, accounts: NamedAccounts) {
  console.log('Assigning roles...');
  const { TheCoin, Minter, TCManager, Police } = accounts;

  await proxy.setMinter(Minter, { from: TheCoin });
  await proxy.acceptMinter({ from: Minter });
  console.log(`Set Minter: ${Minter}`);

  await proxy.setPolice(Police, { from: TheCoin });
  await proxy.acceptPolice({ from: Police });
  console.log(`Set Police: ${Police}`);

  await proxy.setTapCapManager(TCManager, { from: TheCoin });
  await proxy.acceptTapCapManager({ from: TCManager });
  console.log(`Set TCManager: ${TCManager}`);
}


module.exports = deploy;
