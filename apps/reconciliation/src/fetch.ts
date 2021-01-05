import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchBankTransactions } from './bank';
// import { AddSettlementDate } from '@the-coin/tx-processing/base/utils';
// import { IFxRates } from '@the-coin/shared/containers/FxRate/types';
// import { DepositData } from '@the-coin/tx-processing';

export async function fetchAllRecords(rbcApi: RbcApi) {

  let eTransfers = await fetchETransfers();
  let dbs = await getAllFromFirestore();
  let bank = await fetchBankTransactions(rbcApi);
  let blockchain = await fetchBlockchainTransactions();
}
