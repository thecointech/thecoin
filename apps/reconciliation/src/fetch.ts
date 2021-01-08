import { fetchETransfers } from '@the-coin/tx-gmail';
import { getAllFromFirestore } from "@the-coin/tx-firestore";
import { RbcApi } from '@the-coin/rbcapi';
import { fetchCoinHistory } from '@the-coin/tx-blockchain/thecoin';
import { fetchBankTransactions } from './bank';
import { AllData } from 'types';

export async function fetchAllRecords(rbcApi: RbcApi) : Promise<AllData>{

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
