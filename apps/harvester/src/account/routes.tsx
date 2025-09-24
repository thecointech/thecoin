import { AccountState } from '@thecointech/account';
import { Login } from './Login';
import { Plugins } from './Plugins';
import { Upload } from './Upload';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getData, Key } from '@/Training/data';


const converter = await getUberContract();
const converterAddress = await converter.getAddress();

export const groupKey = "account";

export const routes = [
  {
    component: Upload,
    title: "Load Account",
    description: "Upload the wallet to harvest into",
    isComplete: (data?: AccountState) => !!data?.signer,
  },
  {
    component: Login,
    title: "Login",
    description: "Give access to the account",
    isComplete: (data?: AccountState) => !!data?.contract,
  },
  {
    component: Plugins,
    title: "Plugins",
    description: "Add functionality required",
    isComplete: (data?: AccountState) => (
      !!data?.plugins?.some(p => p.address === converterAddress) ||
      !!getData(Key.pluginCnvrtRequested)
    )
  },
]

export const path = {
  groupKey,
  routes,
}
