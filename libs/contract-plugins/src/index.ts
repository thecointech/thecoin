import Decimal from 'decimal.js-light';
import { getPluginModifier } from './modifier';
import { PluginDetails } from './types';
import { IPluggable } from './codegen/contracts/IPluggable';
export * from './constants';
export * from './types';
export * from './assign';
export * from './remove';

export async function getPluginDetails(tcCore: IPluggable) : Promise<PluginDetails[]>{
  const user = await tcCore.signer.getAddress();
  const plugins = await tcCore.getUsersPlugins(user);
  const details = plugins.map(async (plugin) => ({
    address: plugin.plugin,
    permissions: new Decimal(plugin.permissions.toString()),
    emulator: await getPluginModifier(user, plugin),
  }))
  return Promise.all(details)
}
