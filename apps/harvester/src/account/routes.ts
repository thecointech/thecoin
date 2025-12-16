import { AccountState } from '@thecointech/account';
import { Login } from './Login';
import { Plugins } from './Plugins';
import { Upload } from './Upload';
import { ContractConverter } from '@thecointech/contract-plugin-converter';
import { getData, Key } from '@/Training/data';
import { Connect } from './Connect';
import { useLocation } from 'react-router';
// import { Path } from '@/SimplePath/types';
import { NormalizeAddress } from '@thecointech/utilities/Address';
import { Path, Routes } from '@/SimplePath/types';

const converter = await ContractConverter.get();
const converterAddress = await converter.getAddress();

export const groupKey = "account";

// const connect = {
//     component: Connect,
//     title: "Connect",
//     description: "Connect to TheCoin",
//     isComplete: (data?: AccountState) => !!data?.signer,
//   }
// const plugin = {
//     component: Plugins,
//     title: "Plugins",
//     description: "Add functionality required",
//     isComplete: (data?: AccountState) => {
//       return (
//         !!data?.plugins?.some(p => p.address === converterAddress) ||
//         (!!data?.address && (
//           NormalizeAddress(data.address) === getData(Key.pluginCnvrtRequested)
//         ))
//       )
//     }
// }

export const routes = [
  {
    component: Connect,
    path: "connect",
    title: "Connect",
    description: "Connect to TheCoin",
    isComplete: (data?: AccountState) => !!data?.signer,
  },
  {
    component: Upload,
    path: "upload",
    title: "Load Account",
    description: "Upload the wallet to harvest into",
    isComplete: (data?: AccountState) => !!data?.signer,
  },
  {
    component: Login,
    path: "login",
    title: "Login",
    description: "Give access to the account",
    isComplete: (data?: AccountState) => !!data?.contract,
  },
  {
    component: Plugins,
    path: "plugins",
    title: "Plugins",
    description: "Add functionality required",
    isComplete: (data?: AccountState) => {
      return (
        !!data?.plugins?.some(p => p.address === converterAddress) ||
        (!!data?.address && (
          NormalizeAddress(data.address) === getData(Key.pluginCnvrtRequested)
        ))
      )
    },
  }
] as const satisfies Routes<AccountState|undefined>[];

export const path = {
  groupKey,
  routes,
}

export const useAccountPath = () : Path<AccountState|undefined> => {
  const location = useLocation();
  return (location.search.includes("manual")) ? {
    groupKey,
    routes,
  } : {
    groupKey,
    routes: routes.filter((r) => r.path !== "upload" && r.path !== "login"),
  }
}
// export const useAccountPath = () : Path<AccountState|undefined> => {
//   const location = useLocation();
//   if (location.search.includes("manual")) {
//     return {
//       groupKey,
//       routes: [
//         connect,
//         ...manualRoutes,
//         plugin,
//       ],
//     }
//   }
//   return {
//     groupKey,
//     routes: [
//       connect,
//       plugin,
//     ],
//   };
// }
