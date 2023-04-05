import { Plugins } from './Plugins';
import { SetupAccount } from './Setup';

// export const TheCoinRoutes = {
//   balance: Balance,
//   purchase: Purchase,
//   mint: Mint,
// }

export const AccountRoutes = {
  ".": SetupAccount,
  plugins: Plugins,
  // fallback: SetupAccount
}

export const AccountRouter = () => <SetupAccount />
// export const accountRoutes: RouteObject[] = [
//   {
//     path: "account",
//     element: <SetupAccount />,
//     // children: [
//     //   {
//     //     index: true,
//     //     element: <Step0 />,
//     //   },
//     //   {
//     //     path: "1",
//     //     element: <h1>Dashboard</h1>,
//     //   },
//     //   {
//     //     path: "2",
//     //     element: <h1>About</h1>,
//     //   },
//     // ]
//   }
// ]
