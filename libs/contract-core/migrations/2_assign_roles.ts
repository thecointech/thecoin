import { NamedAccounts, toNamedAccounts } from "./accounts";
import { MINTER_ROLE, MRFREEZE_ROLE, BROKER_ROLE, PLUGINMGR_ROLE, THECOIN_ROLE } from "../src/constants";
import { getDeployed } from './deploy';
import { MigrationStep } from './step';
import { TheCoinInstance } from './types/TheCoin'
import { log } from '@thecointech/logging';

const deploy: MigrationStep = (artifacts) =>
  async (_, network, accounts) => {
    const contract = await getDeployed(artifacts, network)
    const namedAccounts = toNamedAccounts(accounts);
    await assignRoles(contract, namedAccounts);
  };

async function assignRoles(proxy: TheCoinInstance, { TheCoin, Minter, BrokerCAD, Police }: NamedAccounts) {
  log.trace('Assigning roles...');

  await proxy.grantRole(MINTER_ROLE, Minter, { from: TheCoin });
  log.info(`Set Minter: ${Minter}`);

  await proxy.grantRole(BROKER_ROLE, BrokerCAD, { from: TheCoin });
  log.info(`Set Broker: ${BrokerCAD}`);

  await proxy.grantRole(MRFREEZE_ROLE, Police, { from: TheCoin });
  log.info(`Set MrFreeze: ${Police}`);

  await proxy.grantRole(PLUGINMGR_ROLE, TheCoin, { from: TheCoin });
  log.info(`Set PluginMgr: ${TheCoin}`);
}

module.exports = deploy;
