import { NamedAccounts, toNamedAccounts } from "./accounts";
import { MINTER_ROLE, MRFREEZE_ROLE, BROKER_ROLE, PLUGINMGR_ROLE } from "../src/constants";
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
  const { TheCoin, Minter, BrokerCAD, TCManager, Police } = accounts;

  await proxy.grantRole(MINTER_ROLE, Minter, { from: TheCoin });
  console.log(`Set Minter: ${Minter}`);

  await proxy.grantRole(BROKER_ROLE, BrokerCAD, { from: TheCoin });
  console.log(`Set Broker: ${BrokerCAD}`);

  await proxy.grantRole(MRFREEZE_ROLE, Police, { from: TheCoin });
  console.log(`Set MrFreeze: ${Police}`);

  await proxy.grantRole(PLUGINMGR_ROLE, TheCoin, { from: TheCoin });
  console.log(`Set PluginMgr: ${TheCoin}`);
}

module.exports = deploy;
