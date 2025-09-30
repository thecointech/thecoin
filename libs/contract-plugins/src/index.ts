import Decimal from 'decimal.js-light';
import { getPluginModifier } from './modifier';
import { PluginDetails } from './types';
import { IPluggable } from './codegen/contracts/IPluggable';
import { AddressLike } from 'ethers';
import { log } from '@thecointech/logging';
export * from './constants';
export * from './types';
export * from './assign';
export * from './remove';

export async function getPluginDetails(tcCore: IPluggable, user: AddressLike) : Promise<PluginDetails[]>{
  try {
    const plugins = await tcCore.getUsersPlugins(user);
    const details = plugins.map(async (plugin) => ({
      address: plugin.plugin,
      permissions: new Decimal(plugin.permissions.toString()),
      emulator: await getPluginModifier(user, plugin),
    }))
    return Promise.all(details)
  } catch (e) {
    log.error(e, "Failed to get plugin details");
    return [];
  }
}
