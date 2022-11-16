import { TheCoin } from '@thecointech/contract-core';

export async function getPluginDetails(tcCore: TheCoin) : Promise<any[]>{
  const user = await tcCore.signer.getAddress();
  const plugins = await tcCore.getUsersPlugins(user);
  for (const plugin of plugins) {
    const modifier = await 
    console.log(JSON.stringify(plugin));
  }
  return plugins
}
