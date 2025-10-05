import { AccountState } from '@thecointech/account';
import { Login } from './Login';
import { Plugins } from './Plugins';
import { Upload } from './Upload';
import { getContract as getUberContract } from '@thecointech/contract-plugin-converter';
import { getData, Key } from '@/Training/data';
import { Connect } from './Connect';
import { useLocation } from 'react-router';
import { Path } from '@/SimplePath/types';

const converter = await getUberContract();
const converterAddress = await converter.getAddress();

export const groupKey = "account";

const connect = {
    component: Connect,
    title: "Connect",
    description: "Connect to TheCoin",
    isComplete: (data?: AccountState) => !!data?.signer,
  }
const plugin = {
    component: Plugins,
    title: "Plugins",
    description: "Add functionality required",
    isComplete: (data?: AccountState) => (
      !!data?.plugins?.some(p => p.address === converterAddress) ||
      (!!data?.address && data?.address == getData(Key.pluginCnvrtRequested))
    )
}

const manualRoutes = [
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
]

// export const path: Path<AccountState> = {
//   groupKey,
//   routes,
// }


export const useAccountPath = () : Path<AccountState|undefined> => {
  const location = useLocation();
  if (location.search.includes("manual")) {
    return {
      groupKey,
      routes: [
        connect,
        ...manualRoutes,
        plugin,
      ],
    }
  }
  return {
    groupKey,
    routes: [
      connect,
      plugin,
    ],
  };
}
