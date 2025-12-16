import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { AccountId } from '@thecointech/signers';
import { BrokerCAD, routesBrokerCAD } from '../BrokerCAD';
import { TheCoin, routesTheCoin } from '../TheCoinAccount';
import { App } from './index';
import type { RouteObject } from 'react-router';

export const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: AccountId.TheCoin.toString(),
        element: <TheCoin />,
        children: routesTheCoin
      },
      {
        path: AccountId.BrokerCAD.toString(),
        element: <BrokerCAD />,
        children: routesBrokerCAD
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
] as const satisfies RouteObject[]
