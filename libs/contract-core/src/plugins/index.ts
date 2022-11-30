import Decimal from 'decimal.js-light';
import { getPluginModifier } from './modifier';
import type { TheCoin } from '../types/contracts/TheCoin';
import { PluginDetails } from './types';

export async function getPluginDetails(tcCore: TheCoin) : Promise<PluginDetails[]>{
  const user = await tcCore.signer.getAddress();
  const plugins = await tcCore.getUsersPlugins(user);
  const details = plugins.map(async (plugin) => ({
    address: plugin.plugin,
    permissions: new Decimal(plugin.permissions.toString()),
    emulator: await getPluginModifier(user, plugin),
  }))
  return Promise.all(details)
}
