import { getPluginDetails, ALL_PERMISSIONS } from './index';
import { Wallet } from 'ethers';
import { runModifier } from '../internal/common';
import { IPluggable, PluginAndPermissionsStructOutput } from './codegen/contracts/IPluggable';


it ('Generates a useful modifier', async () => {
  const signer = Wallet.createRandom()

  const [details] = await getPluginDetails(
    {
      signer,
      getUsersPlugins: () => Promise.resolve([{
        plugin: "RoundNumber",
        permissions: ALL_PERMISSIONS,
      } as PluginAndPermissionsStructOutput]),
    } as unknown as IPluggable,
    signer.address
  );
  // run the modifier
  const rfiat = runModifier(details.emulator!, 1999e2, 0);
  expect(rfiat.toNumber()).toBe(1900e2);
})
