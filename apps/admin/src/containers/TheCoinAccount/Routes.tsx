import { Balance } from '@thecointech/shared/containers/Balance';
import { Purchase } from '../Purchase';
import { Mint } from './Mint';
import type { RouteObject } from 'react-router';

export const routesTheCoin = [
  {
    path: "balance",
    element: <Balance />
  },
  {
    path: "purchase",
    element: <Purchase />
  },
  {
    path: "mint",
    element: <Mint />
  }
] as const satisfies RouteObject[]

