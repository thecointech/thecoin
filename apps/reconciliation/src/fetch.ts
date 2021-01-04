import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from './firestore';
import { RbcApi } from '@the-coin/rbcapi';
import { addFromDB } from '@the-coin/tx-processing/deposit/addFromDB';
import { addFromBank } from '@the-coin/tx-processing/deposit/addFromBank';
import { addFromBlockchain } from '@the-coin/tx-processing/deposit/addFromBlockchain';
import { TransactionRecord } from './types';
import { UserAction } from '@the-coin/utilities/User';
// import { AddSettlementDate } from '@the-coin/tx-processing/base/utils';
// import { IFxRates } from '@the-coin/shared/containers/FxRate/types';
// import { DepositData } from '@the-coin/tx-processing';

export async function fetchAllRecords(rbcApi: RbcApi) {

  let eTransfers = await fetchETransferRecords();
  let dbs = await addFromDB([]);
  let bank = await addFromBank([], rbcApi);

  // Fetch relevant fx rates
  //const rates =
  //r = await addSettlementDate(r, fxApi);

  const bc = await addFromBlockchain(account.history, rates);
}

// async function addSettlementDate(deposits: DepositData[], fxApi: IFxRates) {
//   for (let i = 0; i < deposits.length; i++) {
//     const d = deposits[i];
//     await AddSettlementDate(d.record, fxApi)
//   }
//   return deposits;
// }


async function fetchETransferRecords(): Promise<TransactionRecord[]> {
  const emails = await fetchETransfers();
  return emails.map(email => ({
    action: "Buy",
    email,
  }));
}

