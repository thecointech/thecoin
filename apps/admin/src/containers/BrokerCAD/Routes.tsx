import { Balance } from '@thecointech/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from '../Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from '../gmail';
import { AllClients } from './Clients';
import { Incomplete } from './Incomplete';
import type { RouteObject } from 'react-router';

export const routesBrokerCAD = [
  {
    path: "balance",
    element: <Balance />
  },
  {
    path: "purchase",
    element: <Purchase />
  },
  {
    path: "eTransfer",
    element: <ETransfers />
  },
  {
    path: "billing",
    element: <BillPayments />
  },
  {
    path: "incomplete",
    element: <Incomplete />
  },
  {
    path: "verify",
    element: <VerifyAccount />
  },
  {
    path: "autoPurchase",
    element: <Gmail />
  },
  {
    path: "clients",
    element: <AllClients />
  },
] as const satisfies RouteObject[]
