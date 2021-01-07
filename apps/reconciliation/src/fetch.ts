import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore, DbRecords } from "@the-coin/tx-firestore";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { TransactionRecord } from 'types';
import { flatten } from 'lodash';
import { UserAction } from '@the-coin/utilities/User';
import { TransferRecord } from '@the-coin/tx-processing/base/types';

// import { AddSettlementDate } from '@the-coin/tx-processing/base/utils';
// import { IFxRates } from '@the-coin/shared/containers/FxRate/types';
// import { DepositData } from '@the-coin/tx-processing';



export async function fetchAllRecords(rbcApi: RbcApi) {

  let eTransfers = await fetchETransfers();
  let dbs = await getAllFromFirestore();
  let bank = await fetchBankTransactions(rbcApi);
  let blockchain = await fetchCoinHistory();

  return {
    eTransfers,
    dbs,
    bank,
    blockchain,
  }
}
