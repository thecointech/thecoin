import { NamedAccounts, toNamedAccounts } from "./accounts";
import { MigrationStep } from './step';
import { getContract, TheCoin } from './deploy';

const deploy: MigrationStep = () =>
  async (deployer, network, accounts) => {
    const contract = await getContract(deployer, network);
    const namedAccounts = toNamedAccounts(accounts);
    await assignRoles(contract, namedAccounts);
  };

async function assignRoles(proxy: TheCoin, accounts: NamedAccounts) {
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
