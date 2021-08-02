import { Balance } from '@thecointech/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from '../Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from '../gmail';
import { ClientSelect } from './Clients/ClientSelect';

export const BrokerCADRoutes = {
  balance: Balance,
  purchase: Purchase,
  eTransfer: ETransfers,
  billing: BillPayments,
  verify: VerifyAccount,
  autoPurchase: Gmail,
  clients: ClientSelect
}

