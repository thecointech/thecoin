import { Balance } from '@thecointech/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from '../Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from '../gmail';
import { AllClients } from './Clients';
import { Incomplete } from './Incomplete';

export const BrokerCADRoutes = {
  balance: Balance,
  purchase: Purchase,
  eTransfer: ETransfers,
  billing: BillPayments,
  incomplete: Incomplete,
  verify: VerifyAccount,
  autoPurchase: Gmail,
  clients: AllClients,
}

