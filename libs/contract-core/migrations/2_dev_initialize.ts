import { NamedAccounts, toNamedAccounts } from "./accounts";
import { getDeployed } from './deploy';
import { MigrationStep } from './step';
import { TheCoinInstance } from './types/TheCoin'

const deploy: MigrationStep = (artifacts) =>
  async (_, network, accounts) => {
    const contract = await getDeployed(artifacts, network)
    const namedAccounts = toNamedAccounts(accounts);
    await assignRoles(contract, namedAccounts);
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
}

module.exports = deploy;
